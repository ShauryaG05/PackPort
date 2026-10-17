import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PackPortLogo, { PackPortIcon } from "../components/PackPortLogo";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  ArrowRight,
  ArrowDown,
  Shield,
  CheckCircle2,
  ExternalLink,
  Clock,
  FileText,
} from "lucide-react";

// ── OS Detection ──
function detectOS() {
  const ua = navigator.userAgent || navigator.platform || "";
  if (/Win/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "macos";
  if (/Linux/i.test(ua)) return "linux";
  return "unknown";
}

// ── Platform Data ──
const PLATFORMS = {
  windows: {
    name: "Windows",
    os: "Windows 10 / 11 (64-bit)",
    filename: "PackPort-Windows.zip",
    size: "15 MB",
    arch: "x64 / ARM64",
    format: ".zip",
    available: true,
    href: "/downloads/PackPort-Windows.zip",
    subtext: "Portable ZIP Archive",
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
      </svg>
    ),
  },
  macos: {
    name: "macOS",
    os: "macOS 12+ (Monterey or newer)",
    filename: "PackPort-MacOs.command",
    size: "52 MB",
    arch: "Universal",
    archDetail: "Apple Silicon & Intel x64",
    format: ".command",
    available: true,
    href: "/downloads/PackPort-MacOs.command",
    subtext: "Apple Silicon & Intel",
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.14c.64-.78 1.08-1.86.96-2.94-1 .04-2.13.66-2.79 1.44-.57.65-1.08 1.74-.94 2.8 1.11.08 2.19-.57 2.77-1.3" />
      </svg>
    ),
  },
  linux: {
    name: "Linux",
    os: "Ubuntu, Debian, Fedora, Arch",
    filename: "PackPort-Linux.tar.gz",
    size: "Coming Soon",
    arch: "x86_64 / ARM64",
    format: "",
    available: false,
    href: "#",
    subtext: "CLI install in docs",
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM7.5 15l-1.41-1.41L8.67 11 6.09 8.41 7.5 7l4 4-4 4zm4 0h6v-2h-6v2z" />
      </svg>
    ),
  },
};

