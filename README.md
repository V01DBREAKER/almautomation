# ALMAutomation

This repo's plan is to create a standalone client which can pull from the ALM Api and create metrics.

`npm install` to install the node modules
Generate secrets in `./secrets` using `openssl req -nodes -new -x509 -keyout ./secrets/server.key -out ./secrets/server.cert -days 365`
Get an API key for the LLM farm and add it to `secrets/.env` under `API_KEY=your_api_key`
Generate a third key for user auth `openssl req -nodes -new -x509 -keyout ./secrets/auth.key`

To run use `bun run all` and open `localhost:5222`

Runs with React/TS/Vite frontend at `localhost:5222`, Express/TS backend at `localhost:3001` and Electron for browser.

If using AI features, you will need to be using RB Local Proxy Manager and running PX through it to local proxy.\
Get your LLM Farm key [here](https://inside-docupedia.bosch.com/confluence2/genaiplatform/llm-farm-372737736.html).

Currently this program uses basic authentication, we plan to move to a better system in future.