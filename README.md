# PackPort

PackPort helps developers see outdated global Python and Node.js packages, then trigger upgrades from one dashboard. It has three parts:

- `View/` — the React dashboard.
- `server/` — the Express API and Socket.IO real-time server.
- `agent/` — the local process that scans packages and performs upgrades.

## Start here

### What you need

- Node.js 18 or later
- npm
- A MongoDB database
- Python with `pip` if you want Python package scans

### Run locally

Open three terminals from the repository root.

1. Configure the server in `server/.env`:

   ```env
   PORT=5600
   DB_URI=<your MongoDB connection string>
   JWT_SECRET=<a long random secret>
   FrontEnd_URI=http://localhost:5173
   ```

2. Start the API server:

   ```bash
   cd server
   npm install
   node server.js
   ```

3. Configure and start the dashboard:

   ```bash
   cd View
   # Set VITE_BACKEND_URL=http://localhost:5600 in .env
   npm install
   npm run dev
   ```

4. Start the local agent:

   ```bash
   cd agent
   npm install
   node agent.js link <your-agent-code>
   node agent.js start
   ```

Create an account in the dashboard first; its account data provides the agent code. For a local server, set `BACKEND_URI=http://localhost:5600` in `agent/.env` before linking.

## How it works

1. You sign in to the dashboard and link an agent to your account.
2. The dashboard asks the server to scan Python or Node.js packages.
3. The server sends that request to the linked local agent over Socket.IO.
4. The agent collects installed and outdated global packages and sends the result back.
5. The dashboard displays the latest results and can request a package upgrade.

For the detailed request flow, open the [interactive system diagram](https://packport-docs.vercel.app/).

## Agent commands

Run these from `agent/` after installing dependencies:

```bash
node agent.js link <agent-code>       # Link this computer
node agent.js status                  # Show link and backend details
node agent.js unlink                  # Remove this computer's link
node agent.js start                   # Run the agent
node agent.js --help                  # Show all commands
```

The agent scans Python via `pip` and Node.js global packages via `npm`. Upgrade requests execute on the linked machine, so review package changes in the dashboard before triggering them.

## Configuration reference

| Location | Required values | Purpose |
| --- | --- | --- |
| `server/.env` | `DB_URI`, `JWT_SECRET` | Database connection and session signing |
| `server/.env` | `PORT`, `FrontEnd_URI` | Server port and allowed dashboard origin |
| `View/.env` | `VITE_BACKEND_URL` | API server URL used by the dashboard |
| `agent/.env` | `BACKEND_URI` | API server URL used by the local agent |

Environment files are ignored by Git. Do not commit credentials.

## Development commands

| Area | Command | Purpose |
| --- | --- | --- |
| Dashboard | `cd View && npm run dev` | Run the Vite development server |
| Dashboard | `cd View && npm run build` | Build the dashboard |
| Dashboard | `cd View && npm run lint` | Run lint checks |
| Agent | `cd agent && npm test` | Run the pairing test |
| Agent | `cd agent && npm run build:exe` | Build the Windows agent executable |

## Project layout

```text
PackPort/
├── View/       Dashboard client
├── server/     API, authentication, database, and real-time events
├── agent/      Local scanner and upgrade runner
└── docs/       Published interactive system diagram
```

## Documentation site

`docs/` is intentionally small because it is deployed as a static site. It contains the published diagram and the domain configuration only; generator logs and duplicate review output are excluded.
