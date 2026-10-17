const os = require("os");
const path = require("path");
const readline = require("readline");
const { execSync, execFile } = require("child_process");
const axios = require("axios");
require("dotenv").config();
const { io } = require("socket.io-client");
const configManager = require("./config");

const PACKAGE_NAME_REGEX = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;
const AGENT_CODE_REGEX = /^[a-zA-Z0-9_-]{6,64}$/;

/**
 * Resolve target Backend URL:
 * 1. CLI flag: --backend <url>
 * 2. Environment variable: BACKEND_URI or BACKEND_URL
 * 3. Saved config backendUrl
 * 4. Production Render URL default
 */
function resolveBackendUrl(cliArgs) {
    for (let i = 0; i < cliArgs.length; i++) {
        if (cliArgs[i] === "--backend" && cliArgs[i + 1]) return cliArgs[i + 1].trim();
        if (cliArgs[i].startsWith("--backend=")) return cliArgs[i].split("=")[1].trim();
    }
    if (process.env.BACKEND_URI) return process.env.BACKEND_URI.trim();
    if (process.env.BACKEND_URL) return process.env.BACKEND_URL.trim();

    const saved = configManager.loadConfig();
    if (saved.backendUrl) return saved.backendUrl.trim();

    return "https://packport.onrender.com";
}

/**
 * Interactive prompt helper using Node.js readline
 */
function promptUser(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Command: packport link [agentCode] [--force]
 */
async function handleLinkCommand(args, backendUrl) {
    let force = false;
    let codeInput = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--force" || arg === "-f") {
            force = true;
        } else if (arg === "--backend" && args[i + 1]) {
            i++; // skip backend value
        } else if (arg.startsWith("--backend=")) {
            // skip
        } else if (!arg.startsWith("-")) {
            codeInput = arg;
        }
    }

    // 1. Check if already linked
    const existing = configManager.loadConfig();
    if (existing.agentCode && !force) {
        console.log("=========================================");
        console.log("       ⚠️  PackPort Agent Warning        ");
        console.log("=========================================");
        console.log("This machine is already linked to an account!");
        console.log(`Current Agent Code:  ${configManager.maskAgentCode(existing.agentCode)}`);
        console.log(`Linked At:           ${existing.linkedAt || "Unknown"}`);
        console.log(`Config File:         ${configManager.getConfigPath()}\n`);
        console.log("To link with a new Agent Code, use:");
        console.log("  👉 packport link <new-agent-code> --force\n");
        console.log("Or unlink first:");
        console.log("  👉 packport unlink\n");
        process.exit(0);
    }

    // 2. Obtain agent code from argument or interactive prompt
    if (!codeInput) {
        if (process.stdin.isTTY) {
            console.log("=========================================");
            console.log("       🔗 Link PackPort Agent            ");
            console.log("=========================================");
            console.log("Target Backend:", backendUrl);
            console.log("(Find your Agent Code in your PackPort Dashboard profile)\n");
            codeInput = await promptUser("👉 Enter your PackPort Agent Code: ");
        } else {
            console.error("❌ Error: No Agent Code provided.");
            console.error("Usage: packport link <agent-code> [--force]");
            process.exit(1);
        }
    }

    const trimmedCode = (codeInput || "").trim();

    // 3. Validate format before calling backend
    if (!trimmedCode || !AGENT_CODE_REGEX.test(trimmedCode)) {
        console.error("❌ Error: Invalid Agent Code format.");
        console.error("Agent codes must be 6-64 alphanumeric characters (letters, numbers, underscores, hyphens).");
        process.exit(1);
    }

    console.log(`\nVerifying Agent Code with PackPort server at ${backendUrl}...`);

    // 4. Verify with backend
    try {
        const response = await axios.post(
            `${backendUrl}/agent/link`,
            {
                agentCode: trimmedCode,
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch()
            },
            {
                timeout: 10000,
                headers: { "Content-Type": "application/json" }
            }
        );

        if (response.data && response.data.success) {
            const token = response.data.token || "";

            // 5. Persist to ~/.packport/config.json
            configManager.saveConfig({
                agentCode: trimmedCode,
                token: token,
                backendUrl: backendUrl,
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch(),
                linkedAt: new Date().toISOString()
            });

            console.log("=========================================");
            console.log("       🚀 PackPort Agent Linked!         ");
            console.log("=========================================");
            console.log("✅ Successfully linked this machine to your PackPort account!");
            console.log(`Agent Code:  ${configManager.maskAgentCode(trimmedCode)}`);
            console.log(`Machine:     ${os.hostname()} (${os.platform()} ${os.arch()})`);
            console.log(`Backend:     ${backendUrl}`);
            console.log(`Config File: ${configManager.getConfigPath()}\n`);
            console.log("You can now start the background agent daemon:");
            console.log("  👉 packport start\n");
            process.exit(0);
        } else {
            console.error(`❌ Linking failed: ${response.data?.message || "Verification rejected by server"}`);
            process.exit(1);
        }
    } catch (err) {
        if (err.response) {
            if (err.response.status === 404) {
                console.error("❌ Linking Failed: Invalid or unrecognized Agent Code.");
                console.error("👉 Please double-check the Agent Code in your PackPort dashboard profile.");
            } else if (err.response.status === 429) {
                console.error("❌ Rate Limited: Too many linking attempts. Please wait a minute and try again.");
            } else {
                console.error(`❌ Linking Failed: ${err.response.data?.message || err.message}`);
            }
        } else {
            console.error(`❌ Connection Error: Could not connect to PackPort backend at ${backendUrl}`);
            console.error("👉 Check your network connection or provide a custom backend with --backend <url>");
        }
        process.exit(1);
    }
}

