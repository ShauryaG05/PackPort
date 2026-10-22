import { useState } from "react";
import { Link } from "react-router-dom";
import PackPortLogo, { PackPortIcon } from "../components/PackPortLogo";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Shield,
  CheckCircle2,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Globe,
  Code2,
  Activity,
  Play,
  RotateCw,
} from "lucide-react";

// Package manager command definitions
const PM_INSTALL_COMMANDS = {
  global: {
    npm: "npm install -g packport-cli",
    pnpm: "pnpm add -g packport-cli",
    yarn: "yarn global add packport-cli",
    bun: "bun add -g packport-cli",
  },
  local: {
    npm: "npm install --save-dev packport-cli",
    pnpm: "pnpm add -D packport-cli",
    yarn: "yarn add -D packport-cli",
    bun: "bun add -d packport-cli",
  },
  npx: {
    npm: "npx packport-cli@latest start",
    pnpm: "pnpm dlx packport-cli start",
    yarn: "yarn dlx packport-cli start",
    bun: "bunx packport-cli start",
  },
};

const CLI_COMMANDS = [
  {
    cmd: "packport start",
    desc: "Launch daemon & start real-time port telemetry",
    category: "Core Engine",
  },
  {
    cmd: "packport link <agent-code>",
    desc: "Pair local workstation with your PackPort dashboard account",
    category: "Auth & Sync",
  },
  {
    cmd: "packport status",
    desc: "Inspect daemon process status, socket connection & telemetry feed",
    category: "Diagnostics",
  },
  {
    cmd: "packport ports",
    desc: "Audit and list currently active local developer listening ports",
    category: "Observability",
  },
  {
    cmd: "packport audit",
    desc: "Scan package managers (pip, npm, ollama) for dependency drift",
    category: "Security",
  },
  {
    cmd: "packport stop",
    desc: "Safely terminate background workstation daemon",
    category: "Lifecycle",
  },
];