// ── Platform Download Card ──
function PlatformCard({ platformKey, isDetected = false }) {
  const p = PLATFORMS[platformKey];

  return (
    <Card
      className={`relative flex flex-col justify-between h-full overflow-visible transition-all duration-200 hover:-translate-y-1 ${
        isDetected
          ? "border-[#238636]/60 shadow-lg shadow-[#238636]/10 ring-1 ring-[#238636]/30 bg-linear-to-b from-[#238636]/4 to-card"
          : "border-border hover:border-muted-foreground/40 bg-card"
      } ${!p.available ? "opacity-75 hover:opacity-100" : ""}`}
    >
      {/* Detected OS tag */}
      {isDetected && (
        <div className="absolute -top-3 left-6 z-10">
          <Badge className="bg-[#238636] hover:bg-[#238636] text-white border-0 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 shadow-sm">
            Current System
          </Badge>
        </div>
      )}

      <CardContent className="p-6 flex flex-col justify-between h-full flex-1">
        <div>
          {/* Header row: icon + arch badge */}
          <div className={`flex items-start justify-between mb-5 ${isDetected ? "pt-1" : ""}`}>
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                p.available
                  ? isDetected
                    ? "bg-[#238636]/10 border-[#238636]/30 text-foreground"
                    : "bg-muted/80 border-border text-foreground"
                  : "bg-muted/40 border-border/50 text-muted-foreground"
              }`}
            >
              {p.icon}
            </div>
            {p.available ? (
              <Badge variant="secondary" className="text-[10px] font-mono tracking-wide px-2 py-0.5">
                {p.arch}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] font-mono text-amber-400 border-amber-400/30 tracking-wide px-2 py-0.5"
              >
                Coming Soon
              </Badge>
            )}
          </div>

          {/* Platform name + OS description */}
          <h3 className="text-xl font-bold text-foreground tracking-tight">{p.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{p.os}</p>

          {/* File details container */}
          <div className="mt-5 p-3 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-foreground/90 font-medium truncate">{p.filename}</span>
            </div>
            <span className={`shrink-0 font-medium ml-2 ${isDetected ? "text-[#7bdb80]" : "text-muted-foreground"}`}>
              {p.size}
            </span>
          </div>
        </div>

        {/* Download action section (anchored to bottom) */}
        <div className="mt-6 pt-2 flex flex-col gap-3">
          {p.available ? (
            <Button
              asChild
              className={`w-full h-11 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer ${
                isDetected
                  ? "bg-[#238636] hover:bg-[#2ea043] text-white shadow-[#238636]/20 hover:shadow-md hover:-translate-y-0.5"
                  : "bg-[#238636]/90 hover:bg-[#238636] text-white hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <a
                href={p.href}
                download
                className="inline-flex items-center justify-center gap-2.5 w-full h-full text-center select-none"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download for {p.name}</span>
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full h-11 text-sm font-medium cursor-not-allowed opacity-60 rounded-lg inline-flex items-center justify-center gap-2"
              disabled
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Coming Soon</span>
            </Button>
          )}

          {/* Sub-info row (exactly 1 row across all cards) */}
          {p.available ? (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7bdb80] shrink-0" />
                SHA-256 verified
              </span>
              {p.secondaryHref ? (
                <span className="font-mono text-muted-foreground/80">
                  or{" "}
                  <a
                    href={p.secondaryHref}
                    download
                    className="text-primary-fixed hover:underline font-medium"
                  >
                    .exe (40 MB)
                  </a>
                </span>
              ) : (
                <span className="font-mono text-muted-foreground/80">
                  {p.subtext}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center text-[11px] text-muted-foreground px-0.5">
              <span className="font-mono text-muted-foreground/80">
                curl -sSL install preview in docs
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Download Page ──
export default function DownloadPage() {
  const [detectedOS, setDetectedOS] = useState("unknown");

  useEffect(() => {
    setDetectedOS(detectOS());
  }, []);

  const heroData = PLATFORMS[detectedOS] || PLATFORMS.macos;
  const heroAvailable = heroData.available;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* ── Navigation ── */}
      <Navbar />

      <main className="flex-1 flex flex-col items-center">
        {/* ═══════════════════════════════════════════
            HERO — Big Auto-Detected Download CTA
        ═══════════════════════════════════════════ */}
        <section className="w-full max-w-6xl px-6 pt-14 md:pt-24 pb-16 text-center flex flex-col items-center">
          {/* Logo glow badge */}
          <div className="relative mb-7">
            <div className="absolute -inset-2 rounded-2xl bg-[#238636]/15 blur-lg" />
            <div className="relative w-20 h-20 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg">
              <PackPortIcon size={56} />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-foreground tracking-tight leading-tight mb-3">
            Download PackPort
          </h1>

          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10">
            Get the PackPort agent for your operating system.
          </p>

          {/* ── Big hero download button ── */}
          {heroAvailable && (
            <div className="flex flex-col items-center w-full max-w-md">
              <Button
                asChild
                className="w-full h-14 px-8 text-base md:text-lg font-semibold rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white shadow-lg shadow-[#238636]/20 hover:shadow-[#238636]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <a
                  href={heroData.href}
                  download
                  className="inline-flex items-center justify-center gap-3 w-full h-full select-none"
                >
                  <Download className="w-5 h-5 shrink-0" />
                  <span>Download for {heroData.name}</span>
                </a>
              </Button>

              {/* Payload specs */}
              <p className="mt-3 text-xs text-muted-foreground font-mono">
                {heroData.filename} · {heroData.size} · {heroData.arch}
                {heroData.archDetail ? ` (${heroData.archDetail})` : ""}
              </p>

              {/* Trust badges + other platforms link */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7bdb80]" />
                  SHA-256 verified
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  {detectedOS === "macos" ? "Notarized by Apple" : "Digitally signed"}
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <a
                  href="#all-platforms"
                  className="inline-flex items-center gap-1 text-primary-fixed hover:underline font-medium"
                >
                  Other platforms
                  <ArrowDown className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="w-full max-w-6xl px-6">
          <Separator className="bg-border" />
        </div>

        {/* ═══════════════════════════════════════════
            ALL PLATFORMS — 3-Column Grid
        ═══════════════════════════════════════════ */}
        <section className="w-full max-w-6xl px-6 py-16 md:py-24" id="all-platforms">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight">
                All Platforms
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select your operating system and architecture for standalone binary downloads.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-muted-foreground self-start md:self-auto">
              Build 1.0.0-prod
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlatformCard platformKey="windows" isDetected={detectedOS === "windows"} />
            <PlatformCard platformKey="macos" isDetected={detectedOS === "macos"} />
            <PlatformCard platformKey="linux" isDetected={false} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            RELEASE INFO — Verification Banner
        ═══════════════════════════════════════════ */}
        <section className="w-full max-w-6xl px-6 pb-20">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-[#7bdb80] shrink-0 mt-0.5">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-foreground">
                      v1.0 (Latest Release)
                    </h4>
                    <Badge className="bg-[#238636]/20 text-[#7bdb80] border-[#238636]/30 text-[10px]">
                      Current Stable
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Released September 2026 · All official binaries are cryptographically signed.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0 text-xs">
                <Link
                  to="/docs/cli"
                  className="inline-flex items-center gap-1.5 text-primary-fixed hover:underline font-medium"
                >
                  View Changelog & Release Notes
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Separator orientation="vertical" className="h-4 hidden md:block" />
                <Link
                  to="/docs/cli"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  CLI Documentation
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">PackPort</span>
            <span>© {new Date().getFullYear()} PackPort. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/docs/cli" className="hover:text-foreground transition-colors underline">
              Docs
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors underline">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
