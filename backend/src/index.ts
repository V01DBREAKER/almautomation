import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import https from 'node:https';
import { ProxyAgent, Agent, fetch } from 'undici'; // axios wasnt working and request is deprecated
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'node:path';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
dotenv.config({path: 'secrets/.env'})
const alm_base_url = "https://rb-alm-14-p.de.bosch.com/ccm";
const alm_login_url = "https://rb-alm-14-p.de.bosch.com/jts";
const llm_url = "https://aoai-farm.bosch-temp.com/api/openai/deployments";

// replace with tokens from DNG
// temp login database token:Buffer.from(`${username}:${password}`).toString('base64')
const loginDatabase:Map<string, string> = new Map()

// Load SSL certificates
const certificates = {
    key: fs.readFileSync('./secrets/server.key'), // Path to your private key
    cert: fs.readFileSync('./secrets/server.cert'), // Path to your certificate
};

const convertAuthBasic = (username:string, password: string) => 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

const auth_secret = fs.readFileSync('./secrets/auth.key');

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:5222', // Allow only React frontend origin
    credentials: true // Allow credentials to be included
}));

// Middleware to parse JSON bodies
app.use(express.json());


// Request function
const requestALM = async (url: string, auth: string): Promise<[number, string]> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Ensure proper headers
                'Accept': 'application/xml', // Request XML response
                'Authorization': auth,
            },
            // Use undici's fetch with custom agent
            dispatcher: new Agent({
                connect: { rejectUnauthorized: false } // Ignore self-signed certificate
            })
        });

        const responseBody = await response.text(); // Fetch response body as text
        return [response.status, responseBody];
    } catch (error) {
        console.error('Error:', error);
        return [500, String(error)];
    }
};

const requestLLM = async (url:string, context:string, prompt:string):Promise<[number, string]> => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'genaiplatform-farm-subscription-key': process.env.API_KEY
            },
            body: JSON.stringify({
            messages: [
                { role: 'system', content: context },
                { role: 'user', content: [{ type: 'text', text: prompt }] }
            ],
            max_tokens: 4096,
            stream: false
            }),
            dispatcher: new ProxyAgent({ uri: 'http://127.0.0.1:3128' })
        });

        const responseBody = await response.text(); // Fetch response body as text
        return [response.status, responseBody];
    } catch (error) {
        console.error('Error:', error);
        return [500, String(error)];
    }
};

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization;

    if (!token) return res.sendStatus(401); // No token, unauthorized

    jwt.verify(token, auth_secret, (err, user) => {
        if (err) return res.sendStatus(401); // Token is no longer valid
        if (typeof user !== 'string' && user?.username) {
            res.locals.user = user.username;
        } else {
            return res.sendStatus(401); // Token is invalid or malformed
        }
        next(); // Proceed to the next middleware or route handler
    });
}

// Proxy route
app.use('/api', authenticateToken, (req, res) => {
    const url = alm_base_url + req.url; 
    console.log(`Fetching: ${url}`)
    const auth = loginDatabase.get(res.locals.user);
    if (auth === undefined) return res.status(401).send({ error: 'Token Invalid'});
    requestALM(url, auth!).then(([api_status, api_body]) => {
        if (api_status === 200){
            res.status(200).send({user: res.locals.user, api: api_body}); // Send XML response directly
        } else {
            console.error('Error during fetch:', api_body);
            res.status(api_status).send({ user: res.locals.user, error: 'Fetch error', api: api_body });
        }
    });
});


app.use('/login', (req, res) => {
    try {
        const data = req.body;
        const basicAuth = convertAuthBasic(data.username, data.password)
        requestALM(alm_login_url, basicAuth).then(([api_status, api_body]) => {
            if (api_status === 200){
                console.log(`User: ${data.username} logged in.`);
                const token = jwt.sign({username: data.username}, auth_secret, { expiresIn: '8h' });
                loginDatabase.set(data.username, basicAuth)
                res.status(200).json({token: token});
            } else {
                console.error(`Error during authentication (${api_status}): ${api_body}`);
                res.status(api_status).send({ error: 'Authentication failed' });
            }
        }).catch(error => {
            console.error('Error during API call:', error);
            res.status(500).send({ error: 'Internal server error' });
        });
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(400).send({ error: 'Invalid format' });
    }
});

app.use('/ai', authenticateToken, (req, res) => {
    const url = llm_url + req.url;
    const { context, prompt } = req.body
    console.log(`Fetching: ${url}`)
    const auth = loginDatabase.get(res.locals.user);
    if (auth === undefined) return res.status(401).send({ error: 'Token Invalid'});
    requestLLM(url, context, prompt).then(([api_status, api_body]) => {
        if (api_status === 200){
            res.status(200).send({user: res.locals.user, api: api_body}); // Send XML response directly
        } else {
            console.error('Error during fetch:', api_body);
            res.status(api_status).send({ user: res.locals.user, error: 'Fetch error', api: api_body });
        }
    });
})

// Create an HTTPS server using the SSL certificates
const httpsServer = https.createServer(certificates, app);
const startServer = (port: number) => {
    httpsServer.listen(port, () => {
        console.log(`Proxy server running on https://localhost:${port}`);
    }).on('error', (err) => {
        if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use. Trying port ${port + 1}...`);
            startServer(port + 1); // Try the next port
        } else {
            console.error(err)
        }
    });
};

startServer(PORT)


