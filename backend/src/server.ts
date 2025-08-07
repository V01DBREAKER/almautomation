import fs from 'node:fs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { serve } from "bun";
import { requestALM, requestLLM, convertAuthBasic } from './apiFunctions';
import index from "../../frontend/dist/index.html";


// move to config (EXTERNAL)
const alm_base_url = "https://rb-alm-14-p.de.bosch.com/ccm";
const alm_login_url = "https://rb-alm-14-p.de.bosch.com/jts";
const llm_url = "https://aoai-farm.bosch-temp.com/api/openai/deployments";

const auth_secret = fs.readFileSync('./secrets/auth.key');

dotenv.config({path: 'secrets/.env'})
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const PORT = Number(process.env.PORT) || 3001;

// replace with tokens from DNG
// temp login database token:Buffer.from(`${username}:${password}`).toString('base64')
const loginDatabase:Map<string, string> = new Map()

type protoResponse = {
    status: number;
    headers: Headers;
    body: BodyInit;
    locals: Partial<{
      user: string
    }>
}

type MiddleWare = (req: Request, pass: protoResponse) => Response | void;
type RouteHandler = (req: Request, pass: protoResponse) => Response;
type AsyncRouteHandler = (req: Request, pass: protoResponse) => Promise<Response>;
type chainableFunctions = [...MiddleWare[], RouteHandler|AsyncRouteHandler];

class functionChain {
  constructor(public functionStack: chainableFunctions) {}

  run = async(req: Request, pass:protoResponse) => {
    const next = (index:number)=>{
      if (this.functionStack.length-1 > index){
        const nextFunction = this.functionStack[index]
        const result = nextFunction(req, pass)
        if (result)
          return result
        return next(index+1)
      } else {
        const nextFunction = this.functionStack[index] as RouteHandler | AsyncRouteHandler
        return nextFunction(req, pass)
      }
    }
    return next(0)
  }

}

const createResponse = (status:number, headers: Headers, body: object) => 
  new Response(JSON.stringify(body), {headers:headers, status:status});


// Enable CORS for frontend
const corsMiddleware:MiddleWare = (req, pass) => {
  const responseHeaders = new Headers();
  responseHeaders.set("Access-Control-Allow-Origin", `http://localhost:${PORT}`);
  responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  responseHeaders.set("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: responseHeaders,
    });
  }

  pass.headers = responseHeaders;
};

const authenticateToken:MiddleWare = (req, pass) => {
    const token = req.headers.get('authorization');
    if (!token) {
        pass.headers
        return createResponse(401, pass.headers, {error: "No token, unauthorized"})
    };

    jwt.verify(token, auth_secret, (err, user) => {
        if (err) return createResponse(401, pass.headers, {error:"Token is no longer valid"});
        if (typeof user !== 'string' && user?.username) {
            pass.locals.user = user.username;
        } else {
            return createResponse(401, pass.headers, {error:"Token is invalid or malformed"})
        };
    });
}

const loginRoute:AsyncRouteHandler = async (req, pass) => {
  const data = await req.json();
  const basicAuth = convertAuthBasic(data.username, data.password)
  const [api_status, api_body] = await requestALM(alm_login_url, basicAuth)
  try {
      if (api_status === 200){
          console.log(`User: ${data.username} logged in.`);
          const token = jwt.sign({username: data.username}, auth_secret, { expiresIn: '8h' });
          loginDatabase.set(data.username, basicAuth)
          return createResponse(200, pass.headers, {token: token});
      } else {
          console.error(`Error during authentication (${api_status}): ${api_body}`);
          return createResponse(api_status, pass.headers, { error: 'Authentication failed' });
      }
  } catch(error) {
      console.error('Error during API call:', error);
      return createResponse(500, pass.headers, { error: 'Internal server error' });
  };
}

const almRoute:AsyncRouteHandler = async (req, pass) => {
    const url = alm_base_url + req.url; 
    console.log(`Fetching: ${url}`)
    const auth = loginDatabase.get(pass.locals.user!);
    if (auth === undefined) return new Promise((res)=>createResponse(401, pass.headers, {error: "Token invalid."}))
    return requestALM(url, auth!).then(([api_status, api_body]) => {
        if (api_status === 200){
          return createResponse(200, pass.headers, {user: pass.locals.user, api: api_body})
        } else {
          console.error('Error during fetch:', api_body);
          return createResponse(api_status, pass.headers, { user: pass.locals.user, error: 'Fetch error', api: api_body })
        }
    }).catch((err)=>{
      return createResponse(500, pass.headers, {error: err})
    });
}

const aiRoute:AsyncRouteHandler = async (req, pass) =>{
  const url = llm_url + req.url;
  const { context, prompt } = await req.json()
  console.log(`Fetching: ${url}`)
  const auth = loginDatabase.get(pass.locals.user!);
  if (auth === undefined) return new Promise((res)=>createResponse(401, pass.headers, {error: "Token invalid."}))
  return requestLLM(url, context, prompt).then(([api_status, api_body]) => {
    if (api_status === 200){
      return createResponse(200, pass.headers, {user: pass.locals.user, api: api_body}); // Send XML response directly
    } else {
      console.error('Error during fetch:', api_body);
      return createResponse(api_status, pass.headers, { user: pass.locals.user, error: 'Fetch error', api: api_body })
    }
  });
}


// https://bun.com/docs/api/http#bun-serve
// https://bun.com/docs/bundler/executables

// Start the server
const server = serve({
  routes: {
    "/api/alm": {
      POST: (req)=>
        (new functionChain([corsMiddleware, authenticateToken, almRoute]))
        .run(req, {status: 404, headers:new Headers(), body: "", locals: {}})
      },
    "/api/login": {
      POST: (req)=>
        (new functionChain([corsMiddleware, loginRoute]))
        .run(req, {status: 404, headers:new Headers(), body: "", locals: {}})
      },
    "/api/ai": {
      POST: (req)=>
        (new functionChain([corsMiddleware, authenticateToken, aiRoute]))
        .run(req, {status: 404, headers:new Headers(), body: "", locals: {}})
      },
    "/*": index,
    },
  port: PORT,
});

console.log(`Server running at http://localhost:${server.port}`);