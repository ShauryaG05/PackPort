const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_DIR_NAME = ".packport";
const CONFIG_FILE_NAME = "config.json";

/**
 * Returns the platform-independent path to the configuration directory: ~/.packport
 */
function getConfigDir() {
    return path.join(os.homedir(), CONFIG_DIR_NAME);
}

/**
 * Returns the platform-independent path to config.json: ~/.packport/config.json
 */
function getConfigPath() {
    return path.join(getConfigDir(), CONFIG_FILE_NAME);
}

/**
 * Safely loads and parses the local configuration.
 * Handles missing, unreadable, and corrupted files gracefully without crashing.
 *
 * @returns {object} The parsed configuration, or an empty object if missing/corrupt.
 */
function loadConfig() {
    const configPath = getConfigPath();

    if (!fs.existsSync(configPath)) {
        return {};
    }

    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        if (!raw || !raw.trim()) {
            return {};
        }

        const parsed = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            console.warn(`[Config] Warning: Configuration file at ${configPath} is malformed. Resetting.`);
            return {};
        }

        // Validate agentCode if present
        if (parsed.agentCode && typeof parsed.agentCode !== "string") {
            delete parsed.agentCode;
        }

        return parsed;
    } catch (err) {
        console.warn(`[Config] Warning: Could not parse ${configPath} (${err.message}). Defaulting to empty configuration.`);
        return {};
    }
}

/**
 * Safely and atomically saves configuration data to ~/.packport/config.json.
 * Uses a temporary file and rename to prevent corruption from concurrent attempts or crashes.
 * Sets POSIX file permissions to 0600 (owner read/write only).
 *
 * @param {object} data - Properties to merge into the existing configuration.
 * @returns {object} The merged saved configuration.
 */
function saveConfig(data) {
    if (typeof data !== "object" || data === null) {
        throw new Error("Invalid configuration data: must be a non-null object");
    }

    const configDir = getConfigDir();
    const configPath = getConfigPath();

    // Ensure directory exists with 0700 permissions
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
    }

    // Merge with existing configuration to avoid losing unrelated fields
    const existing = loadConfig();
    const merged = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString()
    };

    const serialized = JSON.stringify(merged, null, 2);

    // Atomic write pattern: write to tmp file then rename
    const tmpPath = path.join(configDir, `.config.tmp.${process.pid}.${Date.now()}`);

    try {
        fs.writeFileSync(tmpPath, serialized, { mode: 0o600, encoding: "utf-8" });

        // On POSIX systems, explicitly enforce 0600 permissions
        if (process.platform !== "win32") {
            try {
                fs.chmodSync(tmpPath, 0o600);
            } catch {}
        }

        fs.renameSync(tmpPath, configPath);

        if (process.platform !== "win32") {
            try {
                fs.chmodSync(configPath, 0o600);
            } catch {}
        }

        return merged;
    } catch (err) {
        // Cleanup tmp file if rename failed
        if (fs.existsSync(tmpPath)) {
            try { fs.unlinkSync(tmpPath); } catch {}
        }
        throw new Error(`Failed to persist configuration to ${configPath}: ${err.message}`);
    }
}

/**
 * Clears / deletes the configuration file (unlink / reset).
 *
 * @returns {boolean} True if file was removed or was already absent.
 */
function clearConfig() {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
        try {
            fs.unlinkSync(configPath);
            return true;
        } catch (err) {
            throw new Error(`Failed to delete configuration file at ${configPath}: ${err.message}`);
        }
    }
    return true;
}

/**
 * Validates if the local agent is linked with a valid agent code.
 *
 * @returns {boolean}
 */
function isLinked() {
    const config = loadConfig();
    return Boolean(
        config.agentCode &&
        typeof config.agentCode === "string" &&
        config.agentCode.trim().length >= 6
    );
}

/**
 * Masks an agent code for secure display (e.g., "k9F2...b1Q").
 *
 * @param {string} code
 * @returns {string}
 */
function maskAgentCode(code) {
    if (!code || typeof code !== "string") return "None";
    const trimmed = code.trim();
    if (trimmed.length <= 6) return trimmed;
    const prefix = trimmed.slice(0, 3);
    const suffix = trimmed.slice(-3);
    return `${prefix}${"*".repeat(Math.min(trimmed.length - 6, 6))}${suffix}`;
}

module.exports = {
    getConfigDir,
    getConfigPath,
    loadConfig,
    saveConfig,
    clearConfig,
    isLinked,
    maskAgentCode
};
