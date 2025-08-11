import fs from 'node:fs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { serve, BunRequest } from "bun";
import { requestALM, requestLLM, convertAuthBasic } from './apiFunctions';
import { generateSecrets } from './keyGen';
import index from "../../frontend/dist/index.html";

// move to config (EXTERNAL)
const alm_base_url = "https://rb-alm-14-p.de.bosch.com/ccm";
const alm_login_url = "https://rb-alm-14-p.de.bosch.com/jts";
const llm_url = "https://aoai-farm.bosch-temp.com/api/openai/deployments";

let auth_key: Buffer;
let auth_cert: Buffer;
await(async ()=>{
  const authKeyPath = 'secrets';
  if (!fs.existsSync(authKeyPath)) {
    await generateSecrets();
  }
  auth_key = fs.readFileSync(authKeyPath + '/auth.key');
  auth_cert = fs.readFileSync(authKeyPath + '/auth.cert')
})()

dotenv.config({path: 'secrets/.env'})
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_PORT = Number(process.argv[2]) || PORT;
const HOST_FRONTEND = !(process.argv[3]==="false");


// replace with tokens from DNG
// temp login database token:Buffer.from(`${username}:${password}`).toString('base64')
const loginDatabase:Map<string, string> = new Map()

type protoResponse = {
    path: string;
    status: number;
    headers: Headers;
    body: BodyInit;
    locals: Partial<{
      user: string
    }>
}

type MiddleWare = (req: BunRequest, pass: protoResponse) => Response | void;
type RouteHandler = (req: BunRequest, pass: protoResponse) => Response;
type AsyncRouteHandler = (req: BunRequest, pass: protoResponse) => Promise<Response>;
type chainableFunctions = [...MiddleWare[], RouteHandler|AsyncRouteHandler];

class functionChain {
  constructor(public functionStack: chainableFunctions) {}

  run = async(req: BunRequest, pass:protoResponse) => {
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

const corsPrefight = (req: BunRequest) => {
  const header = new Headers();
  header.set("Access-Control-Allow-Origin", `http://localhost:${FRONTEND_PORT}`);
  header.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  header.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  header.set("Access-Control-Allow-Credentials", "true");
  return new Response(null, {
    status: 204,
    headers: header
  })
}

// Enable CORS for frontend
const corsMiddleware:MiddleWare = (req, pass) => {
  pass.headers.set("Access-Control-Allow-Origin", `http://localhost:${FRONTEND_PORT}`);
  pass.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  pass.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  pass.headers.set("Access-Control-Allow-Credentials", "true");
  pass.headers = pass.headers;
};

const authenticateToken:MiddleWare = (req, pass) => {
    const token = req.headers.get('authorization');
    if (!token) {
        pass.headers
        return createResponse(401, pass.headers, {error: "No token, unauthorized"})
    };

    jwt.verify(token, auth_cert, (err, user) => {
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
          const token = jwt.sign({username: data.username}, auth_key, { algorithm: 'RS256', expiresIn: '8h' });
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
    const url = alm_base_url + pass.path
    console.log(`Fetching: ${url}`)
    const auth = loginDatabase.get(pass.locals.user!);
    if (auth === undefined) return new Promise(()=>createResponse(401, pass.headers, {error: "Token invalid."}))
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
  const url = llm_url + pass.path;
  const { context, prompt } = await req.json()
  console.log(`Fetching: ${url}`)
  const auth = loginDatabase.get(pass.locals.user!);
  if (auth === undefined) return new Promise(()=>createResponse(401, pass.headers, {error: "Token invalid."}))
  return requestLLM(url, context, prompt).then(([api_status, api_body]) => {
    if (api_status === 200){
      return createResponse(200, pass.headers, {user: pass.locals.user, api: api_body}); // Send JSON response directly
    } else {
      console.error('Error during fetch:', api_body);
      return createResponse(api_status, pass.headers, { user: pass.locals.user, error: 'Fetch error', api: api_body })
    }
  });
}

const getPath = (url:string, route: string): string => {
  const base_url = `http://localhost:${PORT}`;
  return url.slice((base_url+route).length+1)
}

// Start the server
const server = serve({
  routes: {
    "/api/alm/*": {
      POST: (req)=>
        (new functionChain([corsMiddleware, authenticateToken, almRoute]))
        .run(req, {status: 404, headers:new Headers(), body: "", locals: {}, path: getPath(req.url, "/api/alm")})
    },
    "/api/login": {
      POST: (req)=>
        (new functionChain([corsMiddleware, loginRoute]))
        .run(req, {status: 404, headers:new Headers(), body: "", locals: {}, path: getPath(req.url, "/api/login")})
    },
    "/api/ai/*": {
      POST: (req)=>
        (new functionChain([corsMiddleware, authenticateToken, aiRoute]))
        .run(req, {status: 404, headers:new Headers(), body: "", locals: {}, path: getPath(req.url, "/api/ai")})
    },
    "/api/*": {
      OPTIONS: (req) => corsPrefight(req)
    },
     "/*": HOST_FRONTEND ? index : {
      GET: (req) => new Response(`Error 404: You'll need to build the frontend or if running the frontend separately go to http://localhost:${FRONTEND_PORT}`, {status: 404})
     },
    },
  port: PORT,
  tls: {
    key: Bun.file('secrets/server.key'),
    cert: Bun.file('secrets/server.cert')
  }
});

console.log(`Server running at https://localhost:${server.port}`);