/**
 * Command: packport unlink / reset
 */
function handleUnlinkCommand() {
    if (!configManager.isLinked()) {
        console.log("=========================================");
        console.log("       ℹ️  PackPort Agent Status         ");
        console.log("=========================================");
        console.log("This machine is not currently linked to any PackPort account.");
        console.log(`Config File: ${configManager.getConfigPath()}`);
        process.exit(0);
    }

    try {
        configManager.clearConfig();
        console.log("=========================================");
        console.log("       🗑️  PackPort Agent Unlinked       ");
        console.log("=========================================");
        console.log("✅ PackPort Agent configuration has been removed successfully.");
        console.log("To link this agent again in the future:");
        console.log("  👉 packport link <agent-code>\n");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to unlink agent:", err.message);
        process.exit(1);
    }
}

/**
 * Command: packport status
 */
function handleStatusCommand(backendUrl) {
    console.log("=========================================");
    console.log("       📊 PackPort Agent Status          ");
    console.log("=========================================");

    const config = configManager.loadConfig();
    const linked = configManager.isLinked();

    if (linked) {
        console.log("Status:       ✅ Linked & Ready");
        console.log(`Agent Code:   ${configManager.maskAgentCode(config.agentCode)}`);
        console.log(`Backend URL:  ${config.backendUrl || backendUrl}`);
        console.log(`Linked At:    ${config.linkedAt || "Unknown"}`);
        console.log(`Machine:      ${os.hostname()} (${os.platform()} ${os.arch()})`);
        console.log(`Config File:  ${configManager.getConfigPath()}`);
    } else {
        console.log("Status:       ⚠️ Not Linked");
        console.log(`Config File:  ${configManager.getConfigPath()} (missing or unlinked)\n`);
        console.log("To link this machine to your PackPort dashboard:");
        console.log("  👉 packport link <agent-code>\n");
    }
    process.exit(0);
}

/**
 * Command: packport help
 */
function printHelp() {
    console.log(`
PackPort Agent CLI - Telemetry & Remote Runtime Maintenance

USAGE:
  packport <command> [options]

COMMANDS:
  link <agent-code> [--force]   Link this machine to your PackPort account
  unlink                        Unlink this machine and clear stored configuration
  status                        Display current linking status and backend config
  start                         Start the package telemetry and maintenance daemon
  help                          Display this help manual

OPTIONS:
  --backend <url>               Override target backend server URL
  --force, -f                   Force re-linking if already linked
  --help, -h                    Display help

EXAMPLES:
  packport link k9F2mX8b1Q
  packport status
  packport start
  packport unlink
`);
    process.exit(0);
}

/**
 * Start Agent Daemon
 */
