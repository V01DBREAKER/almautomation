import fs from 'node:fs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { serve } from "bun";
import { requestALM, requestLLM } from './apiFunctions';
import index from "../frontend/dist/index.html";


// move to config (EXTERNAL)
const alm_base_url = "https://rb-alm-14-p.de.bosch.com/ccm";
const alm_login_url = "https://rb-alm-14-p.de.bosch.com/jts";
const llm_url = "https://aoai-farm.bosch-temp.com/api/openai/deployments";


// Load SSL certificates (EXTERNAL)
const certificates = {
    key: fs.readFileSync('./secrets/server.key'), // Path to your private key
    cert: fs.readFileSync('./secrets/server.cert'), // Path to your certificate
};
const auth_secret = fs.readFileSync('./secrets/auth.key');

dotenv.config({path: 'secrets/.env'})

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
type chainableFunctions = [...MiddleWare[], RouteHandler];

class functionChain {
  constructor(public functionStack: chainableFunctions) {}

  run(req: Request, pass:protoResponse) {
    const next = (index:number)=>{
      if (this.functionStack.length-1 > index){
        const nextFunction = this.functionStack[index]
        const result = nextFunction(req, pass)
        if (result)
          return result
        return next(index+1)
      } else {
        const nextFunction = this.functionStack[index] as RouteHandler
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
        return new Response("No token, unauthorized", {headers: pass.headers, status: 401})
    };

    jwt.verify(token, auth_secret, (err, user) => {
        if (err) return new Response("Token is no longer valid", {headers: pass.headers, status: 401})
        if (typeof user !== 'string' && user?.username) {
            pass.locals.user = user.username;
        } else {
            return createResponse({error:"Token is invalid or malformed"}, {headers: pass.headers, status: 401})
        }
    });
}

const apiRoute:RouteHandler = (req, pass) => {
    const url = alm_base_url + req.url; 
    console.log(`Fetching: ${url}`)
    const auth = loginDatabase.get(pass.locals.user!);
    if (auth === undefined) return new Response(JSON.stringify({error: 'Token Invalid'}), {headers: pass.headers, status: 401});
    requestALM(url, auth!).then(([api_status, api_body]) => {
        if (api_status === 200){
            res.status(200).send({user: res.locals.user, api: api_body}); // Send XML response directly
        } else {
            console.error('Error during fetch:', api_body);
            res.status(api_status).send({ user: res.locals.user, error: 'Fetch error', api: api_body });
        }
    });
    return new Response()
}


// https://bun.com/docs/api/http#bun-serve
// https://bun.com/docs/bundler/executables

// Start the server
const server = serve({
  routes: {
  "/": index,
  "/api/hello": {
    GET: (req: Request) => {
      const headers = corsMiddleware(req);
      return new Response(JSON.stringify({ message: "Hello from API" }), {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      });
    },
  },
};
  port: PORT,
});

console.log(`Server running at http://localhost:${server.port}`);