export default function DownloadPage() {
  const [installMode, setInstallMode] = useState("global"); // 'global' | 'local' | 'npx'
  const [selectedPm, setSelectedPm] = useState("npm"); // 'npm' | 'pnpm' | 'yarn' | 'bun'
  const [copiedId, setCopiedId] = useState(null);

  const activeCommand = PM_INSTALL_COMMANDS[installMode][selectedPm];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-[#238636]/30">
      {/* ── Top Navigation Bar ── */}
      <Navbar />

      <main className="flex-1 flex flex-col items-center">
        {/* ═══════════════════════════════════════════
            HERO — NPM Installation Command Center
        ═══════════════════════════════════════════ */}
        <section className="w-full max-w-5xl px-6 pt-14 md:pt-20 pb-12 text-center flex flex-col items-center">
          {/* npm Badge & Logo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-6 shadow-xs animate-in fade-in duration-300">
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M0 0v24h24V0H0zm20.063 20.063H15.94V7.938h-4.001v12.125H3.937V3.938h16.126v16.125z" />
            </svg>
            <span>Official npm Registry Distribution</span>
            <span className="w-1 h-1 rounded-full bg-red-400/50" />
            <span className="font-mono text-red-300">v1.2.2</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4 max-w-3xl">
            Install PackPort via <span className="text-[#7bdb80] underline decoration-[#238636]/40 underline-offset-8">npm</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Run the PackPort developer telemetry agent everywhere Node.js is installed. Fast, cross-platform installation across macOS, Linux, and Windows with zero native binary compiling.
          </p>

          {/* ── Interactive Command Box ── */}
          <div className="w-full max-w-2xl text-left bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Window Header */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-muted/60 border-b border-border/70 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                  bash — packport-cli
                </span>
              </div>

              {/* Install Modes: Global vs Local vs NPX */}
              <div className="flex items-center rounded-lg bg-background/80 p-0.5 border border-border/80 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setInstallMode("global")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    installMode === "global"
                      ? "bg-[#238636] text-white font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Global CLI
                </button>
                <button
                  type="button"
                  onClick={() => setInstallMode("local")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    installMode === "local"
                      ? "bg-[#238636] text-white font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Project Dev
                </button>
                <button
                  type="button"
                  onClick={() => setInstallMode("npx")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    installMode === "npx"
                      ? "bg-[#238636] text-white font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  npx (No Install)
                </button>
              </div>
            </div>

            {/* Command Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Package Manager Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Package Manager:</span>
                </div>
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
                  {["npm", "pnpm", "yarn", "bun"].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setSelectedPm(pm)}
                      className={`px-2.5 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                        selectedPm === pm
                          ? "bg-card text-[#7bdb80] font-semibold border border-border/60 shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Code Pill */}
              <div className="relative group rounded-xl bg-background border border-border/80 p-4 sm:p-5 transition-all hover:border-[#238636]/50 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 font-mono text-sm sm:text-base">
                  <span className="text-[#7bdb80] font-bold select-none text-base sm:text-lg">$</span>
                  <span className="text-foreground font-semibold tracking-wide select-all truncate">
                    {activeCommand}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={() => handleCopy(activeCommand, "hero-cmd")}
                  className="self-end sm:self-auto h-10 px-4 text-xs font-semibold rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  {copiedId === "hero-cmd" ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      <span>Copy Command</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Explanation Note */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7bdb80]" />
                  {installMode === "global"
                    ? "Installs 'packport' executable globally in your PATH"
                    : installMode === "local"
                    ? "Adds packport-cli as a devDependency in package.json"
                    : "Runs latest version directly via Node.js execution tool"}
                </span>
                <span className="font-mono text-[11px] text-[#7bdb80]">Node.js 18+</span>
              </div>
            </div>
          </div>

          {/* Quick Specs / Trust Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7bdb80]" />
              macOS, Linux & Windows
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#7bdb80]" />
              Signed npm Registry Package
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <a
              href="https://www.npmjs.com/package/packport-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-fixed hover:underline font-medium text-[#7bdb80]"
            >
              <span>View on npmjs.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full max-w-5xl px-6">
          <Separator className="bg-border" />
        </div>

        {/* ═══════════════════════════════════════════
            3-STEP QUICKSTART WORKFLOW
        ═══════════════════════════════════════════ */}
        <section className="w-full max-w-5xl px-6 py-14 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#238636]/10 border border-[#238636]/25 text-[#7bdb80] text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero-Config Setup</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Get Up and Running in 3 Steps
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Connect your workstation to the PackPort dashboard to begin real-time dependency audits and port monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="border-border bg-card shadow-sm hover:border-muted-foreground/40 transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#238636]/15 text-[#7bdb80] border border-[#238636]/30 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
                    Step 1
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">Install the CLI</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Install the PackPort CLI package globally using your preferred package manager:
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/80 font-mono text-xs flex items-center justify-between gap-2">
                  <span className="text-foreground truncate font-medium">npm i -g packport-cli</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("npm i -g packport-cli", "step-1")}
                    className="text-muted-foreground hover:text-foreground p-1 cursor-pointer shrink-0 transition-colors"
                    title="Copy command"
                  >
                    {copiedId === "step-1" ? (
                      <Check className="w-3.5 h-3.5 text-[#7bdb80]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-border bg-card shadow-sm hover:border-muted-foreground/40 transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
                    Step 2
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">Pair Your Workstation</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Link your local terminal daemon using your private Agent ID found in your dashboard:
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/80 font-mono text-xs flex items-center justify-between gap-2">
                  <span className="text-foreground truncate font-medium">packport link &lt;agent-id&gt;</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("packport link <agent-id>", "step-2")}
                    className="text-muted-foreground hover:text-foreground p-1 cursor-pointer shrink-0 transition-colors"
                    title="Copy command"
                  >
                    {copiedId === "step-2" ? (
                      <Check className="w-3.5 h-3.5 text-[#7bdb80]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-border bg-card shadow-sm hover:border-muted-foreground/40 transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
                    Step 3
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">Start Background Sync</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Fire up telemetry monitoring to stream active dev ports and package versions live:
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/80 font-mono text-xs flex items-center justify-between gap-2">
                  <span className="text-foreground truncate font-medium">packport start</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("packport start", "step-3")}
                    className="text-muted-foreground hover:text-foreground p-1 cursor-pointer shrink-0 transition-colors"
                    title="Copy command"
                  >
                    {copiedId === "step-3" ? (
                      <Check className="w-3.5 h-3.5 text-[#7bdb80]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full max-w-5xl px-6">
          <Separator className="bg-border" />
        </div>

        {/* ═══════════════════════════════════════════
            CLI COMMANDS CHEATSHEET
        ═══════════════════════════════════════════ */}
        <section className="w-full max-w-5xl px-6 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-3">
                <Terminal className="w-3.5 h-3.5" />
                <span>Command Reference</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Essential CLI Commands
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Control your telemetry daemon, run on-demand port checks, and audit local runtimes right from your terminal.
              </p>
            </div>

            <Link
              to="/docs/cli"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#7bdb80] hover:underline"
            >
              <span>Full CLI Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLI_COMMANDS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/40 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground group-hover:text-[#7bdb80] transition-colors">
                      {item.cmd}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(item.cmd, `cmd-${idx}`)}
                  className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedId === `cmd-${idx}` ? (
                    <Check className="w-4 h-4 text-[#7bdb80]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full max-w-5xl px-6">
          <Separator className="bg-border" />
        </div>

        {/* ═══════════════════════════════════════════
            SECURITY & RUNTIME ARCHITECTURE
        ═══════════════════════════════════════════ */}
        <section className="w-full max-w-5xl px-6 py-14 pb-20">
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#238636]/10 border border-[#238636]/25 flex items-center justify-center text-[#7bdb80] shrink-0 mt-0.5">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-foreground">
                      Security & Privacy Architecture
                    </h4>
                    <Badge className="bg-[#238636]/20 text-[#7bdb80] border-[#238636]/30 text-[10px]">
                      Zero Code Access
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-xl leading-relaxed">
                    The PackPort npm agent strictly reads active port listening states and installed version numbers. It never reads source code, environment secrets, or sends repository code upstream.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  asChild
                  className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold px-4 h-10 rounded-lg cursor-pointer shadow-sm transition-all"
                >
                  <Link to="/dashboard">
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-xs font-semibold px-4 h-10 rounded-lg border-border hover:bg-muted cursor-pointer transition-all"
                >
                  <a
                    href="https://github.com/ShauryaG05/PackPort"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>GitHub Repo</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">PackPort</span>
            <span>© {new Date().getFullYear()} PackPort. Open-source developer telemetry.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/docs/cli" className="hover:text-foreground transition-colors underline">
              CLI Docs
            </Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors underline">
              Dashboard
            </Link>
            <Link to="/about" className="hover:text-foreground transition-colors underline">
              About Us
            </Link>
            <a
              href="https://github.com/ShauryaG05/PackPort"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
