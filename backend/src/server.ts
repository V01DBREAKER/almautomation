import fs from 'node:fs';
import dotenv from 'dotenv';

import { serve } from "bun";
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

// Enable CORS for frontend
const corsMiddleware = (req: Request) => {
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

  return responseHeaders;
};




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