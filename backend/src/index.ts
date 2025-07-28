import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import https from 'node:https';
import { Agent, fetch } from 'undici'; // axios wasnt working and request is deprecated

const app = express();
const PORT = process.env.PORT || 3001;
const base_url = "https://rb-alm-14-p.de.bosch.com/ccm/rpt/repository"


// Load SSL certificates
const certificates = {
    key: fs.readFileSync('../secrets/server.key'), // Path to your private key
    cert: fs.readFileSync('../secrets/server.cert'), // Path to your certificate
};

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Allow only your React app's origin
    credentials: true // Allow credentials to be included
}));

// Request function
const pollAPI = async (url: string, username: string, password: string): Promise<[number, string]> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Ensure proper headers
                'Accept': 'application/xml', // Request XML response
                'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
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

// Proxy route
app.use('/api', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
        let data;
        try {
            data = JSON.parse(body);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(400).send({ error: 'Invalid format' });
        }
        const url = base_url + req.url; // Replace with your API URL
        console.log(url)
        pollAPI(url, data.username, data.password).then(([api_status, api_body]) => {
            if (api_status === 500) {
                console.error('Error during authentication:', api_body);
                res.status(500).send({ error: 'Authentication failed' });
            } else if (api_status === 401) {
                console.error('Unauthorized access:', api_body);
                res.status(401).send({ error: 'Unauthorized access' });
            } else {
                res.status(api_status).send(api_body); // Send XML response directly
            }
        });
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
            pollAPI(base_url, data.username, data.password).then(([api_status, api_body]) => {
            if (api_status === 500) {
                console.error('Error during authentication:', api_body);
                res.status(500).send({ error: 'Authentication failed' });
            } else if (api_status === 401) {
                console.error('Unauthorized access:', api_body);
                res.status(401).send({ error: 'Unauthorized access' });
            } else {
                console.log(`User: ${data.username} logged in.`)
                res.status(api_status).send(api_body); // Send XML response directly
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