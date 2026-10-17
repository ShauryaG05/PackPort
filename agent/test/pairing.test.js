const assert = require("assert");
const fs = require("fs");
const path = require("path");
const os = require("os");
const http = require("http");
const { execFile } = require("child_process");
const configManager = require("../config");

console.log("=========================================");
console.log("   🧪 Running PackPort Pairing Tests     ");
console.log("=========================================");

const configPath = configManager.getConfigPath();
const configDir = configManager.getConfigDir();
const backupConfigPath = path.join(configDir, `config.backup.${Date.now()}`);

// Backup existing config if present so test doesn't disrupt user's real config
let hadOriginalConfig = false;
if (fs.existsSync(configPath)) {
    hadOriginalConfig = true;
    fs.copyFileSync(configPath, backupConfigPath);
}

function restoreOriginalConfig() {
    if (hadOriginalConfig && fs.existsSync(backupConfigPath)) {
        fs.copyFileSync(backupConfigPath, configPath);
        fs.unlinkSync(backupConfigPath);
    } else if (!hadOriginalConfig && fs.existsSync(configPath)) {
        try { fs.unlinkSync(configPath); } catch {}
    }
}

async function runTests() {
    try {
        console.log("\n[Test 1] Config Manager: Basic operations & atomic persistence");
        configManager.clearConfig();
        assert.strictEqual(fs.existsSync(configPath), false, "Config file should be deleted after clearConfig()");
        assert.strictEqual(configManager.isLinked(), false, "isLinked() should be false after clearConfig()");

        // Test loading missing config
        const emptyConfig = configManager.loadConfig();
        assert.deepStrictEqual(emptyConfig, {}, "loadConfig() should return empty object for missing file");

        // Test saving config
        const saved = configManager.saveConfig({
            agentCode: "testCode123",
            token: "testToken456",
            backendUrl: "http://localhost:5600",
            customProperty: "keepMe"
        });
        assert.strictEqual(fs.existsSync(configPath), true, "Config file should exist after saveConfig()");
        assert.strictEqual(configManager.isLinked(), true, "isLinked() should be true after saveConfig()");
        assert.strictEqual(saved.agentCode, "testCode123");
        assert.strictEqual(saved.token, "testToken456");

        // Verify file permissions on POSIX
        if (process.platform !== "win32") {
            const stats = fs.statSync(configPath);
            const mode = stats.mode & 0o777;
            assert.strictEqual(mode, 0o600, "File permissions should be 0600 (owner read/write only)");
        }

        // Test loading config
        const loaded = configManager.loadConfig();
        assert.strictEqual(loaded.agentCode, "testCode123");
        assert.strictEqual(loaded.customProperty, "keepMe");

        // Test handling malformed/corrupted file
        fs.writeFileSync(configPath, "{ malformed json garbage", "utf-8");
        const corruptLoaded = configManager.loadConfig();
        assert.deepStrictEqual(corruptLoaded, {}, "Corrupt JSON should be handled gracefully without crashing");

        console.log("✅ Test 1 Passed: Config manager atomic operations & permissions verified.");

        console.log("\n[Test 2] Code Masking helper");
        assert.strictEqual(configManager.maskAgentCode(""), "None");
        assert.strictEqual(configManager.maskAgentCode("abcdef123456"), "abc******456");
        assert.strictEqual(configManager.maskAgentCode("short"), "short");
        console.log("✅ Test 2 Passed: Code masking verified.");

        console.log("\n[Test 3] Mock Backend & CLI Linking Workflow");
        // Create mock HTTP server simulating PackPort Control Plane /agent/link
        let mockReceivedBody = null;
        const mockServer = http.createServer((req, res) => {
            if (req.method === "POST" && req.url === "/agent/link") {
                let body = "";
                req.on("data", chunk => body += chunk);
                req.on("end", () => {
                    mockReceivedBody = JSON.parse(body);
                    if (mockReceivedBody.agentCode === "validCode999") {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({
                            success: true,
                            message: "Agent linked successfully",
                            agentCode: "validCode999",
                            token: "mockDeviceToken777",
                            user: { name: "Test User" }
                        }));
                    } else {
                        res.writeHead(404, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({
                            success: false,
                            message: "Invalid or unrecognized agent code."
                        }));
                    }
                });
            } else {
                res.writeHead(404);
                res.end();
            }
        });

        await new Promise(resolve => mockServer.listen(0, resolve));
        const port = mockServer.address().port;
        const mockBackendUrl = `http://localhost:${port}`;
        console.log(`Mock server listening on ${mockBackendUrl}`);

        const agentScript = path.join(__dirname, "..", "agent.js");

        // Step A: Link with valid code
        configManager.clearConfig();
        await new Promise((resolve, reject) => {
            execFile(process.execPath, [agentScript, "link", "validCode999", "--backend", mockBackendUrl], (err, stdout, stderr) => {
                if (err) return reject(new Error(`Link failed: ${stderr || err.message}`));
                assert(stdout.includes("Successfully linked this machine to your PackPort account!"), "Should print link success message");
                resolve();
            });
        });

        const linkedConfig = configManager.loadConfig();
        assert.strictEqual(linkedConfig.agentCode, "validCode999", "agentCode should be persisted in config.json");
        assert.strictEqual(linkedConfig.token, "mockDeviceToken777", "token should be persisted in config.json");
        assert.strictEqual(linkedConfig.backendUrl, mockBackendUrl);
        console.log("✅ Step 3A Passed: Valid code linked and persisted.");

        // Step B: Re-linking without --force should warn and prevent overwrite
        await new Promise((resolve, reject) => {
            execFile(process.execPath, [agentScript, "link", "anotherCode111", "--backend", mockBackendUrl], (err, stdout, stderr) => {
                if (err) return reject(new Error(`Failed: ${stderr || err.message}`));
                assert(stdout.includes("This machine is already linked to an account!"), "Should warn user if already linked");
                resolve();
            });
        });
        assert.strictEqual(configManager.loadConfig().agentCode, "validCode999", "Code should not be overwritten without --force");
        console.log("✅ Step 3B Passed: Safe rejection of re-link without --force.");

        // Step C: Linking with invalid code should fail and not overwrite
        await new Promise((resolve) => {
            execFile(process.execPath, [agentScript, "link", "nonExistentCode", "--backend", mockBackendUrl, "--force"], (err, stdout, stderr) => {
                assert(err, "Command should exit with non-zero exit code on 404");
                assert(stderr.includes("Invalid or unrecognized Agent Code"), "Should print invalid code error");
                resolve();
            });
        });
        console.log("✅ Step 3C Passed: Invalid code rejected by backend.");

        // Step D: Status command
        await new Promise((resolve, reject) => {
            execFile(process.execPath, [agentScript, "status"], (err, stdout) => {
                if (err) return reject(err);
                assert(stdout.includes("Linked & Ready"), "Status should report linked");
                resolve();
            });
        });
        console.log("✅ Step 3D Passed: Status command reports linked state.");

        // Step E: Unlink command
        await new Promise((resolve, reject) => {
            execFile(process.execPath, [agentScript, "unlink"], (err, stdout) => {
                if (err) return reject(err);
                assert(stdout.includes("removed successfully"), "Unlink should report success");
                resolve();
            });
        });
        assert.strictEqual(configManager.isLinked(), false, "Agent should now be unlinked");
        console.log("✅ Step 3E Passed: Unlink clears stored configuration.");

        // Step F: Start daemon when not linked should exit with error 1
        await new Promise((resolve) => {
            execFile(process.execPath, [agentScript, "start"], (err, stdout) => {
                assert(err, "Should exit with non-zero code when unlinked");
                assert(stdout.includes("PackPort Agent is not linked to any account!"), "Should instruct user to link");
                resolve();
            });
        });
        console.log("✅ Step 3F Passed: Daemon startup blocked when unlinked.");

        mockServer.close();

        console.log("\n=========================================");
        console.log("   🎉 ALL 3 PAIRING TEST SUITES PASSED!  ");
        console.log("=========================================");
    } finally {
        restoreOriginalConfig();
    }
}

runTests().catch(err => {
    console.error("\n❌ Test Suite Failed:", err);
    restoreOriginalConfig();
    process.exit(1);
});
