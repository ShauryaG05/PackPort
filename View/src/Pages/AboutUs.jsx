import React from "react";
import { Link } from "react-router-dom";
import PackPortLogo from "../components/PackPortLogo";
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
} from "lucide-react";

function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function AboutUs() {
  return (
    <div className="min-h-full w-full bg-[#111317] text-[#c9d1d9] font-sans pb-20 selection:bg-primary/30">
      {/* Top Hero Section */}
      <div className="relative overflow-hidden border-b border-white/6 bg-linear-to-b from-[#181a22] to-[#111317] py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>About PackPort Telemetry Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Unified Runtime & Port Visibility for Engineering Teams
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
            PackPort is an open-source developer telemetry workstation. It continuously monitors
            local package ecosystems, catches upstream dependency drift, and visualizes developer
            ports across Python, Node.js, and Local AI runtimes.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/ShauryaG05/PackPort"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 font-semibold text-xs hover:bg-gray-200 transition-all shadow-md active:scale-95"
            >
              <GithubIcon size={16} />
              <span>Star on GitHub</span>
              <ExternalLink size={13} className="text-gray-600" />
            </a>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#20232b] hover:bg-[#282d38] border border-white/8 text-white font-semibold text-xs transition-all active:scale-95"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={14} className="text-gray-400" />
            </Link>

            <Link
              to="/docs/cli"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-medium text-xs transition-colors"
            >
              <Terminal size={14} />
              <span>CLI Terminal Guide</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-12 space-y-12">
        {/* Core Pillars */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Why We Built PackPort</span>
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Modern full-stack developers often balance multiple language environments at once—Python
            virtual environments, npm global scripts, and local Ollama model weights. Dependencies drift
            out of date silently, creating CVE vulnerabilities, compilation breakage, and port conflicts
            on localhost. PackPort bridges this gap with a lightweight background daemon that reports
            actionable version telemetry in real time.
          </p>
        </section>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#181a20] border border-white/6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              <Layers size={20} />
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Ecosystem Drift</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automatic auditing across PyPI, npm registries, and Ollama weight hubs so you always know
              when security patches are available.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#181a20] border border-white/6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <Lock size={20} />
            </div>
            <h3 className="text-sm font-bold text-white">Zero Source Code Access</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              PackPort only reads package metadata and port telemetry. Your proprietary codebase,
              secrets, and source files never leave your machine.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#181a20] border border-white/6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
              <Activity size={20} />
            </div>
            <h3 className="text-sm font-bold text-white">Real-Time Sockets</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Instant bidirectional event streaming via Socket.IO so telemetry scans and upgrade tasks
              render live in your browser window.
            </p>
          </div>
        </div>

        {/* Open Source & GitHub Card */}
        <section className="p-6 rounded-2xl bg-linear-to-r from-[#1c1f28] to-[#161820] border border-white/8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GithubIcon size={20} className="text-white" />
              <h3 className="text-base font-bold text-white">100% Free & Open Source</h3>
            </div>
            <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
              PackPort is published on GitHub under the MIT License. Contributions, feedback, and
              feature requests for new runtimes (Rust Cargo, Go Modules, Docker) are always welcome.
            </p>
          </div>

          <a
            href="https://github.com/ShauryaG05/PackPort"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs flex items-center gap-2 shrink-0 shadow-sm transition-all active:scale-95"
          >
            <GitBranch size={15} />
            <span>View on GitHub</span>
            <ExternalLink size={12} />
          </a>
        </section>
      </div>
    </div>
  );
}
