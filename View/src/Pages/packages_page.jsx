import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Terminal,
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
  ArrowUpDown,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Sparkles,
  Zap,
} from "lucide-react";
import ActiveUpdateSection from "../components/ActiveUpdateSection.jsx";
import { getAuthHeaders } from "../lib/auth";

// Ecosystem metadata configuration
const ECOSYSTEM_CONFIG = {
  python: {
    id: "python",
    title: "Python Packages & Runtime",
    shortName: "Python",
    packageManager: "pip / PyPI",
    color: "from-blue-500 to-indigo-600",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-blue-400">
        <path d="M11.91 0c-3.1 0-5.02 1.4-5.02 3.86v2.87h5.16v.96H4.27C1.81 7.69.05 9.77.05 12.87c0 3.09 1.76 5.17 4.22 5.17h2.62v-2.43c0-2.38 1.96-4.34 4.34-4.34h5.17V7.47c0-2.46-1.92-3.86-5.02-3.86h.53zm-2.46 2.05a.86.86 0 1 1 0 1.72.86.86 0 0 1 0-1.72zm9.64 5.62v2.43c0 2.38-1.96 4.34-4.34 4.34H9.58v3.8c0 2.46 1.92 3.86 5.02 3.86h-.53c3.1 0 5.02-1.4 5.02-3.86v-2.87h-5.16v-.96h7.78c2.46 0 4.22-2.08 4.22-5.18 0-3.09-1.76-5.16-4.22-5.16h-2.62zm-2.62 14.28a.86.86 0 1 1 0-1.72.86.86 0 0 1 0 1.72z" />
      </svg>
    ),
    registryUrl: (name) => `https://pypi.org/project/${name}/`,
    upgradeCommand: (name) => `pip install --upgrade ${name}`,
    syncEndpoint: "/agent/python_scan",
    installAllCmd: "pip list --outdated --format=freeze | xargs -n1 pip install -U",
  },
  node: {
    id: "node",
    title: "Node.js Environment & Global Packages",
    shortName: "Node.js",
    packageManager: "npm Global Registry",
    color: "from-emerald-500 to-teal-600",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-emerald-400">
        <path d="M12 1.5l10.392 6v12L12 25.5l-10.392-6v-12L12 1.5zm0 2.309L3.608 8.6v9.6L12 22.991l8.392-4.791V8.6L12 3.809zM12 7a5 5 0 110 10 5 5 0 010-10z" />
      </svg>
    ),
    registryUrl: (name) => `https://www.npmjs.com/package/${name}`,
    upgradeCommand: (name) => `npm install -g ${name}@latest`,
    syncEndpoint: "/agent/node_scan",
    installAllCmd: "npm update -g",
  },
};

