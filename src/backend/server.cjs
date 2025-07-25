const express = require('express');
const request = require('request');
const cors = require('cors');
const https = require('https');
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3001;
const base_url = "https://rb-alm-14-p.de.bosch.com/ccm/rpt/repository"


// Load SSL certificates
const certificates = {
    key: fs.readFileSync('server.key'), // Path to your private key
    cert: fs.readFileSync('server.cert'), // Path to your certificate
};

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Allow only your React app's origin
    credentials: true // Allow credentials to be included
}));

// Request function
const pollAPI = async (url, username, password) => {
    const authOptions = {
        url: url,
        method: 'GET',
        auth: {
            username: username,
            password: password
        },
        headers: {
            'Content-Type': 'application/json', // Ensure proper headers
            'Accept': 'application/xml' // Request XML response
        },
        rejectUnauthorized: false // Ignore self-signed certificate
    };

    return new Promise((resolve, reject) => {
        request(authOptions, (error, response, body) => {
            if (error) {
                console.error('Error:', error);
                resolve([500, response, error]);
            } else {
                resolve([response.statusCode, response, body]);
            }
        });
    });
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
        pollAPI(url, data.username, data.password).then(([api_status, api_res, api_body]) => {
            if (api_status === 500) {
                console.error('Error during authentication:', api_body);
                res.status(500).send({ error: 'Authentication failed' });
            } else if (api_status === 401) {
                console.error('Unauthorized access:', api_body);
                res.status(401).send({ error: 'Unauthorized access' });
            } else {
                res.status(api_status).send(api_res); // Send XML response directly
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
        let data;
        try {
            data = JSON.parse(body);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(400).send({ error: 'Invalid format' });
        }

        pollAPI(base_url, data.username, data.password).then(([api_status, api_res, api_body]) => {
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
    });
});

// Create an HTTPS server using the SSL certificates
const httpsServer = https.createServer(certificates, app);
httpsServer.listen(PORT, () => {
    console.log(`Proxy server running on https://localhost:${PORT}`);
});