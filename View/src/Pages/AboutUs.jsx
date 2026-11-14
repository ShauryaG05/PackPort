import React from "react";
import { Link } from "react-router-dom";
import Navbar, { GithubIcon } from "../components/Navbar";
import {
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Activity,
  Zap,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Globe,
  GitBranch,
  Code2,
  Database,
  Radio,
  Server,
  Sparkles,
} from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen w-full bg-[#0d1117] text-[#c9d1d9] font-sans flex flex-col justify-between antialiased selection:bg-blue-500/30 selection:text-white">
      {/* ── 1. Standardized Top Navigation Bar ── */}
      <Navbar />

      <main className="flex-1">
        {/* ── 2. Top Hero Section ── */}
        <div className="relative overflow-hidden border-b border-white/8 bg-linear-to-b from-[#141620] via-[#0f1118] to-[#0d1117] py-16 sm:py-20 px-6 md:px-12">
          {/* Subtle ambient light beam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>About PackPort Telemetry Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Unified Runtime & Port Visibility for Engineering Teams
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              PackPort is an open-source developer telemetry workstation. It continuously monitors
              local package ecosystems, catches upstream dependency drift, and visualizes developer
              ports across Python, Node.js, and Local AI runtimes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://github.com/ShauryaG05/PackPort"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 font-semibold text-xs hover:bg-gray-100 transition-all shadow-md active:scale-95"
              >
                <GithubIcon size={16} />
                <span>Star on GitHub</span>
                <ExternalLink size={13} className="text-gray-600" />
              </a>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#20232b] hover:bg-[#282d38] border border-white/10 text-white font-semibold text-xs transition-all active:scale-95 shadow-sm"
              >
                <span>Open Dashboard</span>
                <ArrowRight size={14} className="text-zinc-400" />
              </Link>

              <Link
                to="/docs/cli"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/8 text-zinc-300 hover:text-white font-medium text-xs transition-colors"
              >
                <Terminal size={14} />
                <span>CLI Terminal Guide</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 3. Main Content Area ── */}
        <div className="max-w-4xl mx-auto px-6 md:px-12 pt-14 space-y-14">
          {/* Why We Built PackPort */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Why We Built PackPort</span>
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Modern full-stack developers often balance multiple language environments at once—Python
              virtual environments, npm global scripts, and local Ollama model weights. Dependencies drift
              out of date silently, creating CVE vulnerabilities, compilation breakage, and port conflicts
              on localhost. PackPort bridges this gap with a lightweight background daemon that reports
              actionable version telemetry in real time.
            </p>
          </section>

          {/* 3 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-[#141620] border border-white/8 space-y-3.5 hover:border-blue-500/30 transition-all shadow-lg group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold group-hover:scale-105 transition-transform">
                <Layers size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Multi-Ecosystem Drift</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatic auditing across PyPI, npm registries, and Ollama weight hubs so you always know
                when security patches and upgrades are available.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141620] border border-white/8 space-y-3.5 hover:border-emerald-500/30 transition-all shadow-lg group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold group-hover:scale-105 transition-transform">
                <Lock size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Zero Source Code Access</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                PackPort only reads package metadata and port telemetry. Your proprietary codebase,
                secrets, and source files never leave your machine.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141620] border border-white/8 space-y-3.5 hover:border-purple-500/30 transition-all shadow-lg group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold group-hover:scale-105 transition-transform">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Real-Time Sockets</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instant bidirectional event streaming via Socket.IO so telemetry scans and upgrade tasks
                render live in your browser window.
              </p>
            </div>
          </div>

          {/* Architecture Overview */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#141620] border border-white/8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Server size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Telemetry Engine Architecture</h3>
                <p className="text-xs text-zinc-400">Continuous background monitoring without performance overhead</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#0e1017] border border-white/6 space-y-2">
                <span className="text-blue-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Python & PyPI
                </span>
                <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                  Scans virtual environments and global pip modules, detecting outdated distributions and lockfile drift.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1017] border border-white/6 space-y-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Node.js & npm
                </span>
                <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                  Monitors global npm packages, yarn caches, and active Node runtimes for SemVer updates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1017] border border-white/6 space-y-2">
                <span className="text-purple-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Ollama Local AI
                </span>
                <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                  Tracks local GGUF models, VRAM utilization, and model weight revisions directly on host.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1017] border border-white/6 space-y-2">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Port Listener
                </span>
                <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                  Visualizes active developer sockets (e.g. 3000, 5173, 8000, 11434) to catch binding conflicts.
                </p>
              </div>
            </div>
          </section>

          {/* Open Source & GitHub Card */}
          <section className="p-6 sm:p-8 rounded-2xl bg-linear-to-r from-[#171a24] to-[#12141c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GithubIcon size={20} className="text-white" />
                <h3 className="text-base font-bold text-white">100% Free & Open Source</h3>
              </div>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                PackPort is published on GitHub under the MIT License. Contributions, feedback, and
                feature requests for new runtimes (Rust Cargo, Go Modules, Docker) are always welcome.
              </p>
            </div>

            <a
              href="https://github.com/ShauryaG05/PackPort"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.35)] transition-all active:scale-95"
            >
              <GitBranch size={15} />
              <span>View on GitHub</span>
              <ExternalLink size={12} />
            </a>
          </section>
        </div>
      </main>

      {/* ── 4. Standard Site Footer ── */}
      <footer className="border-t border-white/8 bg-[#08090d] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PackPort Telemetry Engine • All systems operational</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/docs/cli" className="hover:text-white transition-colors">
              Documentation
            </Link>
            <Link to="/download" className="hover:text-white transition-colors">
              Download
            </Link>
            <a
              href="https://github.com/ShauryaG05/PackPort"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span className="text-zinc-600">|</span>
            <span>&copy; {new Date().getFullYear()} PackPort. MIT License.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
