#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");

const agentPath = path.join(__dirname, "agent.js");

const child = spawn(process.execPath, [agentPath], {
  stdio: "inherit",
  env: process.env
});

child.on("error", (error) => {
  console.error("Failed to start PackPort:", error.message);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