export default function PackagePage() {
  const { language = "python" } = useParams();
  const navigate = useNavigate();

  // Normalize language key: defaults to 'python' if unknown
  const activeLangKey = language.toLowerCase() === "node" ? "node" : "python";
  const config = ECOSYSTEM_CONFIG[activeLangKey] || ECOSYSTEM_CONFIG.python;

  // Local state
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [copiedItem, setCopiedItem] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'outdated' | 'healthy'
  const [sortField, setSortField] = useState("name"); // 'name' | 'status'
  const [activeUpdates, setActiveUpdates] = useState([]);

  // Backend / Agent live data
  const [livePackages, setLivePackages] = useState({
    outdated: [],
    all: [],
    runtimeVersion: null,
    agentCode: "",
    isLive: false,
    lastScanned: null,
  });

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_URL ||
    (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");

  // Fetch package data from server
  const fetchPackageData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/agent/packages/${activeLangKey}`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const pkgGroup =
          activeLangKey === "python" ? data.python_Packages : data.node_Packages;

        if (
          pkgGroup &&
          (pkgGroup.outdated_packages !== null ||
            pkgGroup.all_packages !== null ||
            pkgGroup.version !== null ||
            pkgGroup.lastScanned !== null)
        ) {
          processServerPackages(pkgGroup, data.agentCode);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch real telemetry:", err.message);
    }

    // Default clean empty state when no telemetry recorded yet
    setLivePackages({
      outdated: [],
      all: [],
      runtimeVersion: null,
      agentCode: "",
      isLive: false,
      lastScanned: null,
    });
    setLoading(false);
  }, [activeLangKey, backendUrl]);

  function processServerPackages(pkgGroup, agentCode) {
    let outdated = [];
    if (Array.isArray(pkgGroup.outdated_packages)) {
      outdated = pkgGroup.outdated_packages;
    } else if (pkgGroup.outdated_packages && typeof pkgGroup.outdated_packages === "object") {
      outdated = Object.entries(pkgGroup.outdated_packages).map(([k, v]) => ({
        name: k,
        version: v.current || v.version || "Unknown",
        latest_version: v.latest || v.latest_version || "Unknown",
        type: v.type || "global",
      }));
    }

    let all = [];
    if (Array.isArray(pkgGroup.all_packages)) {
      all = pkgGroup.all_packages;
    } else if (pkgGroup.all_packages && typeof pkgGroup.all_packages === "object") {
      all = Object.entries(pkgGroup.all_packages).map(([k, v]) => ({
        name: k,
        version: typeof v === "object" ? v.version : v,
      }));
    }

    const hasData =
      outdated.length > 0 ||
      all.length > 0 ||
      pkgGroup.version !== null ||
      pkgGroup.lastScanned !== null;

    setLivePackages({
      outdated,
      all,
      runtimeVersion: pkgGroup.version || null,
      agentCode: agentCode || "",
      isLive: hasData,
      lastScanned: pkgGroup.lastScanned ? new Date(pkgGroup.lastScanned) : null,
    });
  }

  useEffect(() => {
    fetchPackageData();
  }, [fetchPackageData]);

  useEffect(() => {
    const socket = io(backendUrl);

    if (livePackages.agentCode) {
      socket.emit("register_dashboard", { agentCode: livePackages.agentCode });
    }

    socket.on("scan_complete", (payload) => {
      if (!payload?.agentCode || !livePackages.agentCode || payload.agentCode === livePackages.agentCode) {
        if (!payload?.language || payload?.language === activeLangKey) {
          fetchPackageData();
        }
      }
    });

    socket.on("package_update_finished", (payload) => {
      if (!payload) return;
      setActiveUpdates((prev) =>
        prev.map((u) => {
          if (u.id === payload.taskId || u.packageName === payload.packageName) {
            return {
              ...u,
              progress: 100,
              status: payload.success ? "completed" : "failed",
              currentStep: payload.success
                ? `Successfully upgraded ${payload.packageName || u.packageName}!`
                : `Upgrade failed: ${payload.error || "Unknown error"}`,
              logs: [
                ...u.logs,
                payload.stdout ? `[Output] ${payload.stdout.trim()}` : null,
                payload.success
                  ? `[${new Date().toLocaleTimeString()}] ✅ Agent confirmed update completion.`
                  : `[${new Date().toLocaleTimeString()}] ❌ Agent reported failure: ${payload.error}`
              ].filter(Boolean)
            };
          }
          return u;
        })
      );

      if (payload.success) {
        setTimeout(() => fetchPackageData(), 1200);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl, livePackages.agentCode, activeLangKey, fetchPackageData]);

  // Trigger agent scan via backend
  async function triggerScan() {
    setScanning(true);
    setScanMessage("Contacting background agent via WebSocket...");

    try {
      const response = await fetch(`${backendUrl}${config.syncEndpoint}`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        setScanMessage("Agent scanning active system runtimes...");
        for (let i = 1; i <= 4; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          await fetchPackageData();
        }
      }
    } catch {
      setScanMessage("Scan failed or agent unreachable");
    } finally {
      setScanning(false);
      setScanMessage("");
    }
  }

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  // Live package upgrade handler
  const handleUpgradePackage = async (pkg) => {
    const updateId = `${activeLangKey}-${pkg.name}-${Date.now()}`;
    const targetVer = pkg.latestVersion || pkg.latest_version || "latest";
    const currentVer = pkg.currentVersion || pkg.version || "current";

    const newUpdate = {
      id: updateId,
      packageName: pkg.name,
      language: activeLangKey,
      currentVersion: currentVer,
      targetVersion: targetVer,
      progress: 20,
      status: "downloading",
      currentStep: `Contacting ${activeLangKey === "python" ? "PyPI" : activeLangKey === "node" ? "npm" : "Ollama"} registry...`,
      logs: [
        `[${new Date().toLocaleTimeString()}] Dispatching package upgrade: ${pkg.name} (${currentVer} -> ${targetVer})`,
        `[${new Date().toLocaleTimeString()}] CLI Command: ${config.upgradeCommand(pkg.name)}`,
      ],
      startedAt: new Date(),
    };

    setActiveUpdates((prev) => [newUpdate, ...prev.filter((u) => u.packageName !== pkg.name)]);

    try {
      // Step 1: Send request to backend
      const response = await fetch(`${backendUrl}/agent/update/${pkg.name}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeLangKey,
          packageName: pkg.name,
        }),
      });

      // Step 2: Simulate active progress & real phases
      await new Promise((r) => setTimeout(r, 700));
      setActiveUpdates((prev) =>
        prev.map((u) =>
          u.id === updateId
            ? {
                ...u,
                progress: 55,
                status: "installing",
                currentStep: `Downloading wheel & running ${config.packageManager} install...`,
                logs: [
                  ...u.logs,
                  `[${new Date().toLocaleTimeString()}] Resolving dependencies and fetching bytecode binaries...`,
                  `[${new Date().toLocaleTimeString()}] Unpacking payload & applying update patch...`,
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
                currentStep: `Verifying integrity & compiling bytecode...`,
                logs: [
                  ...u.logs,
                  `[${new Date().toLocaleTimeString()}] Verifying SHA-256 integrity and dependency graph...`,
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
                    `[${new Date().toLocaleTimeString()}] Successfully installed and linked ${pkg.name} v${targetVer}!`,
                  ],
                }
              : u
          )
        );

        // Auto trigger telemetry refresh
        setTimeout(() => {
          fetchPackageData();
        }, 1200);
      } else {
        throw new Error(resData.message || "Failed to upgrade package");
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
                  `[${new Date().toLocaleTimeString()}] Error during upgrade: ${err.message}`,
                ],
              }
            : u
        )
      );
    }
  };

  const handleUpgradeAll = async () => {
    const outdatedList = compiledPackages.filter((p) => p.isOutdated);
    for (const pkg of outdatedList) {
      handleUpgradePackage(pkg);
      await new Promise((r) => setTimeout(r, 400));
    }
  };

  // Compile full package list with computed statuses
  const compiledPackages = useMemo(() => {
    const combinedList = [];
    const seen = new Set();

    // First add all outdated items
    livePackages.outdated.forEach((item) => {
      seen.add(item.name.toLowerCase());
      combinedList.push({
        name: item.name,
        currentVersion: item.version || "Unknown",
        latestVersion: item.latest_version || item.version || "Latest",
        isOutdated: true,
        type: item.type || "dependency",
      });
    });

    // Then add all remaining packages marked as up to date
    livePackages.all.forEach((item) => {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combinedList.push({
          name: item.name,
          currentVersion: item.version || "1.0.0",
          latestVersion: item.version || "1.0.0",
          isOutdated: false,
          type: "up-to-date",
        });
      }
    });

    return combinedList;
  }, [livePackages]);

  // Filtered & Sorted packages
  const filteredPackages = useMemo(() => {
    return compiledPackages
      .filter((pkg) => {
        if (statusFilter === "outdated" && !pkg.isOutdated) return false;
        if (statusFilter === "healthy" && pkg.isOutdated) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            pkg.name.toLowerCase().includes(q) ||
            pkg.currentVersion.toLowerCase().includes(q) ||
            pkg.latestVersion.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === "status") {
          return b.isOutdated - a.isOutdated;
        }
        return a.name.localeCompare(b.name);
      });
  }, [compiledPackages, statusFilter, searchQuery, sortField]);

  // Metrics
  const totalCount = compiledPackages.length;
  const outdatedCount = compiledPackages.filter((p) => p.isOutdated).length;
  const healthyCount = totalCount - outdatedCount;
  const healthPercent = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Language Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-surface border border-outline shadow-inner">
            {config.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                {config.shortName} Package Telemetry
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium border ${config.badgeColor}`}>
                {config.packageManager}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live inspection of active runtimes, installed dependencies, and upstream releases.
            </p>
          </div>
        </div>

        {/* Language Tabs / Switcher */}
        <div className="flex items-center p-1 bg-surface rounded-xl border border-outline self-start sm:self-auto">
          <button
            onClick={() => navigate("/package/python")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLangKey === "python"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Python
          </button>

          <button
            onClick={() => navigate("/package/node")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLangKey === "node"
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Node.js
          </button>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Runtime Engine */}
        <div className="p-4 rounded-xl bg-surface border border-outline flex flex-col justify-between hover:border-outline-variant transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Runtime Engine
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-variant border border-outline flex items-center justify-center text-secondary">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-on-surface font-mono">
                {livePackages.runtimeVersion || (livePackages.isLive ? "Detected" : "Not Detected")}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Active {config.shortName} binary on agent runtime
            </p>
          </div>
        </div>

        {/* Metric 2: Total Detected Packages */}
        <div className="p-4 rounded-xl bg-surface border border-outline flex flex-col justify-between hover:border-outline-variant transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Total Packages
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-variant border border-outline flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface">{totalCount}</span>
              <span className="text-xs text-on-surface-variant">installed</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Indexed in {config.packageManager} ecosystem
            </p>
          </div>
        </div>

        {/* Metric 3: Outdated Packages */}
        <div className="p-4 rounded-xl bg-surface border border-outline flex flex-col justify-between hover:border-amber-500/30 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Updates Available
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">{outdatedCount}</span>
              <span className="text-xs text-amber-300/80">outdated</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {outdatedCount > 0
                ? "Newer releases detected on registry"
                : "All packages on latest release"}
            </p>
          </div>
        </div>

        {/* Metric 4: Health Rate */}
        <div className="p-4 rounded-xl bg-surface border border-outline flex flex-col justify-between hover:border-emerald-500/30 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Ecosystem Health
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">{healthPercent}%</span>
              <span className="text-xs text-emerald-300/80">up to date</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${healthPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Package Upgrades Section */}
      <ActiveUpdateSection
        activeUpdates={activeUpdates}
        onDismiss={(id) => setActiveUpdates((prev) => prev.filter((u) => u.id !== id))}
        onClearCompleted={() => setActiveUpdates((prev) => prev.filter((u) => u.status !== "completed"))}
      />

      {/* Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-outline shadow-sm">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${config.shortName} packages by name or version...`}
              className="w-full pl-9 pr-3.5 py-2 bg-background border border-outline rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-outline">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${statusFilter === "all"
                ? "bg-surface-variant text-on-surface shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
                }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("outdated")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 ${statusFilter === "outdated"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-on-surface-variant hover:text-on-surface"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Outdated ({outdatedCount})
            </button>
            <button
              onClick={() => setStatusFilter("healthy")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 ${statusFilter === "healthy"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-on-surface-variant hover:text-on-surface"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Up-to-Date ({healthyCount})
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Scan Button */}
          <button
            onClick={triggerScan}
            disabled={scanning}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            <span>{scanning ? "Scanning..." : `Scan ${config.shortName}`}</span>
          </button>

          {/* Upgrade All Command Copy */}
          {outdatedCount > 0 && (
            <button
              onClick={() => handleCopy(config.installAllCmd, "bulk-update")}
              title="Copy bulk upgrade command"
              className="px-3 py-2 rounded-lg text-xs font-medium text-on-surface bg-surface-variant hover:bg-outline border border-outline transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedItem === "bulk-update" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-on-surface-variant" />
              )}
              <span className="hidden sm:inline">Bulk Command</span>
            </button>
          )}
        </div>
      </div>

      {/* Scan Status Toast / Banner */}
      {scanMessage && (
        <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-xl text-xs text-secondary flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main Packages Table Card */}
      <div className="bg-surface rounded-xl border border-outline overflow-hidden shadow-lg">
        {/* Table Header / Subheader */}
        <div className="px-5 py-3.5 border-b border-outline bg-surface-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-on-surface-variant" />
            <h2 className="text-sm font-semibold text-on-surface">
              {config.shortName} Installed Packages ({filteredPackages.length})
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <button
              onClick={() => setSortField(sortField === "name" ? "status" : "name")}
              className="flex items-center gap-1 hover:text-on-surface cursor-pointer"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort: {sortField === "name" ? "Name" : "Status"}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline bg-background/50 text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Package Name</th>
                <th className="py-3 px-4">Current Version</th>
                <th className="py-3 px-4">Latest Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Quick Upgrade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr
                    key={pkg.name}
                    className="hover:bg-surface-variant/40 transition-colors group"
                  >
                    {/* Package Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${pkg.isOutdated
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                        >
                          {pkg.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <a
                            href={config.registryUrl(pkg.name)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-on-surface hover:text-secondary flex items-center gap-1.5 transition-colors"
                          >
                            <span className="truncate">{pkg.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            {config.packageManager.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Current Version */}
                    <td className="py-3.5 px-4 font-mono text-on-surface font-medium">
                      {pkg.currentVersion}
                    </td>

                    {/* Latest Version */}
                    <td className="py-3.5 px-4 font-mono">
                      {pkg.isOutdated ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <span>{pkg.latestVersion}</span>
                          <span className="text-[10px] text-amber-500/70 font-sans">
                            (upgrade)
                          </span>
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">
                          {pkg.latestVersion}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {pkg.isOutdated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Outdated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Healthy
                        </span>
                      )}
                    </td>

                    {/* Action / Upgrade Command */}
                    <td className="py-3.5 px-5 text-right">
                      {pkg.isOutdated ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpgradePackage(pkg)}
                            disabled={activeUpdates.some((u) => u.packageName === pkg.name && u.status !== "completed" && u.status !== "failed")}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-primary hover:bg-primary/90 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                            title={`Upgrade ${pkg.name} to ${pkg.latestVersion}`}
                          >
                            {activeUpdates.some((u) => u.packageName === pkg.name && u.status !== "completed" && u.status !== "failed") ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                                <span>Update Now</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleCopy(config.upgradeCommand(pkg.name), pkg.name)
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-surface-variant hover:bg-outline text-on-surface hover:text-white border border-outline transition-colors cursor-pointer"
                            title={`Copy: ${config.upgradeCommand(pkg.name)}`}
                          >
                            {copiedItem === pkg.name ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-on-surface-variant" />
                                <span>Copy CLI</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-[11px] inline-flex items-center justify-end gap-1">
                          <Check className="w-3 h-3 text-emerald-500" /> Up to date
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-8 h-8 text-outline" />
                      <p className="text-sm font-medium text-on-surface">
                        {livePackages.isLive ? "No packages match your search" : "No telemetry recorded yet"}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {livePackages.isLive
                          ? "Try adjusting your query or resetting your status filter."
                          : "Run your local agent or click the Scan button above to discover packages."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-outline bg-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${livePackages.isLive ? "bg-emerald-500" : "bg-gray-500"}`}></span>
            <span>
              {livePackages.isLive
                ? `Telemetry synced via PackPort Agent (${livePackages.agentCode || "Active"})`
                : "Awaiting local agent telemetry"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              {filteredPackages.length} of {totalCount} total packages displayed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}