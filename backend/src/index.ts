import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import https from 'node:https';
import { Agent, fetch } from 'undici'; // axios wasnt working and request is deprecated
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;
const base_url = "https://rb-alm-14-p.de.bosch.com/ccm";
const login_url = "https://rb-alm-14-p.de.bosch.com/jts";

// replace with tokens from DNG
// temp login database token:Buffer.from(`${username}:${password}`).toString('base64')
const loginDatabase:Map<string, string> = new Map()

// Load SSL certificates
const certificates = {
    key: fs.readFileSync('../secrets/server.key'), // Path to your private key
    cert: fs.readFileSync('../secrets/server.cert'), // Path to your certificate
};

const convertAuthBasic = (username:string, password: string) => 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

const auth_secret = fs.readFileSync('../secrets/auth.key');

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:5173', // Allow only React frontend origin
    credentials: true // Allow credentials to be included
}));

// Request function
const pollAPI = async (url: string, auth: string): Promise<[number, string]> => {
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

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization;

    if (!token) return res.sendStatus(401); // No token, unauthorized

    jwt.verify(token, auth_secret, (err, user) => {
        if (err) return res.sendStatus(403); // Token is no longer valid
        if (typeof user !== 'string' && user?.username) {
            res.locals.user = user.username;
        } else {
            return res.sendStatus(403); // Token is invalid or malformed
        }
        next(); // Proceed to the next middleware or route handler
    });
}

// Proxy route
app.use('/api', authenticateToken, (req, res) => {
    const url = base_url + req.url; 
    console.log(`Fetching: ${url}`)
    const auth = loginDatabase.get(res.locals.user);
    if (auth === undefined) return res.status(403).send({ error: 'Token Invalid'});
    pollAPI(url, auth!).then(([api_status, api_body]) => {
        if (api_status === 200){
            res.status(200).send(api_body); // Send XML response directly
        } else {
            console.error('Error during authentication:', api_body);
            res.status(api_status).send({ error: 'Authentication failed' });
        }
    });
});


app.use('/login', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const basicAuth = convertAuthBasic(data.username, data.password)
            pollAPI(login_url, basicAuth).then(([api_status, api_body]) => {
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
});

// Create an HTTPS server using the SSL certificates
const httpsServer = https.createServer(certificates, app);
httpsServer.listen(PORT, () => {
    console.log(`Proxy server running on https://localhost:${PORT}`);
});