function startAgentDaemon(backendUrl) {
    const config = configManager.loadConfig();
    const envAgentCode = process.env.AGENT_CODE || process.env.PACKPORT_AGENT_CODE;
    const activeAgentCode = (envAgentCode || config.agentCode || "").trim();

    // 1. Ensure the agent is linked before connecting
    if (!activeAgentCode) {
        console.log("=========================================");
        console.log("       🚀 PackPort System Agent          ");
        console.log("=========================================");
        console.log("❌ Error: PackPort Agent is not linked to any account!\n");
        console.log("To link this machine to your PackPort dashboard:");
        console.log("  👉 Run: packport link <agent-code>\n");
        console.log("(Find your unique Agent Code in your PackPort Dashboard profile)");
        process.exit(1);
    }

    console.log("=========================================");
    console.log("       🚀 PackPort System Agent          ");
    console.log("=========================================");
    console.log(`Target Backend: ${backendUrl}`);
    console.log(`Agent Identity: ${configManager.maskAgentCode(activeAgentCode)} (${os.hostname()})`);
    console.log(`Config File:    ${configManager.getConfigPath()}`);

    const socket = io(backendUrl, {
        auth: {
            agentCode: activeAgentCode,
            token: config.token || "",
            clientType: "agent"
        },
        query: {
            agentCode: activeAgentCode,
            token: config.token || "",
            clientType: "agent"
        },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
        console.log(`[Agent] Successfully connected to PackPort Server (Socket ID: ${socket.id})`);
        socket.emit("register_agent", { agentCode: activeAgentCode, token: config.token || "" });
        console.log(`[Agent] Bound to Agent Code: ${configManager.maskAgentCode(activeAgentCode)}`);
    });

    socket.on("disconnect", (reason) => {
        console.log(`[Agent] Disconnected from PackPort Server (${reason}). Attempting reconnection...`);
    });

    socket.on("auth_error", (err) => {
        console.error("\n❌ Authentication Error:", err?.message || "Invalid or revoked agent credentials");
        console.error("👉 To recover, unlink and re-link your agent:");
        console.error("   packport unlink");
        console.error("   packport link <new-agent-code>\n");
    });

    /**
     * Helper to dynamically detect available Python binary (python, python3, py)
     */
    function getPythonCommand() {
        const candidates = ["python", "python3", "py"];
        for (const cmd of candidates) {
            try {
                execSync(`${cmd} --version`, { stdio: "ignore" });
                return cmd;
            } catch {
                // candidate failed, try next
            }
        }
        return null;
    }

    /**
     * Safe, non-shell package upgrade handler (Prevents Command Injection / RCE)
     */
    function upgradePackage({ taskId, packageName, language }) {
        const effectiveTaskId = taskId || `task_${Date.now()}`;
        const lang = (language || "python").toLowerCase();

        if (!packageName || !PACKAGE_NAME_REGEX.test(packageName)) {
            console.error(`❌ [Update] Invalid package name format: '${packageName}'`);
            return socket.emit("update_result", {
                taskId: effectiveTaskId,
                agentCode: activeAgentCode,
                packageName,
                language: lang,
                success: false,
                error: `Invalid package name format: '${packageName}'`
            });
        }

        console.log(`\n[Update] Upgrading ${lang} package: ${packageName}... (TaskId: ${effectiveTaskId})`);

        if (lang === "python") {
            const pyCmd = getPythonCommand();
            if (!pyCmd) {
                console.error("❌ No Python binary detected for upgrade.");
                return socket.emit("update_result", {
                    taskId: effectiveTaskId,
                    agentCode: activeAgentCode,
                    packageName,
                    language: lang,
                    success: false,
                    error: "No Python runtime binary detected on this machine"
                });
            }

            execFile(pyCmd, ["-m", "pip", "install", "--upgrade", packageName], { windowsHide: true }, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Failed to update Python package '${packageName}':`, err.message);
                    socket.emit("update_result", {
                        taskId: effectiveTaskId,
                        agentCode: activeAgentCode,
                        packageName,
                        language: lang,
                        success: false,
                        error: stderr || err.message,
                        stdout: stdout || ""
                    });
                } else {
                    console.log(`✅ Python package '${packageName}' updated successfully`);
                    socket.emit("update_result", {
                        taskId: effectiveTaskId,
                        agentCode: activeAgentCode,
                        packageName,
                        language: lang,
                        success: true,
                        stdout: stdout || ""
                    });
                }
            });
        } else if (lang === "node") {
            const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
            execFile(npmCmd, ["install", "-g", `${packageName}@latest`], { windowsHide: true }, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Failed to update Node.js package '${packageName}':`, err.message);
                    socket.emit("update_result", {
                        taskId: effectiveTaskId,
                        agentCode: activeAgentCode,
                        packageName,
                        language: lang,
                        success: false,
                        error: stderr || err.message,
                        stdout: stdout || ""
                    });
                } else {
                    console.log(`✅ Node.js package '${packageName}' updated successfully`);
                    socket.emit("update_result", {
                        taskId: effectiveTaskId,
                        agentCode: activeAgentCode,
                        packageName,
                        language: lang,
                        success: true,
                        stdout: stdout || ""
                    });
                }
            });
        }
    }

    socket.on("package_update", (data) => {
        if (!data) return;
        upgradePackage({
            taskId: data.taskId,
            packageName: data.packageName || data.package,
            language: data.language || "python"
        });
    });

    socket.on("update_python", (data) => {
        const pkgName = typeof data === "object" && data !== null ? data.packageName || data.package : data;
        const taskId = (data && data.taskId) || `py_${Date.now()}`;
        upgradePackage({ taskId, packageName: pkgName, language: "python" });
    });

    socket.on("update_node", (data) => {
        const pkgName = typeof data === "object" && data !== null ? data.packageName || data.package : data;
        const taskId = (data && data.taskId) || `node_${Date.now()}`;
        upgradePackage({ taskId, packageName: pkgName, language: "node" });
    });

    /**
     * Handler: Python Ecosystem Scan
     */
    socket.on("python_scan", (targetAgentCode) => {
        try {
            if (activeAgentCode && targetAgentCode && targetAgentCode !== activeAgentCode) {
                return;
            }

            console.log(`\n[Scan] Received python_scan request for Agent: ${configManager.maskAgentCode(activeAgentCode)}`);
            let outdatedPackages = [];
            let allPackages = [];
            let pythonVersion = "";

            const pyCmd = getPythonCommand();

            if (pyCmd) {
                console.log(`[Scan] Detected Python runtime using command: '${pyCmd}'`);

                try {
                    const rawOutdated = execSync(`${pyCmd} -m pip list --outdated --format=json`, {
                        encoding: "utf-8",
                        windowsHide: true,
                    });
                    outdatedPackages = JSON.parse(rawOutdated);
                } catch (err) {
                    if (err.stdout) {
                        try {
                            outdatedPackages = JSON.parse(err.stdout.toString());
                        } catch { }
                    }
                }

                try {
                    const rawAll = execSync(`${pyCmd} -m pip list --format=json`, {
                        encoding: "utf-8",
                        windowsHide: true,
                    });
                    allPackages = JSON.parse(rawAll);
                } catch (err) {
                    if (err.stdout) {
                        try {
                            allPackages = JSON.parse(err.stdout.toString());
                        } catch { }
                    }
                }

                try {
                    pythonVersion = execSync(`${pyCmd} --version`, {
                        encoding: "utf-8",
                        windowsHide: true,
                    }).trim();
                } catch { }
            } else {
                console.warn("[Scan] No Python binary detected on this machine.");
                pythonVersion = "Not Installed";
            }

            const formattedOutdated = Array.isArray(outdatedPackages)
                ? outdatedPackages.map((p) => ({
                    name: p.name,
                    version: p.version,
                    latest_version: p.latest_version,
                    type: p.wheel ? "wheel" : "pip",
                }))
                : [];

            const formattedAll = Array.isArray(allPackages)
                ? allPackages.map((p) => ({
                    name: p.name,
                    version: p.version,
                }))
                : [];

            socket.emit("result_python_packages", {
                agentCode: activeAgentCode,
                outdated_packages: formattedOutdated,
                all_packages: formattedAll,
                pythonVersion: pythonVersion,
            });

            console.log(
                `[Scan] Dispatched Python Telemetry: ${formattedOutdated.length} outdated, ${formattedAll.length} total packages (${pythonVersion})`
            );
        } catch (globalErr) {
            console.error("[Scan] Critical error during python_scan:", globalErr);
        }
    });

    /**
     * Handler: Node.js Ecosystem Scan
     */
    socket.on("node_scan", (targetAgentCode) => {
        try {
            if (activeAgentCode && targetAgentCode && targetAgentCode !== activeAgentCode) {
                return;
            }

            console.log(`\n[Scan] Received node_scan request for Agent: ${configManager.maskAgentCode(activeAgentCode)}`);

            let nodeVersion = "";
            let npmVersion = "";
            let outdatedPackages = {};
            let allPackages = {};

            try {
                nodeVersion = execSync("node -v", { encoding: "utf-8", windowsHide: true }).trim();
                npmVersion = execSync("npm -v", { encoding: "utf-8", windowsHide: true }).trim();
            } catch (err) {
                console.error("[Scan] Failed to fetch node/npm version:", err.message);
            }

            try {
                const rawOutdated = execSync("npm outdated -g --json", {
                    encoding: "utf-8",
                    windowsHide: true,
                });
                outdatedPackages = JSON.parse(rawOutdated);
            } catch (err) {
                if (err.stdout) {
                    try {
                        outdatedPackages = JSON.parse(err.stdout.toString());
                    } catch (e) {
                        console.error("[Scan] Failed to parse npm outdated JSON:", e.message);
                    }
                }
            }

            try {
                const rawAll = execSync("npm list -g --depth=0 --json", {
                    encoding: "utf-8",
                    windowsHide: true,
                });
                allPackages = JSON.parse(rawAll);
            } catch (err) {
                if (err.stdout) {
                    try {
                        allPackages = JSON.parse(err.stdout.toString());
                    } catch { }
                }
            }

            const formattedOutdated = Object.entries(outdatedPackages || {}).map(([name, info]) => ({
                name: name,
                version: info.current || info.wanted || "Unknown",
                latest_version: info.latest || info.wanted || "Unknown",
                type: info.type || "global",
            }));

            const dependencies = allPackages && allPackages.dependencies ? allPackages.dependencies : {};
            const formattedAll = Object.entries(dependencies).map(([name, info]) => ({
                name: name,
                version: typeof info === "object" ? info.version : info,
            }));

            socket.emit("result_node_packages", {
                agentCode: activeAgentCode,
                node_version: nodeVersion,
                npm_version: npmVersion,
                outdated_packages: formattedOutdated,
                all_packages: formattedAll,
            });

            console.log(
                `[Scan] Dispatched Node Telemetry: ${formattedOutdated.length} outdated, ${formattedAll.length} total packages (${nodeVersion})`
            );
        } catch (globalErr) {
            console.error("[Scan] Critical error during node_scan:", globalErr);
        }
    });
}

