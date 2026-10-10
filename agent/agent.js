const os = require("os");
const { execSync } = require("child_process");
require("dotenv").config();

const BackendURL = process.env.BACKEND_URI || "https://packport.onrender.com";
const { io } = require("socket.io-client");

console.log("=========================================");
console.log("       🚀 PackPort System Agent          ");
console.log("=========================================");
console.log(`Target Backend: ${BackendURL}`);

const socket = io(BackendURL, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
});

socket.on("connect", () => {
    console.log(`[Agent] Successfully connected to PackPort Server (ID: ${socket.id})`);
});

socket.on("disconnect", () => {
    console.log("[Agent] Disconnected from PackPort Server. Attempting reconnection...");
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
 * Handler: Python Ecosystem Scan
 */

socket.on("update_python", (data) => {
    const pkgName = typeof data === "object" && data !== null ? data.packageName || data.package : data;
    if (!pkgName) {
        console.error("❌ No package name provided for python update");
        return;
    }

    try {
        console.log(`\n[Update] Updating Python package: ${pkgName}...`);
        const pyCmd = getPythonCommand();
        const upCmd = `${pyCmd} -m pip install --upgrade ${pkgName}`;
        execSync(upCmd, { encoding: "utf-8", stdio: "inherit" });
        console.log(`✅ Python package '${pkgName}' updated successfully`);
    } catch (err) {
        console.error(`❌ Failed to update Python package '${pkgName}':`, err.message);
    }
});

socket.on("update_node", (data) => {
    const pkgName = typeof data === "object" && data !== null ? data.packageName || data.package : data;
    if (!pkgName) {
        console.error("❌ No package name provided for node update");
        return;
    }

    try {
        console.log(`\n[Update] Updating Global Node.js package: ${pkgName}...`);
        const upCmd = `npm install -g ${pkgName}@latest`;
        execSync(upCmd, { encoding: "utf-8", stdio: "inherit" });
        console.log(`✅ Node.js package '${pkgName}' updated successfully`);
    } catch (err) {
        console.error(`❌ Failed to update Node.js package '${pkgName}':`, err.message);
    }
});

socket.on("python_scan", (agentCode) => {
    try {
        console.log(`\n[Scan] Received python_scan request for Agent: ${agentCode}`);
        let outdatedPackages = [];
        let allPackages = [];
        let pythonVersion = "";

        const pyCmd = getPythonCommand();

        if (pyCmd) {
            console.log(`[Scan] Detected Python runtime using command: '${pyCmd}'`);

            // 1. Fetch outdated packages
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

            // 2. Fetch all installed packages
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

            // 3. Fetch Python Version
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

        // Format for uniform delivery
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
            agentCode: agentCode,
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
socket.on("node_scan", (agentCode) => {
    try {
        console.log(`\n[Scan] Received node_scan request for Agent: ${agentCode}`);

        let nodeVersion = "";
        let npmVersion = "";
        let outdatedPackages = {};
        let allPackages = {};

        // 1. NPM AND NODE VERSION
        try {
            nodeVersion = execSync("node -v", { encoding: "utf-8", windowsHide: true }).trim();
            npmVersion = execSync("npm -v", { encoding: "utf-8", windowsHide: true }).trim();
        } catch (err) {
            console.error("[Scan] Failed to fetch node/npm version:", err.message);
        }

        // 2. OUTDATED PACKAGES
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

        // 3. ALL PACKAGES
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

        // 4. FORMAT DATA
        const formattedOutdated = Object.entries(outdatedPackages || {}).map(([name, info]) => ({
            name: name,
            version: info.current || info.wanted || "Unknown",
            latest_version: info.latest || info.wanted || "Unknown",
            type: info.type || "global",
        }));

        // Format all packages into uniform array
        const dependencies = allPackages && allPackages.dependencies ? allPackages.dependencies : {};
        const formattedAll = Object.entries(dependencies).map(([name, info]) => ({
            name: name,
            version: typeof info === "object" ? info.version : info,
        }));

        socket.emit("result_node_packages", {
            agentCode: agentCode,
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
