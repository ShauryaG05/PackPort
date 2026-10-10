import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Terminal, ShieldAlert, Cpu, Layers, RefreshCw, Compass } from "lucide-react";
import PackPortLogo from "../components/PackPortLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Background cyber grid & ambient glows */}
      <div className="absolute inset-0 bg-grid-animated opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex justify-center mb-2">
          <Link to="/dashboard" className="hover:opacity-90 transition-opacity">
            <PackPortLogo size={36} showBadge={true} />
          </Link>
        </div>

        {/* 404 Main Card */}
        <Card className="bg-[#161b22]/90 border-outline backdrop-blur-md shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <CardContent className="p-0 space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-xs font-mono font-semibold text-red-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>404: PORT_NOT_BOUND</span>
            </div>

            {/* Giant 404 Visual */}
            <div className="relative py-2">
              <span className="text-7xl sm:text-9xl font-black font-mono tracking-tighter bg-linear-to-b from-white via-gray-300 to-gray-600 bg-clip-text text-transparent drop-shadow-sm">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-mono uppercase tracking-widest text-primary/80 bg-background/80 px-3 py-1 rounded border border-primary/30">
                  Route Not Found
                </span>
              </div>
            </div>

            {/* Explanatory Message */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Teleport Failed & Port Disconnected
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                The endpoint or page you requested does not exist on this agent instance. It may have drifted, been deprecated, or unmapped.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full sm:w-auto gap-2 border-outline hover:bg-[#21262d] text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>

              <Button
                asChild
                className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                <Link to="/dashboard">
                  <Home className="w-4 h-4" />
                  Telemetry Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Route Links */}
        <div className="p-4 rounded-xl bg-[#161b22]/50 border border-outline/60 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-400">
          <span className="text-gray-500 font-mono text-[11px] uppercase tracking-wider">Available Telemetry Hubs:</span>
          <Link to="/package/python" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Python
          </Link>
          <Link to="/package/node" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Node.js
          </Link>
          <Link to="/package/ollama" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Ollama
          </Link>
          <Link to="/docs/cli" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-gray-400" />
            CLI Docs
          </Link>
        </div>
      </div>
    </div>
  );
}
