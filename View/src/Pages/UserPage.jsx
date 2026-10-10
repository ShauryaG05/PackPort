import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Layers,
  AlertTriangle,
  Cpu,
  Box,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Activity,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function UserPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [telemetry, setTelemetry] = useState({
    totalInstalled: 0,
    totalOutdated: 0,
    pythonVersion: null,
    nodeVersion: null,
    npmVersion: null,
    pythonInstalled: 0,
    pythonOutdated: 0,
    nodeInstalled: 0,
    nodeOutdated: 0,
    lastScanned: null,
    hasData: false,
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5600";

  // Fetch user auth & live telemetry without hardcoded values
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch User Profile
      const authRes = await fetch(`${backendUrl}/auth/check`, {
        method: "GET",
        credentials: "include",
      });

      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) {
          setUser(authData.user);
        }
      }

      // 2. Fetch Packages & Runtime Telemetry
      const pkgRes = await fetch(`${backendUrl}/agent/packages`, {
        method: "GET",
        credentials: "include",
      });

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        const pythonGroup = pkgData.python_Packages || {};
        const nodeGroup = pkgData.node_Packages || {};

        // Parse Python packages
        const pyOutdated = Array.isArray(pythonGroup.outdated_packages)
          ? pythonGroup.outdated_packages.length
          : Object.keys(pythonGroup.outdated_packages || {}).length;

        const pyAll = Array.isArray(pythonGroup.all_packages)
          ? pythonGroup.all_packages.length
          : Object.keys(pythonGroup.all_packages || {}).length;

        // Parse Node.js packages
        const nodeOutdated = Array.isArray(nodeGroup.outdated_packages)
          ? nodeGroup.outdated_packages.length
          : Object.keys(nodeGroup.outdated_packages || {}).length;

        const nodeAll = Array.isArray(nodeGroup.all_packages)
          ? nodeGroup.all_packages.length
          : Object.keys(nodeGroup.all_packages || {}).length;

        // Dynamic computed counts
        const totalInstalled = pyAll + nodeAll;
        const totalOutdated = pyOutdated + nodeOutdated;

        // Live Runtime Versions
        const pythonVersion = pythonGroup.version || null;
        const nodeVersion = nodeGroup.node_version || nodeGroup.version || null;
        const npmVersion = nodeGroup.npm_version || null;

        const lastScannedDate = pythonGroup.lastScanned || nodeGroup.lastScanned || null;

        setTelemetry({
          totalInstalled,
          totalOutdated,
          pythonVersion,
          nodeVersion,
          npmVersion,
          pythonInstalled: pyAll,
          pythonOutdated: pyOutdated,
          nodeInstalled: nodeAll,
          nodeOutdated: nodeOutdated,
          lastScanned: lastScannedDate ? new Date(lastScannedDate) : null,
          hasData: Boolean(pythonVersion || nodeVersion || totalInstalled > 0),
        });
      }
    } catch (err) {
      console.error("Failed to load user telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCopyAgentCode = () => {
    if (user?.agentCode) {
      navigator.clipboard.writeText(user.agentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans">
      {/* ── Header: User Profile & Agent Identity ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-outline">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-xl text-primary shrink-0 shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : <User className="w-7 h-7" />}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {user?.name || "Developer Profile"}
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                Live Agent
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-mono truncate">
              {user?.email || "Authenticated Local Instance"}
            </p>
          </div>
        </div>

        {/* Action: Copy Agent Code & Refresh Telemetry */}
        <div className="flex items-center gap-3">
          {user?.agentCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAgentCode}
              className="border-outline hover:bg-[#21262d] text-xs font-mono text-gray-300 gap-1.5 h-9"
              title="Copy Agent Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>Agent: {user.agentCode}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="border-outline hover:bg-[#21262d] text-xs text-gray-300 hover:text-white gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* ── The 4 Essential Telemetry Metrics ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Core Runtime Telemetry
          </span>
          {telemetry.lastScanned && (
            <span className="text-[11px] text-gray-500 font-mono">
              Last synced: {telemetry.lastScanned.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Total Installed Packages */}
          <Card className="bg-[#161b22] border-outline hover:border-primary/40 transition-colors shadow-xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Installed Packages
              </CardDescription>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers className="w-4.5 h-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-white">
                  {loading ? "..." : telemetry.totalInstalled}
                </span>
                <span className="text-xs text-gray-400">packages indexed</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2 font-mono">
                Python: {telemetry.pythonInstalled} • Node.js: {telemetry.nodeInstalled}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Outdated Packages */}
          <Card className="bg-[#161b22] border-outline hover:border-amber-500/40 transition-colors shadow-xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Outdated Packages
              </CardDescription>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                telemetry.totalOutdated > 0
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              }`}>
                {telemetry.totalOutdated > 0 ? (
                  <AlertTriangle className="w-4.5 h-4.5" />
                ) : (
                  <CheckCircle2 className="w-4.5 h-4.5" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold font-mono ${
                  telemetry.totalOutdated > 0 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {loading ? "..." : telemetry.totalOutdated}
                </span>
                <span className="text-xs text-gray-400">requiring upgrade</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2 font-mono">
                Python: {telemetry.pythonOutdated} • Node.js: {telemetry.nodeOutdated}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Python Version */}
          <Card className="bg-[#161b22] border-outline hover:border-blue-500/40 transition-colors shadow-xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Python Version
              </CardDescription>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                Py
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white truncate">
                  {loading ? "..." : telemetry.pythonVersion || "Not Detected"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline/40">
                <span className="text-[11px] text-gray-500">Active Interpreter</span>
                <Link
                  to="/package/python"
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <span>View Packages</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Node Version */}
          <Card className="bg-[#161b22] border-outline hover:border-emerald-500/40 transition-colors shadow-xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Node Version
              </CardDescription>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                JS
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white truncate">
                  {loading ? "..." : telemetry.nodeVersion || "Not Detected"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline/40">
                <span className="text-[11px] text-gray-500 font-mono">
                  {telemetry.npmVersion ? `npm v${telemetry.npmVersion}` : "npm Global"}
                </span>
                <Link
                  to="/package/node"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <span>View Packages</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
