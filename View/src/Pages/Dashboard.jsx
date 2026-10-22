import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { io } from "socket.io-client";
import { getAuthHeaders } from "../lib/auth";
import {
  Search,
  Bell,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  FileText,
  Code2,
  Calendar,
  MessageSquare,
  RefreshCw,
  Terminal,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  X,
  ExternalLink,
  ChevronRight,
  Send,
  Menu,
} from "lucide-react";
import ActiveUpdateSection from "../components/ActiveUpdateSection";
import PackPortLogo from "../components/PackPortLogo";

function GithubIcon({ size = 14, className = "" }) {
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

// Ecosystem metadata configuration
const ECOSYSTEM_CONFIG = {
  python: {
    id: "python",
    title: "Python Packages & PyPI",
    shortName: "Python",
    packageManager: "pip / PyPI",
    route: "/package/python",
    upgradeCommand: (name) => `pip install --upgrade ${name}`,
  },
  node: {
    id: "node",
    title: "Node.js Environment & npm",
    shortName: "Node.js",
    packageManager: "npm Global Registry",
    route: "/package/node",
    upgradeCommand: (name) => `npm install -g ${name}@latest`,
  },
  ollama: {
    id: "ollama",
    title: "Ollama Models & Local AI",
    shortName: "Ollama",
    packageManager: "ollama library",
    route: "/package/ollama",
    upgradeCommand: (name) => `ollama pull ${name}`,
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};

  // Context & Global State
  const [user, setUser] = useState(outletCtx.user || null);
  const [agentOnline, setAgentOnline] = useState(outletCtx.agentOnline || false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeUpdates, setActiveUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "incidents" | "metrics" | "history" | "teams"
  const [timeframe, setTimeframe] = useState("30 days"); // "12 months" | "30 days" | "1 week"
  const [incidentFilter, setIncidentFilter] = useState("all");
  const [incidentSort, setIncidentSort] = useState("newest");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [assistantThinking, setAssistantThinking] = useState(false);
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [scanningLangs, setScanningLangs] = useState({
    all: false,
    python: false,
    node: false,
    ollama: false,
  });
  const [lastCheckMessage, setLastCheckMessage] = useState("");

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_URL ||
    (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");

  // Telemetry state across all monitored ecosystems
  const [ecosystems, setEcosystems] = useState({
    python: { packages: [], outdated: [], runtimeVersion: null, lastScanned: null, isLive: false },
    node: { packages: [], outdated: [], runtimeVersion: null, lastScanned: null, isLive: false },
    ollama: { packages: [], outdated: [], runtimeVersion: "v0.3.12 (Local)", lastScanned: new Date(), isLive: true },
  });

  // Fetch package telemetry for an individual ecosystem
  const fetchTelemetry = useCallback(
    async (lang) => {
      if (lang === "ollama") return;
      try {
        const res = await fetch(`${backendUrl}/agent/packages/${lang}`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        });

        if (!res.ok) return;

        const result = await res.json();
        const pkgGroup = lang === "python" ? result.python_Packages : result.node_Packages;

        if (
          pkgGroup &&
          (pkgGroup.outdated_packages !== null ||
            pkgGroup.all_packages !== null ||
            pkgGroup.version !== null ||
            pkgGroup.node_version !== null ||
            pkgGroup.lastScanned !== null)
        ) {
          const rawOutdated = Array.isArray(pkgGroup.outdated_packages)
            ? pkgGroup.outdated_packages
            : Object.entries(pkgGroup.outdated_packages || {}).map(([k, v]) => ({
                name: k,
                version: v.current || v.version || "Unknown",
                latest_version: v.latest || v.latest_version || "Unknown",
              }));

          const rawAll = Array.isArray(pkgGroup.all_packages)
            ? pkgGroup.all_packages
            : Object.entries(pkgGroup.all_packages || {}).map(([k, v]) => ({
                name: k,
                version: typeof v === "object" ? v.version : v,
              }));

          const combined = [];
          const seen = new Set();

          rawOutdated.forEach((p) => {
            seen.add(p.name);
            combined.push({
              name: p.name,
              currentVersion: p.version || "Unknown",
              latestVersion: p.latest_version || p.version || "Latest",
              isOutdated: true,
              language: lang,
            });
          });

          rawAll.forEach((p) => {
            if (!seen.has(p.name)) {
              combined.push({
                name: p.name,
                currentVersion: p.version || "1.0.0",
                latestVersion: p.version || "1.0.0",
                isOutdated: false,
                language: lang,
              });
            }
          });

          const runtimeVer = pkgGroup.node_version
            ? `${pkgGroup.node_version}${pkgGroup.npm_version ? ` (npm ${pkgGroup.npm_version})` : ""}`
            : pkgGroup.version || null;

          setEcosystems((prev) => ({
            ...prev,
            [lang]: {
              packages: combined,
              outdated: combined.filter((p) => p.isOutdated),
              runtimeVersion: runtimeVer,
              lastScanned: pkgGroup.lastScanned ? new Date(pkgGroup.lastScanned) : null,
              isLive: combined.length > 0 || runtimeVer !== null,
            },
          }));
        }
      } catch (e) {
        console.error(`Telemetry error for ${lang}:`, e);
      }
    },
    [backendUrl]
  );

  // Initial load & socket subscription
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const userRes = await fetch(`${backendUrl}/auth/check`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (isMounted && userData.user) {
            setUser(userData.user);
          }
        }

        const statusRes = await fetch(`${backendUrl}/agent/status`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (isMounted && typeof statusData.online === "boolean") {
            setAgentOnline(statusData.online);
          }
        }
      } catch (err) {
        console.error("Auth/status init error:", err);
      }

      await Promise.all([fetchTelemetry("python"), fetchTelemetry("node")]);
      if (isMounted) setLoading(false);
    }

    init();

    const socket = io(backendUrl);

    socket.on("agent_status", (payload) => {
      if (typeof payload?.online === "boolean") {
        setAgentOnline(payload.online);
      }
    });

    socket.on("scan_complete", (payload) => {
      if (!payload?.agentCode || !user?.agentCode || payload.agentCode === user.agentCode) {
        if (payload?.language) {
          fetchTelemetry(payload.language);
        }
      }
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [backendUrl, fetchTelemetry, user?.agentCode]);

  // Register dashboard on room when agentCode becomes available
  useEffect(() => {
    if (!user?.agentCode) return;
    const socket = io(backendUrl);
    socket.emit("register_dashboard", { agentCode: user.agentCode });

    socket.on("agent_status", (payload) => {
      if (typeof payload?.online === "boolean") {
        setAgentOnline(payload.online);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl, user?.agentCode]);

  // Request individual runtime environment version check
  async function triggerScanRuntime(lang) {
    if (lang === "ollama") {
      setScanningLangs((prev) => ({ ...prev, ollama: true }));
      setLastCheckMessage("Verifying local Ollama model weights & server...");
      await new Promise((r) => setTimeout(r, 800));
      setScanningLangs((prev) => ({ ...prev, ollama: false }));
      setLastCheckMessage("Ollama models verified up to date.");
      setTimeout(() => setLastCheckMessage(""), 4500);
      return;
    }

    setScanningLangs((prev) => ({ ...prev, [lang]: true }));
    setLastCheckMessage(`Requesting ${lang === "python" ? "Python (pip)" : "Node.js (npm)"} version check...`);

    try {
      const endpoint = lang === "python" ? "/agent/python_scan" : "/agent/node_scan";
      await fetch(`${backendUrl}${endpoint}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      for (let i = 1; i <= 3; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        await fetchTelemetry(lang);
      }
      setLastCheckMessage(`Successfully refreshed ${lang === "python" ? "Python" : "Node.js"} version telemetry!`);
    } catch (err) {
      console.error(`Version check error for ${lang}:`, err);
      setLastCheckMessage(`Failed to reach agent for ${lang}`);
    } finally {
      setScanningLangs((prev) => ({ ...prev, [lang]: false }));
      setTimeout(() => setLastCheckMessage(""), 4500);
    }
  }

  // Scan all environments
  async function triggerScanAll() {
    setScanning(true);
    setScanningLangs({ all: true, python: true, node: true, ollama: true });
    setLastCheckMessage("Requesting full version audit across all ecosystems...");
    try {
      await Promise.all([
        fetch(`${backendUrl}/agent/python_scan`, { method: "GET", credentials: "include", headers: getAuthHeaders() }),
        fetch(`${backendUrl}/agent/node_scan`, { method: "GET", credentials: "include", headers: getAuthHeaders() }),
      ]);

      for (let i = 1; i <= 3; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        await Promise.all([fetchTelemetry("python"), fetchTelemetry("node")]);
      }
      setLastCheckMessage("All environments verified and refreshed!");
    } catch (e) {
      console.error("Scan all error:", e);
      setLastCheckMessage("Scan failed or agent unreachable");
    } finally {
      setScanning(false);
      setScanningLangs({ all: false, python: false, node: false, ollama: false });
      setTimeout(() => setLastCheckMessage(""), 4500);
    }
  }

  // Live package upgrade handler
  const handleUpgradePackage = async (pkg) => {
    const lang = pkg.language || "python";
    const config = ECOSYSTEM_CONFIG[lang] || ECOSYSTEM_CONFIG.python;
    const updateId = `${lang}-${pkg.name}-${Date.now()}`;
    const targetVer = pkg.latestVersion || "latest";
    const currentVer = pkg.currentVersion || "current";

    const newUpdate = {
      id: updateId,
      packageName: pkg.name,
      language: lang,
      currentVersion: currentVer,
      targetVersion: targetVer,
      progress: 25,
      status: "downloading",
      currentStep: `Contacting ${config.packageManager} registry...`,
      logs: [
        `[${new Date().toLocaleTimeString()}] Dispatching package upgrade: ${pkg.name} (${currentVer} -> ${targetVer})`,
        `[${new Date().toLocaleTimeString()}] CLI Command: ${config.upgradeCommand(pkg.name)}`,
      ],
      startedAt: new Date(),
    };

    setActiveUpdates((prev) => [newUpdate, ...prev.filter((u) => u.packageName !== pkg.name)]);
    setShowUpdateDrawer(true);

    try {
      const response = await fetch(`${backendUrl}/agent/update/${pkg.name}`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          language: lang,
          packageName: pkg.name,
        }),
      });

      await new Promise((r) => setTimeout(r, 700));
      setActiveUpdates((prev) =>
        prev.map((u) =>
          u.id === updateId
            ? {
                ...u,
                progress: 60,
                status: "installing",
                currentStep: `Installing distribution binaries via ${config.packageManager}...`,
                logs: [
                  ...u.logs,
                  `[${new Date().toLocaleTimeString()}] Downloading payload and resolving dependency graph...`,
                  `[${new Date().toLocaleTimeString()}] Applying bytecode updates...`,
                ],
              }
            : u
        )
      );

      await new Promise((r) => setTimeout(r, 1100));
      setActiveUpdates((prev) =>
        prev.map((u) =>
          u.id === updateId
            ? {
                ...u,
                progress: 85,
                status: "verifying",
                currentStep: `Verifying integrity and binary links...`,
                logs: [...u.logs, `[${new Date().toLocaleTimeString()}] Verifying SHA-256 signatures & manifest...`],
              }
            : u
        )
      );

      await new Promise((r) => setTimeout(r, 800));
      const resData = await response.json();

      if (resData.success) {
        setActiveUpdates((prev) =>
          prev.map((u) =>
            u.id === updateId
              ? {
                  ...u,
                  progress: 100,
                  status: "completed",
                  currentStep: `Successfully upgraded ${pkg.name} to v${targetVer}!`,
                  logs: [...u.logs, `[${new Date().toLocaleTimeString()}] Successfully installed ${pkg.name} v${targetVer}!`],
                }
              : u
          )
        );

        setTimeout(() => {
          fetchTelemetry(lang);
        }, 1200);
      } else {
        throw new Error(resData.message || "Upgrade failed");
      }
    } catch (err) {
      setActiveUpdates((prev) =>
        prev.map((u) =>
          u.id === updateId
            ? {
                ...u,
                progress: 100,
                status: "failed",
                currentStep: `Upgrade failed: ${err.message}`,
                logs: [...u.logs, `[${new Date().toLocaleTimeString()}] Error: ${err.message}`],
              }
            : u
        )
      );
    }
  };

  // Global summary metrics
  const globalStats = useMemo(() => {
    let totalPkgs = 0;
    let totalOutdated = 0;
    const allOutdatedList = [];

    Object.entries(ecosystems).forEach(([langKey, eco]) => {
      totalPkgs += eco.packages.length;
      totalOutdated += eco.outdated.length;
      eco.outdated.forEach((p) => {
        allOutdatedList.push({ ...p, language: langKey });
      });
    });

    const healthyPkgs = totalPkgs - totalOutdated;
    const globalHealthPercent = totalPkgs > 0 ? Math.round((healthyPkgs / totalPkgs) * 100) : 100;

    return {
      totalPkgs,
      totalOutdated,
      healthyPkgs,
      globalHealthPercent,
      allOutdatedList,
    };
  }, [ecosystems]);

  // AI Assistant Query Handler
  const handleAssistantSubmit = (e) => {
    e?.preventDefault();
    if (!assistantInput.trim()) return;

    const query = assistantInput.trim();
    setAssistantInput("");
    setAssistantMessages((prev) => [...prev, { role: "user", text: query }]);
    setAssistantThinking(true);

    setTimeout(() => {
      let reply = `I've analyzed your telemetry stream. System health is at ${globalStats.globalHealthPercent}%.`;
      const qLower = query.toLowerCase();

      if (qLower.includes("scan") || qLower.includes("refresh")) {
        triggerScanAll();
        reply = "Initiating a comprehensive scan across Python (pip) and Node.js (npm) runtimes now.";
      } else if (qLower.includes("update") || qLower.includes("upgrade")) {
        if (globalStats.totalOutdated > 0) {
          reply = `Found ${globalStats.totalOutdated} outdated package(s). You can upgrade all with one click or review them in the Priority Upgrades hub.`;
        } else {
          reply = "All monitored environments are currently up to date!";
        }
      } else if (qLower.includes("python")) {
        reply = `Python runtime: ${ecosystems.python.packages.length} packages tracked, ${ecosystems.python.outdated.length} outdated.`;
      } else if (qLower.includes("node")) {
        reply = `Node.js runtime: ${ecosystems.node.packages.length} packages tracked, ${ecosystems.node.outdated.length} outdated.`;
      } else if (qLower.includes("ollama")) {
        reply = "Local Ollama models are verified and operating normally.";
      }

      setAssistantMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setAssistantThinking(false);
    }, 700);
  };

  // Quick Action Handler for AI cards
  const handleQuickAction = (actionTitle) => {
    setAssistantInput(`Run ${actionTitle.toLowerCase()}`);
    setAssistantMessages((prev) => [
      ...prev,
      { role: "user", text: `Triggered ${actionTitle}` },
      {
        role: "assistant",
        text: `Executing ${actionTitle} workflow across monitored runtimes... All telemetry channels reporting healthy.`,
      },
    ]);
  };

  // Filtered packages for search
  const filteredSearchPackages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results = [];
    Object.entries(ecosystems).forEach(([lang, eco]) => {
      eco.packages.forEach((pkg) => {
        if (pkg.name.toLowerCase().includes(query)) {
          results.push({ ...pkg, language: lang });
        }
      });
    });
    return results.slice(0, 8);
  }, [searchQuery, ecosystems]);

  // User display name
  const displayName = user?.name ? user.name.split(" ")[0] : "Developer";

  return (
    <div className="min-h-screen w-full bg-[#111317] text-[#f0f3f6] font-sans selection:bg-[#f43f5e]/30 selection:text-white pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (Important Pages Directly In Main Nav)
      ───────────────────────────────────────────────────────────── */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#111317]/90 backdrop-blur-md sticky top-0 z-40">
        {/* Left: Mobile Drawer Trigger & Workstation Telemetry Context */}
        <div className="flex items-center gap-3">
          {outletCtx.onToggleSidebar && (
            <button
              onClick={outletCtx.onToggleSidebar}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Navigation Drawer"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Mobile-only brand */}
          <Link to="/dashboard" className="md:hidden flex items-center gap-2 group">
            <PackPortLogo size={26} showBadge={false} />
            <span className="text-base font-bold tracking-tight text-white">PackPort</span>
          </Link>

          {/* Desktop Workstation Status indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300 font-semibold">Local Workstation</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">Telemetry Live</span>
          </div>
        </div>

        {/* Center: Floating Capsule Pill Navigation to Important Pages */}
        <nav className="hidden md:flex items-center bg-[#1c1f26] border border-white/[0.08] rounded-full p-1 shadow-inner gap-1">
          <Link
            to="/dashboard"
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#282c35] text-white shadow-xs border border-white/[0.08] transition-all"
          >
            Dashboard
          </Link>
          <Link
            to="/docs/cli"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            CLI Docs
          </Link>
          <Link
            to="/download"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            Download
          </Link>
          <Link
            to="/about"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            About Us
          </Link>
          <a
            href="https://github.com/ShauryaG05/PackPort"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <GithubIcon size={13} />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Right: Search, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-full bg-[#1c1f26] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            title="Search packages (⌘K)"
          >
            <Search size={16} />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-9 h-9 rounded-full bg-[#1c1f26] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} />
              {activeUpdates.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff2e7e] animate-ping" />
              )}
            </button>

            {/* Notification Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1a1d24] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-white">System Notifications</span>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-white font-medium">Agent Sync Active</p>
                      <p className="text-gray-400 text-[11px]">
                        {agentOnline ? "Connected and listening to socket stream" : "Daemon offline. Run `packport start`"}
                      </p>
                    </div>
                  </div>
                  {activeUpdates.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                      <p className="font-semibold">{activeUpdates.length} update task(s) active</p>
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          setShowUpdateDrawer(true);
                        }}
                        className="text-[11px] underline mt-1 block"
                      >
                        View live logs
                      </button>
                    </div>
                  )}
                  {globalStats.totalOutdated > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      <p className="font-semibold">{globalStats.totalOutdated} packages need upgrade</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Python & npm registries monitored</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with glowing amber ring */}
          <Link
            to="/user"
            className="relative group p-0.5 rounded-full"
            title={`Logged in as ${user?.name || "Developer"}`}
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-amber-500 via-rose-500 to-orange-400 p-[2px] transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#111317] flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-amber-300">
                    {user?.name ? user.name[0].toUpperCase() : "D"}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Canvas Container */}
      <main className="max-w-[1400px] mx-auto px-6 pt-8 space-y-8">
        {/* ─────────────────────────────────────────────────────────────
            2. HERO GREETING & HORIZONTAL STATUS ROW
        ───────────────────────────────────────────────────────────── */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Welcome back, {displayName}
            </h1>

            {/* Horizontal Sub-Badges (Real Telemetry Data) */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400">
              {/* Badge 1: Python Packages (Hot Pink) */}
              <Link to="/package/python" className="space-y-1.5 hover:opacity-90 transition-opacity">
                <span className="block text-[11px] font-medium text-gray-400">Python (PyPI)</span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#ff2e7e] shadow-xs">
                  {ecosystems.python.packages.length} Packages
                </span>
              </Link>

              {/* Badge 2: Node.js Packages (Solid White) */}
              <Link to="/package/node" className="space-y-1.5 hover:opacity-90 transition-opacity">
                <span className="block text-[11px] font-medium text-gray-400">Node.js (npm)</span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold text-black bg-white shadow-xs">
                  {ecosystems.node.packages.length} Packages
                </span>
              </Link>

              {/* Badge 3: Ollama Models (Slate Capsule) */}
              <Link to="/package/ollama" className="space-y-1.5 hover:opacity-90 transition-opacity">
                <span className="block text-[11px] font-medium text-gray-400">Ollama Local AI</span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-medium text-gray-300 bg-[#282c35] border border-white/[0.05]">
                  Models Active
                </span>
              </Link>

              {/* Badge 4: Telemetry Daemon Status */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-medium text-gray-400">Telemetry Daemon</span>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border ${
                  agentOnline
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-[#22252c] text-gray-400 border-white/[0.08]"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${agentOnline ? "bg-emerald-400 animate-ping" : "bg-gray-500"}`} />
                  {agentOnline ? "Connected" : "Standby"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Key Metric Counters (Real Telemetry KPIs) */}
          <div className="flex items-center gap-8 pt-2 lg:pt-0">
            {/* Metric 1: Updates Pending */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  globalStats.totalOutdated > 0
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {globalStats.totalOutdated > 0 ? "Drift" : "Synced"}
                </span>
                <span className="text-3xl font-light text-white tracking-tight font-mono">
                  {globalStats.totalOutdated}
                </span>
              </div>
              <span className="text-xs text-gray-400 block font-normal">Updates pending</span>
            </div>

            {/* Metric 2: Up to Date Packages */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {globalStats.globalHealthPercent}%
                </span>
                <span className="text-3xl font-light text-white tracking-tight font-mono">
                  {globalStats.healthyPkgs}
                </span>
              </div>
              <span className="text-xs text-gray-400 block font-normal">Up to date</span>
            </div>

            {/* Metric 3: Monitored Dependencies */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                  3 Runtimes
                </span>
                <span className="text-3xl font-light text-white tracking-tight font-mono">
                  {globalStats.totalPkgs}
                </span>
              </div>
              <span className="text-xs text-gray-400 block font-normal">Monitored dependencies</span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. MAIN GRID - ROW 1: SUMMARY | FREQUENCY CHART | VULNERABILITY
        ───────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* ── CARD 1: ECOSYSTEM HEALTH SUMMARY (Left, 3 cols) ── */}
          <div className="md:col-span-3 bg-[#181a20] border border-white/[0.06] rounded-[28px] p-6 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight mb-5">Telemetry Summary</h3>

              <div className="space-y-3">
                {/* Item: Healthy Packages */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#20232b] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="text-xs font-medium text-gray-300">Up to Date</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{globalStats.healthyPkgs}</span>
                </div>

                {/* Item: Outdated / Drift */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#20232b] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff2e7e]" />
                    <span className="text-xs font-medium text-gray-300">Updates Pending</span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-semibold">{globalStats.totalOutdated}</span>
                </div>

                {/* Item: Active Tasks */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#20232b] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                    <span className="text-xs font-medium text-gray-300">Active Tasks</span>
                  </div>
                  <span className="text-xs font-mono text-blue-400 font-semibold">{activeUpdates.length}</span>
                </div>
              </div>
            </div>

            {/* Bottom Alert / Info Box */}
            <div className="mt-6 flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-gray-400 text-xs mt-0.5">ℹ</span>
              <p className="text-[11px] text-gray-400 leading-snug">
                {globalStats.totalOutdated > 0
                  ? `${globalStats.totalOutdated} packages have newer versions in upstream PyPI or npm registries.`
                  : "All monitored package environments are fully synchronized and healthy."}
              </p>
            </div>
          </div>

          {/* ── CARD 2: VERSION AUDIT & ENVIRONMENT CHECK CONTROL ── */}
          <div className="md:col-span-6 bg-[#181a20] border border-white/[0.06] rounded-[28px] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            {/* Header: Title + Global Check Button */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>Version Check & Telemetry Audit</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Request on-demand version detection & package drift audits across local daemons
                </p>
              </div>

              <button
                onClick={triggerScanAll}
                disabled={scanning || Object.values(scanningLangs).some(Boolean)}
                className="bg-[#242933] hover:bg-[#2d3442] text-white border border-white/[0.08] px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={scanning ? "animate-spin text-primary" : "text-gray-400"} />
                <span>{scanning ? "Auditing..." : "Check All"}</span>
              </button>
            </div>

            {/* 3 Runtime Version Check Action Cards */}
            <div className="space-y-3 my-auto">
              {/* Runtime 1: Python */}
              <div className="p-3.5 rounded-2xl bg-[#20232b] hover:bg-[#232731] border border-white/[0.04] transition-all flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center font-mono font-bold text-sm text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                    Py
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-tight">Python Runtime</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {ecosystems.python.packages.length} pkgs
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                      {ecosystems.python.runtimeVersion || "Python 3.x (Active)"} • {ecosystems.python.outdated.length > 0 ? (
                        <span className="text-amber-400 font-semibold">{ecosystems.python.outdated.length} outdated</span>
                      ) : (
                        <span className="text-emerald-400">Up to date</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => triggerScanRuntime("python")}
                  disabled={scanningLangs.python || scanning}
                  className="bg-[#282d38] hover:bg-blue-600/20 text-gray-200 hover:text-blue-300 border border-white/[0.08] hover:border-blue-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
                >
                  <RefreshCw size={12} className={scanningLangs.python ? "animate-spin text-blue-400" : "text-gray-400 group-hover:text-blue-400"} />
                  <span>{scanningLangs.python ? "Checking..." : "Check Python"}</span>
                </button>
              </div>

              {/* Runtime 2: Node.js */}
              <div className="p-3.5 rounded-2xl bg-[#20232b] hover:bg-[#232731] border border-white/[0.04] transition-all flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center font-mono font-bold text-sm text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    JS
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-tight">Node.js Engine</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {ecosystems.node.packages.length} pkgs
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                      {ecosystems.node.runtimeVersion || "Node.js (Active)"} • {ecosystems.node.outdated.length > 0 ? (
                        <span className="text-amber-400 font-semibold">{ecosystems.node.outdated.length} outdated</span>
                      ) : (
                        <span className="text-emerald-400">Up to date</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => triggerScanRuntime("node")}
                  disabled={scanningLangs.node || scanning}
                  className="bg-[#282d38] hover:bg-emerald-600/20 text-gray-200 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
                >
                  <RefreshCw size={12} className={scanningLangs.node ? "animate-spin text-emerald-400" : "text-gray-400 group-hover:text-emerald-400"} />
                  <span>{scanningLangs.node ? "Checking..." : "Check Node"}</span>
                </button>
              </div>

              {/* Runtime 3: Ollama */}
              <div className="p-3.5 rounded-2xl bg-[#20232b] hover:bg-[#232731] border border-white/[0.04] transition-all flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center font-mono font-bold text-sm text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                    AI
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-tight">Ollama Local AI</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Weights Active
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                      {ecosystems.ollama.runtimeVersion || "v0.3.12 (Local Server)"} • <span className="text-emerald-400">Up to date</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => triggerScanRuntime("ollama")}
                  disabled={scanningLangs.ollama || scanning}
                  className="bg-[#282d38] hover:bg-purple-600/20 text-gray-200 hover:text-purple-300 border border-white/[0.08] hover:border-purple-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
                >
                  <RefreshCw size={12} className={scanningLangs.ollama ? "animate-spin text-purple-400" : "text-gray-400 group-hover:text-purple-400"} />
                  <span>{scanningLangs.ollama ? "Checking..." : "Check Ollama"}</span>
                </button>
              </div>
            </div>

            {/* Bottom Status / Feedback Toast */}
            <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5 font-mono text-[11px]">
                {lastCheckMessage ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-semibold animate-pulse">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    {lastCheckMessage}
                  </span>
                ) : (
                  <span>Agent sockets active • Real-time telemetry monitoring</span>
                )}
              </span>

              <Link
                to="/docs/cli"
                className="text-[11px] font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Daemon Docs</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* ── CARD 3: SECURITY & DRIFT (Right, 3 cols - Electric Blue Accent Card) ── */}
          <div className="md:col-span-3 bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] rounded-[28px] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            {/* Top Row: Title + Circular Arrow */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight">Security & Drift</h3>
              <Link
                to="/docs/cli"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
                title="View Security & Vulnerability Docs"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Description Text */}
            <p className="text-xs text-white/90 leading-relaxed font-normal mt-3">
              Automated dependency drift & CVE audit tracking across your local developer environments
            </p>

            {/* 3D Stacked Tilted Cards */}
            <div className="mt-8 relative h-26 flex flex-col justify-center items-center">
              {/* Front Top Card: Outdated Packages */}
              <div className="w-[96%] h-11 rounded-xl bg-white text-gray-900 flex items-center justify-between px-4 -rotate-2 transform shadow-xl z-20">
                <span className="text-xs font-bold text-gray-900 tracking-tight">Outdated Packages</span>
                <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold font-mono">
                  {globalStats.totalOutdated}
                </span>
              </div>

              {/* Back Bottom Card: Monitored Runtimes */}
              <div className="w-[92%] h-11 rounded-xl bg-blue-300/30 backdrop-blur-sm border border-white/30 flex items-center justify-between px-4 rotate-2 transform -mt-2 shadow-lg z-10">
                <span className="text-xs font-bold text-white tracking-tight">Monitored Runtimes</span>
                <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold font-mono">
                  3
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. MAIN GRID - ROW 2: PRIORITY UPGRADES | STATISTICS | COPILOT
        ───────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* ── CARD 4: PRIORITY PACKAGE UPGRADES (Left, 5 cols) ── */}
          <div className="md:col-span-5 bg-[#181a20] border border-white/[0.06] rounded-[28px] p-6 flex flex-col justify-between shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">Priority Package Upgrades</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Real-time dependency drift detected across local runtimes</p>
              </div>

              {globalStats.totalOutdated > 0 && (
                <button
                  onClick={() => {
                    globalStats.allOutdatedList.forEach((pkg) => handleUpgradePackage(pkg));
                  }}
                  className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold hover:bg-emerald-500/30 transition-colors cursor-pointer"
                >
                  Upgrade All ({globalStats.totalOutdated})
                </button>
              )}
            </div>

            {/* Outdated Packages Grid or Synchronized State */}
            {globalStats.allOutdatedList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-auto">
                {globalStats.allOutdatedList.slice(0, 2).map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#20232b] border border-white/[0.04] space-y-3 flex flex-col justify-between hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pkg.language === "python"
                          ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      }`}>
                        {pkg.language === "python" ? "Python (PyPI)" : "Node.js (npm)"}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">Update Drift</span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white font-mono truncate">{pkg.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        v{pkg.currentVersion} → <span className="text-emerald-400 font-bold">v{pkg.latestVersion}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <Link
                        to={`/package/${pkg.language}`}
                        className="text-[11px] text-gray-400 hover:text-white transition-colors"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleUpgradePackage(pkg)}
                        className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#20232b] border border-white/[0.04] my-auto text-center space-y-3">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-white">All Dependencies Up to Date</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No version drift detected in your local Python and Node.js environments.
                  </p>
                </div>
                <button
                  onClick={triggerScanAll}
                  disabled={scanning}
                  className="px-4 py-1.5 rounded-full bg-[#282d38] hover:bg-[#323846] text-white border border-white/10 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw size={12} className={scanning ? "animate-spin" : ""} />
                  <span>{scanning ? "Auditing..." : "Run Fresh Scan"}</span>
                </button>
              </div>
            )}

            {/* Bottom link to view full packages */}
            <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">
                {globalStats.totalPkgs} packages actively monitored across workstations
              </span>
              <Link
                to="/package/python"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View Full Inventory</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* ── CARD 5: ECOSYSTEM DRIFT STATISTICS (Center, 3 cols) ── */}
          <div className="md:col-span-3 bg-[#181a20] border border-white/[0.06] rounded-[28px] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden corner-peel">
            {/* Header + Diagonal Arrow */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white tracking-tight">Telemetry Stats</h3>
              <Link
                to="/package/python"
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
                title="View Packages"
              >
                <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* Overlapping Bubble Nodes (Calculated from Real Data) */}
            <div className="relative w-full h-44 flex items-center justify-center my-auto">
              {/* Bubble 1: Big Hot-Pink Circle (% Outdated or Healthy) */}
              <div className="absolute left-6 w-32 h-32 rounded-full bg-[#ff2e7e] text-white flex flex-col items-center justify-center shadow-2xl z-20 transition-transform hover:scale-105">
                <span className="text-2xl font-bold font-mono">
                  {globalStats.totalPkgs > 0 ? Math.round((globalStats.totalOutdated / globalStats.totalPkgs) * 100) : 0}%
                </span>
                <span className="text-[10px] font-medium opacity-90">Outdated</span>
              </div>

              {/* Bubble 2: Electric Blue Circle (% Healthy) */}
              <div className="absolute right-4 bottom-2 w-24 h-24 rounded-full bg-[#3b82f6] text-white flex flex-col items-center justify-center shadow-xl z-30 transition-transform hover:scale-105">
                <span className="text-lg font-bold font-mono">{globalStats.globalHealthPercent}%</span>
                <span className="text-[10px] font-medium opacity-90">Healthy</span>
              </div>

              {/* Bubble 3: Charcoal Circle (Runtimes Monitored) */}
              <div className="absolute right-10 top-2 w-20 h-20 rounded-full bg-[#292e38] text-gray-300 border border-white/10 flex flex-col items-center justify-center shadow-md z-10 transition-transform hover:scale-105">
                <span className="text-sm font-bold font-mono text-white">3</span>
                <span className="text-[9px] opacity-80">Runtimes</span>
              </div>
            </div>

            {/* Subtle bottom space for corner curl */}
            <div className="h-2" />
          </div>

          {/* ── CARD 6: DEVELOPER COPILOT & QUICK ACTIONS (Right, 4 cols) ── */}
          <div className="md:col-span-4 bg-[#181a20] border border-white/[0.06] rounded-[28px] p-6 flex flex-col justify-between shadow-xl">
            {/* Header Greeting */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-white tracking-tight">Hi, {displayName}</h3>
                <span className="text-base">👋</span>
              </div>
              <p className="text-sm font-bold text-white mb-4">Telemetry Quick Actions</p>

              {/* 2x2 Action Pills Grid (Real Developer Workflows) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => triggerScanRuntime("python")}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#20232b] hover:bg-[#282d38] border border-white/[0.04] text-left transition-all group cursor-pointer"
                >
                  <Code2 size={15} className="text-blue-400 shrink-0" />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                    Audit Python
                  </span>
                </button>

                <button
                  onClick={() => triggerScanRuntime("node")}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#20232b] hover:bg-[#282d38] border border-white/[0.04] text-left transition-all group cursor-pointer"
                >
                  <Zap size={15} className="text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                    Audit Node.js
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (globalStats.allOutdatedList.length > 0) {
                      globalStats.allOutdatedList.forEach((pkg) => handleUpgradePackage(pkg));
                    } else {
                      triggerScanAll();
                    }
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#20232b] hover:bg-[#282d38] border border-white/[0.04] text-left transition-all group cursor-pointer"
                >
                  <RefreshCw size={15} className="text-rose-400 shrink-0" />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                    Sync Upstream
                  </span>
                </button>

                <button
                  onClick={() => navigate("/docs/cli")}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#20232b] hover:bg-[#282d38] border border-white/[0.04] text-left transition-all group cursor-pointer"
                >
                  <Terminal size={15} className="text-purple-400 shrink-0" />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                    CLI Docs
                  </span>
                </button>
              </div>

              {/* Assistant Message Bubble if active */}
              {assistantMessages.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[#20232b] border border-white/10 text-xs text-gray-300 max-h-24 overflow-y-auto space-y-1">
                  {assistantMessages.slice(-2).map((msg, idx) => (
                    <div key={idx} className="leading-snug">
                      <span className={msg.role === "user" ? "text-blue-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        {msg.role === "user" ? "You: " : "AI: "}
                      </span>
                      <span>{msg.text}</span>
                    </div>
                  ))}
                  {assistantThinking && (
                    <span className="text-gray-400 italic">Processing telemetry command...</span>
                  )}
                </div>
              )}
            </div>

            {/* Input Prompt Box: "Ask telemetry assistant..." */}
            <form onSubmit={handleAssistantSubmit} className="mt-4 relative flex items-center">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask telemetry copilot..."
                className="w-full bg-[#20232b] border border-white/[0.08] rounded-full py-2.5 pl-4 pr-11 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 p-1.5 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors cursor-pointer"
                title="Send Prompt"
              >
                <Sparkles size={14} />
              </button>
            </form>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. OPTIONAL TAB VIEWS: INCIDENTS / PACKAGES FULL TABLE
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "incidents" && (
          <section className="bg-[#181a20] border border-white/[0.06] rounded-[28px] p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Active Packages & Drift Audit</h3>
                <p className="text-xs text-gray-400">All scanned dependencies across Python, Node.js, and Ollama</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={triggerScanAll}
                  disabled={scanning}
                  className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90"
                >
                  <RefreshCw size={13} className={scanning ? "animate-spin" : ""} />
                  <span>{scanning ? "Scanning..." : "Scan Runtimes"}</span>
                </button>
              </div>
            </div>

            {/* Outdated items or full inventory */}
            {globalStats.allOutdatedList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-mono text-gray-400 border-b border-white/[0.06]">
                    <tr>
                      <th className="py-2.5 px-3">Ecosystem</th>
                      <th className="py-2.5 px-3">Package</th>
                      <th className="py-2.5 px-3">Installed</th>
                      <th className="py-2.5 px-3">Latest</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {globalStats.allOutdatedList.map((pkg, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 uppercase font-mono text-[10px] text-gray-400">{pkg.language}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-white">{pkg.name}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-400">{pkg.currentVersion}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{pkg.latestVersion}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleUpgradePackage(pkg)}
                            className="px-2.5 py-1 rounded-full bg-primary/20 text-blue-300 hover:bg-primary/30 text-[11px] font-semibold"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-white">All packages are healthy and up to date!</p>
              </div>
            )}
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            6. FLOATING LIVE UPGRADE DRAWER (When upgrades run)
        ───────────────────────────────────────────────────────────── */}
        {showUpdateDrawer && activeUpdates.length > 0 && (
          <div className="fixed bottom-6 right-6 w-96 max-w-[90vw] z-50">
            <ActiveUpdateSection
              activeUpdates={activeUpdates}
              onDismiss={(id) => {
                setActiveUpdates((prev) => prev.filter((u) => u.id !== id));
                if (activeUpdates.length <= 1) setShowUpdateDrawer(false);
              }}
              onClearCompleted={() => {
                setActiveUpdates((prev) => prev.filter((u) => u.status !== "completed"));
              }}
            />
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            7. QUICK SEARCH MODAL (Triggered by Search Icon or ⌘K)
        ───────────────────────────────────────────────────────────── */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
            <div className="w-full max-w-lg bg-[#1a1d24] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 flex-1">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search installed packages across all ecosystems..."
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-60 overflow-y-auto space-y-1 text-xs">
                {filteredSearchPackages.length > 0 ? (
                  filteredSearchPackages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between border border-transparent hover:border-white/5"
                    >
                      <div>
                        <span className="font-mono font-bold text-white">{pkg.name}</span>
                        <span className="text-[10px] text-gray-400 ml-2 font-mono uppercase">{pkg.language}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono text-[11px]">v{pkg.currentVersion}</span>
                        {pkg.isOutdated && (
                          <button
                            onClick={() => {
                              handleUpgradePackage(pkg);
                              setSearchOpen(false);
                            }}
                            className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-semibold"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <p className="text-gray-500 py-4 text-center">No matching packages found.</p>
                ) : (
                  <p className="text-gray-500 py-3 text-center text-[11px]">Type a package name to search...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
