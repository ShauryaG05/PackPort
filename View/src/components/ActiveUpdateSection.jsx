import React, { useState } from "react";
import {
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * ActiveUpdateSection
 * Displays active package upgrade tasks with live progress, step indicators, and terminal log stream.
 *
 * @param {Array} activeUpdates - Array of update objects:
 *  {
 *    id: string,
 *    packageName: string,
 *    language: string,
 *    currentVersion: string,
 *    targetVersion: string,
 *    progress: number, // 0 - 100
 *    status: "queued" | "downloading" | "installing" | "verifying" | "completed" | "failed",
 *    logs: string[],
 *    startedAt: Date,
 *  }
 * @param {Function} onDismiss - Callback to remove/dismiss an update task
 * @param {Function} onClearCompleted - Callback to clear all finished tasks
 */
export default function ActiveUpdateSection({
  activeUpdates = [],
  onDismiss,
  onClearCompleted,
  className = "",
}) {
  const [expandedLogs, setExpandedLogs] = useState({});

  if (!activeUpdates || activeUpdates.length === 0) {
    return null;
  }

  const toggleLog = (id) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const inProgressCount = activeUpdates.filter((u) => u.status !== "completed" && u.status !== "failed").length;
  const completedCount = activeUpdates.filter((u) => u.status === "completed").length;

  return (
    <Card className={`bg-[#161b22]/95 border-primary/40 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300 ${className}`}>
      {/* Header Bar */}
      <div className="bg-linear-to-r from-blue-950/50 via-[#161b22] to-indigo-950/40 px-4 py-3 border-b border-outline flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {inProgressCount > 0 ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Active Package Updates
            </span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-2 py-0 h-4.5 font-mono ${
                inProgressCount > 0
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {inProgressCount > 0 ? `${inProgressCount} Upgrading` : "All Complete"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {completedCount > 0 && onClearCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              className="text-[11px] h-7 px-2 text-gray-400 hover:text-white"
            >
              Clear Finished ({completedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Update Items Stream */}
      <CardContent className="p-3 sm:p-4 space-y-3 divide-y divide-outline/40">
        {activeUpdates.map((item) => {
          const isComplete = item.status === "completed";
          const isFailed = item.status === "failed";
          const isExpanded = expandedLogs[item.id];

          const statusBadge = {
            queued: { label: "Queued", color: "bg-gray-500/10 text-gray-300 border-gray-500/20" },
            downloading: { label: "Downloading Wheels...", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
            installing: { label: "Compiling & Installing...", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
            verifying: { label: "Verifying Binary...", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
            completed: { label: "Successfully Upgraded", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
            failed: { label: "Update Failed", color: "bg-red-500/15 text-red-300 border-red-500/30" },
          }[item.status] || { label: "Processing...", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" };

          return (
            <div key={item.id} className="pt-3 first:pt-0 space-y-2.5">
              {/* Top row: Package info + Version Diff + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isComplete
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : isFailed
                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isFailed ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white font-mono">{item.packageName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-background border border-outline text-gray-400 uppercase font-mono">
                        {item.language || "package"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-0.5">
                      <span className="text-gray-400 line-through opacity-75">{item.currentVersion || "current"}</span>
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      <span className="text-emerald-400 font-bold">{item.targetVersion || "latest"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="secondary" className={`text-xs px-2 py-0.5 font-medium border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </Badge>

                  {/* Toggle Log View */}
                  {item.logs && item.logs.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLog(item.id)}
                      className="h-7 px-2 text-xs text-gray-400 hover:text-white gap-1"
                      title="Toggle Terminal Logs"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Log</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                  )}

                  {/* Dismiss */}
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDismiss(item.id)}
                      className="h-7 w-7 text-gray-500 hover:text-gray-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span className="truncate">{item.currentStep || "Processing package binaries..."}</span>
                  <span className="font-bold text-gray-300">{item.progress || 0}%</span>
                </div>
                <Progress
                  value={item.progress || 10}
                  className={`h-1.5 ${
                    isComplete
                      ? "[&>div]:bg-emerald-500"
                      : isFailed
                      ? "[&>div]:bg-red-500"
                      : "[&>div]:bg-blue-500 [&>div]:transition-all [&>div]:duration-500"
                  }`}
                />
              </div>

              {/* Terminal Logs Drawer */}
              {isExpanded && item.logs && item.logs.length > 0 && (
                <div className="p-3 rounded-lg bg-black/70 border border-outline font-mono text-[11px] space-y-1 text-gray-300 max-h-36 overflow-y-auto animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pb-1 border-b border-outline/50 mb-1">
                    <span>TERMINAL OUTPUT STREAM</span>
                    <span>AGENT PID: ACTIVE</span>
                  </div>
                  {item.logs.map((log, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-gray-600 select-none">&gt;</span>
                      <span className={log.includes("Successfully") ? "text-emerald-400 font-semibold" : log.includes("Error") ? "text-red-400" : "text-gray-300"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