/**
 * Main Entry Point: CLI Subcommand Dispatcher
 */
async function main() {
    const rawArgs = process.argv.slice(2);
    const backendUrl = resolveBackendUrl(rawArgs);

    const command = rawArgs[0] ? rawArgs[0].toLowerCase() : null;

    if (command === "link") {
        await handleLinkCommand(rawArgs.slice(1), backendUrl);
    } else if (command === "unlink" || command === "reset") {
        handleUnlinkCommand();
    } else if (command === "status") {
        handleStatusCommand(backendUrl);
    } else if (command === "help" || command === "--help" || command === "-h") {
        printHelp();
    } else if (command === "start" || command === "run") {
        startAgentDaemon(backendUrl);
    } else if (!command) {
        // Default without subcommands: if linked, run daemon; if not, instruct user to link
        startAgentDaemon(backendUrl);
    } else {
        // Unknown command or direct agentCode argument: e.g. packport --backend <url>
        if (command.startsWith("-")) {
            startAgentDaemon(backendUrl);
        } else {
            console.error(`❌ Unknown command: '${command}'`);
            console.error("Run 'packport help' to see available commands.");
            process.exit(1);
        }
    }
}

main().catch((err) => {
    console.error("Fatal Agent Error:", err);
    process.exit(1);
});
