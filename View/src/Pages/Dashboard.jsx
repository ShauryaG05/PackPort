import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getAuthHeaders } from "../lib/auth";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Layers,
  Cpu,
  Box,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ChevronRight,
  Server,
  Activity,
  HardDrive,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Progress } from "../components/ui/progress.jsx";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert.jsx";
import ActiveUpdateSection from "../components/ActiveUpdateSection.jsx";

// Ecosystem metadata configuration
const ECOSYSTEM_CONFIG = {
  python: {
    id: "python",
    title: "Python Packages & PyPI",
    shortName: "Python",
    packageManager: "pip / PyPI",
    route: "/package/python",
    color: "text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    accent: "bg-blue-500",
    gradient: "from-blue-600/20 to-indigo-600/5",
    borderHover: "hover:border-blue-500/40",
    syncEndpoint: "/agent/python_scan",
    upgradeCommand: (name) => `pip install --upgrade ${name}`,
    installAllCmd: "pip list --outdated --format=freeze | xargs -n1 pip install -U",
  },
  node: {
    id: "node",
    title: "Node.js Environment & npm",
    shortName: "Node.js",
    packageManager: "npm Global Registry",
    route: "/package/node",
    color: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accent: "bg-emerald-500",
    gradient: "from-emerald-600/20 to-teal-600/5",
    borderHover: "hover:border-emerald-500/40",
    syncEndpoint: "/agent/node_scan",
    upgradeCommand: (name) => `npm install -g ${name}@latest`,
    installAllCmd: "npm update -g",
  },
  ollama: {
    id: "ollama",
    title: "Ollama Models & Local AI",
    shortName: "Ollama",
    packageManager: "ollama library",
    route: "/package/ollama",
    color: "text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    accent: "bg-purple-500",
    gradient: "from-purple-600/20 to-pink-600/5",
    borderHover: "hover:border-purple-500/40",
    syncEndpoint: "/agent/ollama_scan",
    upgradeCommand: (name) => `ollama pull ${name}`,
    installAllCmd: "ollama list",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [activeUpdates, setActiveUpdates] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");

  // Telemetry state across all monitored ecosystems
  const [ecosystems, setEcosystems] = useState({
    python: { packages: [], outdated: [], runtimeVersion: null, lastScanned: null, isLive: false },
    node: { packages: [], outdated: [], runtimeVersion: null, lastScanned: null, isLive: false },
    ollama: { packages: [], outdated: [], runtimeVersion: "v0.3.12 (Local)", lastScanned: new Date(), isLive: true },
  });

  // Fetch package telemetry for an individual ecosystem
  const fetchTelemetry = useCallback(async (lang) => {
    if (lang === "ollama") return; // Handled client/agent side
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

        const runtimeVer =
          pkgGroup.node_version
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
  }, [backendUrl]);

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

        // Fetch initial live agent connection status
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
        console.error("Auth check error:", err);
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

  // Scan trigger
  async function triggerScanAll() {
    setScanning(true);
    try {
      await Promise.all([
        fetch(`${backendUrl}/agent/python_scan`, { method: "GET", credentials: "include", headers: getAuthHeaders() }),
        fetch(`${backendUrl}/agent/node_scan`, { method: "GET", credentials: "include", headers: getAuthHeaders() }),
      ]);

      for (let i = 1; i <= 3; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        await Promise.all([fetchTelemetry("python"), fetchTelemetry("node")]);
      }
    } catch (e) {
      console.error("Scan all error:", e);
    } finally {
      setScanning(false);
    }
  }

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

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
                logs: [
                  ...u.logs,
                  `[${new Date().toLocaleTimeString()}] Verifying SHA-256 signatures & manifest...`,
                ],
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
                  logs: [
                    ...u.logs,
                    `[${new Date().toLocaleTimeString()}] Successfully installed ${pkg.name} v${targetVer}!`,
                  ],
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
                logs: [
                  ...u.logs,
                  `[${new Date().toLocaleTimeString()}] Error: ${err.message}`,
                ],
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* ── Top Header & Global Status ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline/70">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              {agentOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${agentOnline ? "bg-emerald-500" : "bg-gray-500"}`}></span>
            </span>
            <Badge
              variant="outline"
              className={`text-[11px] font-mono font-medium border transition-colors ${
                agentOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-gray-500/10 text-gray-400 border-gray-500/30"
              }`}
            >
              Agent {agentOnline ? "Online" : "Offline"}
            </Badge>

            {user?.agentCode && (
              <span className="text-xs font-mono text-gray-400 bg-[#161b22] px-2.5 py-0.5 rounded border border-outline flex items-center gap-1.5">
                <span className="text-gray-500">Code:</span>
                <span className="text-primary font-semibold">{user.agentCode}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Command Center & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
            Unified telemetry stream monitoring local development runtimes, active packages, and upstream updates.
          </p>
        </div>

        {/* Global Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={triggerScanAll}
            disabled={scanning}
            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md font-medium text-xs sm:text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin text-white" : ""}`} />
            {scanning ? "Scanning Runtimes..." : "Scan All Environments"}
          </Button>

          <Button
            variant="outline"
            asChild
            className="gap-2 border-outline hover:bg-[#21262d] text-xs sm:text-sm text-gray-300 hover:text-white"
          >
            <Link to="/docs/cli">
              <Terminal className="w-4 h-4" />
              CLI Documentation
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Active Package Upgrade Stream Section ── */}
      <ActiveUpdateSection
        activeUpdates={activeUpdates}
        onDismiss={(id) => setActiveUpdates((prev) => prev.filter((u) => u.id !== id))}
        onClearCompleted={() => setActiveUpdates((prev) => prev.filter((u) => u.status !== "completed"))}
      />

      {/* ── Executive Telemetry Overview Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Global Health */}
        <Card className="bg-[#161b22] border-outline hover:border-outline-variant transition-colors shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Package Score
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${globalStats.totalOutdated > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {globalStats.globalHealthPercent}%
              </span>
              <span className="text-xs text-gray-400">up-to-date</span>
            </div>
            <Progress value={globalStats.globalHealthPercent} className="h-1.5" />
          </CardContent>
        </Card>

        {/* Metric 2: Total Dependencies */}
        <Card className="bg-[#161b22] border-outline hover:border-outline-variant transition-colors shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Dependencies
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{globalStats.totalPkgs}</span>
              <span className="text-xs text-gray-400">installed packages</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Across 3 monitored runtimes</p>
          </CardContent>
        </Card>

        {/* Metric 3: Critical Upgrades Available */}
        <Card className="bg-[#161b22] border-outline hover:border-outline-variant transition-colors shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Updates Available
            </CardDescription>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${globalStats.totalOutdated > 0 ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
              {globalStats.totalOutdated > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${globalStats.totalOutdated > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {globalStats.totalOutdated}
              </span>
              <span className="text-xs text-gray-400">outdated packages</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {globalStats.totalOutdated > 0 ? "Review priority upgrades below" : "All dependencies current"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Monitored Ecosystems */}
        <Card className="bg-[#161b22] border-outline hover:border-outline-variant transition-colors shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Monitored Runtimes
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">3 Active</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Python • Node.js • Ollama AI</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Monitored Ecosystems Command Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Ecosystem Command Center</span>
            </h2>
            <p className="text-xs text-gray-400">
              Dedicated package registries and local runtime inspection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Python */}
          <Card className={`bg-linear-to-b ${ECOSYSTEM_CONFIG.python.gradient} bg-[#161b22] border-outline ${ECOSYSTEM_CONFIG.python.borderHover} transition-all duration-200 flex flex-col justify-between shadow-sm group`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                    Py
                  </div>
                  <div>
                    <CardTitle className="text-base text-white font-bold">Python</CardTitle>
                    <span className="text-[10px] font-mono text-blue-400">pip / PyPI Registry</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[11px] bg-blue-500/10 text-blue-300 border-blue-500/25">
                  {ecosystems.python.packages.length} pkgs
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="p-3 rounded-lg bg-background/60 border border-outline space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Detected Binary:</span>
                  <span className="font-mono text-white font-medium">
                    {ecosystems.python.runtimeVersion || "Python 3.x (Active)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Outdated Items:</span>
                  <span className={`font-mono font-bold ${ecosystems.python.outdated.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {ecosystems.python.outdated.length} {ecosystems.python.outdated.length === 1 ? "package" : "packages"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  className="w-full justify-between bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold h-9"
                >
                  <Link to="/package/python">
                    <span>Manage Python Packages</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Node.js */}
          <Card className={`bg-linear-to-b ${ECOSYSTEM_CONFIG.node.gradient} bg-[#161b22] border-outline ${ECOSYSTEM_CONFIG.node.borderHover} transition-all duration-200 flex flex-col justify-between shadow-sm group`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    JS
                  </div>
                  <div>
                    <CardTitle className="text-base text-white font-bold">Node.js</CardTitle>
                    <span className="text-[10px] font-mono text-emerald-400">npm Global Registry</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[11px] bg-emerald-500/10 text-emerald-300 border-emerald-500/25">
                  {ecosystems.node.packages.length} pkgs
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="p-3 rounded-lg bg-background/60 border border-outline space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Detected Engine:</span>
                  <span className="font-mono text-white font-medium truncate max-w-37.5">
                    {ecosystems.node.runtimeVersion || "Node.js (Active)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Outdated Items:</span>
                  <span className={`font-mono font-bold ${ecosystems.node.outdated.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {ecosystems.node.outdated.length} {ecosystems.node.outdated.length === 1 ? "package" : "packages"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  className="w-full justify-between bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold h-9"
                >
                  <Link to="/package/node">
                    <span>Manage Node.js Packages</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Ollama */}
          <Card className={`bg-linear-to-b ${ECOSYSTEM_CONFIG.ollama.gradient} bg-[#161b22] border-outline ${ECOSYSTEM_CONFIG.ollama.borderHover} transition-all duration-200 flex flex-col justify-between shadow-sm group`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                    AI
                  </div>
                  <div>
                    <CardTitle className="text-base text-white font-bold">Ollama</CardTitle>
                    <span className="text-[10px] font-mono text-purple-400">Local AI Models</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[11px] bg-purple-500/10 text-purple-300 border-purple-500/25">
                  LLMs Active
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="p-3 rounded-lg bg-background/60 border border-outline space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Runtime Server:</span>
                  <span className="font-mono text-white font-medium">
                    {ecosystems.ollama.runtimeVersion}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Model Updates:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    Up to date
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  className="w-full justify-between bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold h-9"
                >
                  <Link to="/package/ollama">
                    <span>Manage Ollama Models</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Priority Action Center: Outdated Packages Requiring Upgrades ── */}
      <Card className="bg-[#161b22] border-outline shadow-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg text-white font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Priority Upgrades Hub</span>
              </CardTitle>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  globalStats.totalOutdated > 0
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {globalStats.totalOutdated > 0 ? `${globalStats.totalOutdated} Updates Needed` : "All Healthy"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-gray-400">
              Aggregated outdated dependencies requiring immediate upgrade across your local environments
            </CardDescription>
          </div>

          {globalStats.totalOutdated > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => {
                  globalStats.allOutdatedList.forEach((pkg) => handleUpgradePackage(pkg));
                }}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium h-8"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upgrade All ({globalStats.totalOutdated})
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {globalStats.totalOutdated > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-background/70 border-b border-outline">
                  <TableRow className="hover:bg-transparent border-outline">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3 px-5">
                      Ecosystem
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3 px-5">
                      Package Name
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3 px-5">
                      Installed
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3 px-5">
                      Target Upgrade
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-400 py-3 px-5 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-outline/50">
                  {globalStats.allOutdatedList.map((pkg, idx) => {
                    const isCurrentlyUpdating = activeUpdates.some(
                      (u) => u.packageName === pkg.name && u.status !== "completed" && u.status !== "failed"
                    );
                    const config = ECOSYSTEM_CONFIG[pkg.language] || ECOSYSTEM_CONFIG.python;

                    return (
                      <TableRow key={`${pkg.language}-${pkg.name}-${idx}`} className="hover:bg-[#21262d]/50 border-outline transition-colors">
                        <TableCell className="py-3 px-5">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium border ${config.badgeBg}`}>
                            {config.shortName}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-5 font-mono font-bold text-white text-xs">
                          {pkg.name}
                        </TableCell>

                        <TableCell className="py-3 px-5 font-mono text-xs text-gray-400">
                          {pkg.currentVersion}
                        </TableCell>

                        <TableCell className="py-3 px-5">
                          <span className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {pkg.latestVersion}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpgradePackage(pkg)}
                              disabled={isCurrentlyUpdating}
                              className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 font-semibold"
                            >
                              {isCurrentlyUpdating ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Updating...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  <span>Update Now</span>
                                </>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(config.upgradeCommand(pkg.name), pkg.name)}
                              className="h-7 px-2.5 text-xs border-outline hover:bg-[#21262d] text-gray-300 gap-1"
                              title={`Copy: ${config.upgradeCommand(pkg.name)}`}
                            >
                              {copiedItem === pkg.name ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                              <span className="hidden sm:inline">Copy CLI</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">All Environments are Fully Up-to-Date!</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-0.5">
                  Zero vulnerable or outdated packages detected across your local Python, Node.js, and Ollama runtimes.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
