# ALMAutomation

This repo's plan is to create a standalone client which can pull from the ALM Api and create metrics.

### Prerequisites:
To run AI features you'll need an LLM farm key and RB Local Proxy Manager
- Get your LLM Farm key [here](https://inside-docupedia.bosch.com/confluence2/genaiplatform/llm-farm-372737736.html).
- Get RB Local Proxy Manager [here](https://service-management.bosch.tech/sp?id=sc_cat_item&sys_id=b08ed16c1b83c91078087403dd4bcbb1)

### Install and Run:
1. Download the installer from releases and run it, provide the API key you recieved from Bosch.
2. Then open the server url on your web browser, typically `https://localhost:3001` 
3. If using AI features, run RB Local Proxy Manager and click execute on Px status\
   ![alt text](docs/{C7171871-3A5D-4C91-8695-29395872F200}.png) \
   ![alt text](docs/image.png)\
   Make sure the port is `3128`!

## Build from source:
1. Clone the repo
2. Install [Bun](https://bun.com/)
3. Run `bun install` to install the dependencies
4. Generate secrets in `./secrets` using `openssl req -nodes -new -x509 -keyout ./secrets/server.key -out ./secrets/server.cert -days 365`
5. Generate a third key for user auth `openssl req -nodes -new -x509 -keyout ./secrets/auth.key`
6. Add your API key to `secrets/.env` as `API_KEY=your_api_key`

### Run:
- Use `bun run all` and open `localhost:5222`
- Run with static frontend with `bun run build-run`
- To compile, use `bun run compile`
- To create installer, compile and run install.iss with InnoSetup 
  - Make sure to change the file paths!

## Details
- React/TS/Vite frontend at `http://localhost:5222`, 
- Express/TS backend at `https://localhost:3001`.
- Compiled/Static runs at `https://localhost:3001`.
- If using AI features at work, you will need to be using RB Local Proxy Manager and running PX through it to local proxy.\
- Currently this program uses basic authentication, we plan to move to a better system in future. *NOT SECURE*