import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PackPortLogo from "../components/PackPortLogo";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  PanelLeft,
  Link as LinkIcon,
  ExternalLink,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function CliDocs() {
  const [copiedId, setCopiedId] = useState(null);
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [leftNavCollapsed, setLeftNavCollapsed] = useState(false);
  const [expandedNav, setExpandedNav] = useState({
    gettingStarted: true,
    python: false,
    nodejs: false,
    rustGo: false,
    troubleshooting: false,
  });

  const toggleNav = (key) => {
    setExpandedNav((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Scroll listener for table of contents
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "introduction",
        "quickstart",
        "python-pip",
        "nodejs-npm",
        "rust-cargo",
        "go-modules",
        "next-steps",
      ];
      const scrollY = window.scrollY + 120;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tocItems = [
    { id: "introduction", label: "Introduction" },
    { id: "quickstart", label: "Quickstart commands" },
    { id: "python-pip", label: "Python (pip & poetry)" },
    { id: "nodejs-npm", label: "Node.js (npm, pnpm, yarn)" },
    { id: "rust-cargo", label: "Rust (cargo)" },
    { id: "go-modules", label: "Go (modules)" },
    { id: "next-steps", label: "Next steps & best practices" },
  ];

  const fullMarkdownDoc = `# Quickstart for Updating Packages
Get started with updating runtime dependencies and managing outdated versions.

## Introduction
PackPort coordinates with your local agents to discover outdated packages across languages.

## Python (pip)
\`\`\`bash
# Check outdated packages in JSON format
python3 -m pip list --outdated --format=json

# Upgrade single package
python3 -m pip install --upgrade <package_name>
\`\`\`

## Node.js (npm)
\`\`\`bash
# Check outdated npm packages
npm outdated --json

# Update SemVer range
npm update
\`\`\`
`;

  return (
    <div className="min-h-screen bg-background text-[#c9d1d9] font-sans antialiased">
      {/* Top GitHub Docs Style Bar */}
      <div className="border-b border-outline bg-[#161b22]/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back to Dashboard Button */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline bg-background hover:bg-[#21262d] text-xs font-medium text-gray-300 hover:text-white transition-all cursor-pointer shadow-xs group"
            title="Return to PackPort Dashboard"
          >
            <ArrowLeft size={14} className="text-gray-400 group-hover:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-outline hidden sm:block" />

          {/* Docs Brand */}
          <Link to="/docs/cli" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <PackPortLogo size={26} showBadge={false} />
            <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Docs
            </span>
          </Link>

          <button
            onClick={() => setLeftNavCollapsed(!leftNavCollapsed)}
            title="Toggle Docs Navigation"
            className="p-1.5 rounded-md hover:bg-[#21262d] text-gray-400 hover:text-white transition-colors cursor-pointer ml-1"
          >
            <PanelLeft size={16} />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden lg:flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
            <Link to="/dashboard" className="hover:text-white cursor-pointer">Dashboard</Link>
            <span>/</span>
            <span className="text-white font-semibold">Documentation</span>
          </nav>
        </div>

        {/* Right Search Bar */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-background border border-outline text-gray-400 text-xs">
            <span>Version:</span>
            <span className="text-white font-medium">Free, Pro, & Team</span>
          </div>

          <div className="relative w-44 sm:w-60">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search or ask Copilot"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1 rounded-md bg-background border border-outline text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.2 rounded border border-outline bg-[#161b22] text-[10px] text-gray-400 font-mono">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Main 3-Column Docs Layout */}
      <div className="max-w-360 mx-auto flex">
        {/* Left Sub-Sidebar (Collapsible like GitHub Docs) */}
        {!leftNavCollapsed && (
          <aside className="w-64 shrink-0 border-r border-outline p-5 hidden md:block sticky top-12 h-[calc(100vh-48px)] overflow-y-auto">
            <h2 className="text-base font-bold text-white mb-4 tracking-tight">
              Package Managers
            </h2>

            <nav className="space-y-1 text-xs">
              {/* Quickstart (Active item with GitHub green left bar) */}
              <a
                href="#quickstart"
                className="flex items-center justify-between px-3 py-1.5 rounded-r-md text-emerald-400 font-medium bg-emerald-500/10 border-l-2 border-emerald-500 -ml-5 pl-4 transition-colors"
              >
                <span>Quickstart</span>
              </a>

              {/* Accordion 1: Getting Started */}
              <div>
                <button
                  onClick={() => toggleNav("gettingStarted")}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-gray-300 hover:text-white hover:bg-[#21262d] rounded-md transition-colors cursor-pointer"
                >
                  <span>Getting started</span>
                  {expandedNav.gettingStarted ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                {expandedNav.gettingStarted && (
                  <div className="ml-3 pl-2 border-l border-outline mt-1 space-y-1">
                    <a
                      href="#introduction"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      Introduction
                    </a>
                    <a
                      href="#quickstart"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      Core Architecture
                    </a>
                  </div>
                )}
              </div>

              {/* Accordion 2: Python */}
              <div>
                <button
                  onClick={() => toggleNav("python")}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-gray-300 hover:text-white hover:bg-[#21262d] rounded-md transition-colors cursor-pointer"
                >
                  <span>Python (pip & poetry)</span>
                  {expandedNav.python ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                {expandedNav.python && (
                  <div className="ml-3 pl-2 border-l border-outline mt-1 space-y-1">
                    <a
                      href="#python-pip"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      pip outdated
                    </a>
                    <a
                      href="#python-pip"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      pip install --upgrade
                    </a>
                  </div>
                )}
              </div>

              {/* Accordion 3: Node.js */}
              <div>
                <button
                  onClick={() => toggleNav("nodejs")}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-gray-300 hover:text-white hover:bg-[#21262d] rounded-md transition-colors cursor-pointer"
                >
                  <span>Node.js ecosystem</span>
                  {expandedNav.nodejs ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                {expandedNav.nodejs && (
                  <div className="ml-3 pl-2 border-l border-outline mt-1 space-y-1">
                    <a
                      href="#nodejs-npm"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      npm outdated & update
                    </a>
                    <a
                      href="#nodejs-npm"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      pnpm & yarn
                    </a>
                  </div>
                )}
              </div>

              {/* Accordion 4: Rust & Go */}
              <div>
                <button
                  onClick={() => toggleNav("rustGo")}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-gray-300 hover:text-white hover:bg-[#21262d] rounded-md transition-colors cursor-pointer"
                >
                  <span>Rust & Go</span>
                  {expandedNav.rustGo ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                {expandedNav.rustGo && (
                  <div className="ml-3 pl-2 border-l border-outline mt-1 space-y-1">
                    <a
                      href="#rust-cargo"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      cargo outdated & update
                    </a>
                    <a
                      href="#go-modules"
                      className="block px-2 py-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      go get -u & go mod tidy
                    </a>
                  </div>
                )}
              </div>

              {/* Additional Sections */}
              <div className="pt-4 border-t border-outline mt-4 space-y-1">
                <a
                  href="#next-steps"
                  className="block px-2 py-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
                >
                  Reference & Safety
                </a>
                <a
                  href="#next-steps"
                  className="block px-2 py-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
                >
                  Troubleshooting
                </a>

                {/* Return to Main Site Button */}
                <div className="pt-3 mt-3 border-t border-outline/60">
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-gray-300 hover:text-white bg-[#161b22] hover:bg-[#21262d] border border-outline hover:border-blue-500/40 rounded-lg transition-all group shadow-xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowLeft size={13} className="text-gray-400 group-hover:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
                      <span>Main Site</span>
                    </span>
                  </Link>
                </div>
              </div>
            </nav>
          </aside>
        )}

        {/* Center Article Reading Column */}
        <main className="flex-1 min-w-0 px-6 md:px-12 py-10 max-w-4xl">
          {/* Article Hero */}
          <div className="pb-6 border-b border-outline mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Quickstart for Package Updates
            </h1>
            <p className="text-base text-gray-400 mt-2 font-normal">
              Inspect outdated dependencies, upgrade packages, and lock telemetry across all your project runtimes.
            </p>
          </div>

          {/* Section 1: Introduction */}
          <section id="introduction" className="space-y-4 mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Introduction
              </h2>
              <a
                href="#introduction"
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
              >
                <LinkIcon size={16} />
              </a>
            </div>

            <p className="text-sm leading-relaxed text-gray-300">
              In modern software projects, packages frequently release security patches, performance improvements, and bug fixes. PackPort connects with your background agent (<code className="text-blue-400 font-mono bg-[#161b22] px-1.5 py-0.5 rounded border border-outline">packport-agent</code>) to run package manager audits and keep versions up to date.
            </p>

            <p className="text-sm leading-relaxed text-gray-300">
              From this guide, you will learn the standard CLI commands to check which packages are outdated, how to inspect differences in JSON format, and how to safely perform upgrades without breaking production lockfiles.
            </p>
          </section>

          {/* Section 2: Quickstart Steps */}
          <section id="quickstart" className="space-y-6 mb-14 scroll-mt-20">
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Quickstart commands
              </h2>
              <a
                href="#quickstart"
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
              >
                <LinkIcon size={16} />
              </a>
            </div>

            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Run the automated agent scan from your dashboard
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Navigate to your PackPort Dashboard and trigger the background agent scan.
                  </p>
                </div>
              </div>

              {/* Code Box */}
              <div className="ml-9 rounded-lg bg-[#161b22] border border-outline overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-outline bg-[#1a202c]/50 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-2">
                    <Terminal size={13} className="text-blue-400" />
                    <span>Terminal</span>
                  </span>
                  <button
                    onClick={() => handleCopy("npx packport-agent sync", "agent-sync")}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedId === "agent-sync" ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                  <span className="text-gray-500 select-none mr-2">$</span>
                  npx packport-agent sync
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Inspect outdated packages in your active environment
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Execute the language-specific inspection command below.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Python */}
          <section id="python-pip" className="space-y-5 mb-14 scroll-mt-20 border-t border-outline pt-8">
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Python (pip & poetry)
              </h2>
              <a
                href="#python-pip"
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
              >
                <LinkIcon size={16} />
              </a>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Python packages managed by <code className="text-amber-300 font-mono bg-[#161b22] px-1 rounded border border-outline">pip</code> can report their versions directly as JSON:
            </p>

            {/* Command 1 */}
            <div className="rounded-lg bg-[#161b22] border border-outline overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline bg-[#1a202c]/50 text-xs font-mono text-gray-400">
                <span>Check Outdated Packages (JSON Format)</span>
                <button
                  onClick={() =>
                    handleCopy("python3 -m pip list --outdated --format=json", "py-check")
                  }
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === "py-check" ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copiedId === "py-check" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                <span className="text-gray-500 select-none mr-2">$</span>
                python3 -m pip list --outdated --format=json
              </div>
            </div>

            {/* Command 2 */}
            <div className="rounded-lg bg-[#161b22] border border-outline overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline bg-[#1a202c]/50 text-xs font-mono text-gray-400">
                <span>Upgrade Specific Package to Latest</span>
                <button
                  onClick={() =>
                    handleCopy("python3 -m pip install --upgrade <package_name>", "py-up")
                  }
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === "py-up" ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copiedId === "py-up" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                <span className="text-gray-500 select-none mr-2">$</span>
                python3 -m pip install --upgrade &lt;package_name&gt;
              </div>
            </div>
          </section>

          {/* Section 4: Node.js */}
          <section id="nodejs-npm" className="space-y-5 mb-14 scroll-mt-20 border-t border-outline pt-8">
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Node.js (npm, pnpm, yarn, bun)
              </h2>
              <a
                href="#nodejs-npm"
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
              >
                <LinkIcon size={16} />
              </a>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              In Node.js applications, use <code className="text-emerald-300 font-mono bg-[#161b22] px-1 rounded border border-outline">npm outdated</code> to view the currently installed version versus the maximum allowed by your <code className="text-gray-300 font-mono">package.json</code>:
            </p>

            <div className="rounded-lg bg-[#161b22] border border-outline overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline bg-[#1a202c]/50 text-xs font-mono text-gray-400">
                <span>Check npm Dependencies</span>
                <button
                  onClick={() => handleCopy("npm outdated --json", "npm-out")}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === "npm-out" ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copiedId === "npm-out" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                <span className="text-gray-500 select-none mr-2">$</span>
                npm outdated --json
              </div>
            </div>

            <div className="rounded-lg bg-[#161b22] border border-outline overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline bg-[#1a202c]/50 text-xs font-mono text-gray-400">
                <span>Interactive Major Upgrade (npm-check-updates)</span>
                <button
                  onClick={() => handleCopy("npx npm-check-updates -u && npm install", "ncu")}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === "ncu" ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copiedId === "ncu" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                <span className="text-gray-500 select-none mr-2">$</span>
                npx npm-check-updates -u &amp;&amp; npm install
              </div>
            </div>
          </section>

          {/* Section 5: Rust */}
          <section id="rust-cargo" className="space-y-5 mb-14 scroll-mt-20 border-t border-outline pt-8">
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Rust (cargo)
              </h2>
              <a
                href="#rust-cargo"
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
              >
                <LinkIcon size={16} />
              </a>
            </div>

            <div className="rounded-lg bg-[#161b22] border border-outline overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline bg-[#1a202c]/50 text-xs font-mono text-gray-400">
                <span>Cargo Update</span>
                <button
                  onClick={() => handleCopy("cargo update", "cargo-up")}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === "cargo-up" ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copiedId === "cargo-up" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                <span className="text-gray-500 select-none mr-2">$</span>
                cargo update
              </div>
            </div>
          </section>

          {/* Section 6: Go */}
          <section id="go-modules" className="space-y-5 mb-14 scroll-mt-20 border-t border-outline pt-8">
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Go (modules)
              </h2>
              <a
                href="#go-modules"
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
              >
                <LinkIcon size={16} />
              </a>
            </div>

            <div className="rounded-lg bg-[#161b22] border border-outline overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline bg-[#1a202c]/50 text-xs font-mono text-gray-400">
                <span>Update Go Modules</span>
                <button
                  onClick={() => handleCopy("go get -u ./... && go mod tidy", "go-up")}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === "go-up" ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copiedId === "go-up" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                <span className="text-gray-500 select-none mr-2">$</span>
                go get -u ./... &amp;&amp; go mod tidy
              </div>
            </div>
          </section>

          {/* Section 7: Next Steps & Safety Alert */}
          <section id="next-steps" className="space-y-5 mb-16 scroll-mt-20 border-t border-outline pt-8">
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Next steps & best practices
              </h2>
              <a
                href="#next-steps"
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
              >
                <LinkIcon size={16} />
              </a>
            </div>

            <div className="rounded-xl bg-[#161b22] border border-outline p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                <ShieldCheck size={18} />
                <span>Verification & Lockfile Hygiene</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>Always run your automated test suite prior to committing version upgrades.</li>
                <li>Ensure lockfiles (<code className="font-mono text-gray-200">package-lock.json</code>, <code className="font-mono text-gray-200">poetry.lock</code>, <code className="font-mono text-gray-200">Cargo.lock</code>) are checked into version control.</li>
                <li>Use PackPort's telemetry agent to automatically monitor outdated packages across team machines.</li>
              </ul>
            </div>
          </section>
        </main>

        {/* Right Sidebar: "In this article" (Sticky like GitHub Docs) */}
        <aside className="w-64 shrink-0 p-6 hidden lg:block sticky top-12 h-[calc(100vh-48px)] overflow-y-auto">
          {/* Action button */}
          <div className="mb-6">
            <button
              onClick={() => handleCopy(fullMarkdownDoc, "copy-md")}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-[#161b22] hover:bg-[#21262d] border border-outline text-xs font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Copy size={13} />
                <span>Copy as Markdown</span>
              </div>
              {copiedId === "copy-md" && (
                <Check size={13} className="text-emerald-400" />
              )}
            </button>
          </div>

          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            In this article
          </h3>

          <ul className="space-y-2 text-xs">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block transition-colors ${activeSection === item.id
                      ? "text-blue-400 font-medium"
                      : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-outline space-y-2 text-xs text-gray-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between hover:text-white transition-colors"
            >
              <span>View PackPort on GitHub</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
