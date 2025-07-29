# ALMAutomation

This repo's plan is to create a standalone server which can pull from the ALM Api and create metrics.

Runs with React/TS/Vite frontend and Node.js backend

`npm install` in `./frontend` and `./backend` to install the node modules
Generate secrets in `./secrets` using `openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365`
Generate a third key for user auth `./secrets/auth.key` using ssh-keygen

To run, use 2 terminals, one in `./frontend` on in `./backend`
frontend: `npm run dev` which launches the frontend at http://localhost:5173
backend: `npm start` which launches the backend at https://localhost:3001

Currently just a proof of concept and is not secure.