import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PackPortLogo from "../components/PackPortLogo";
import Navbar from "../components/Navbar";
import {
  Terminal,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  Check,
  Copy,
} from "lucide-react";
import { getAuthHeaders, clearAuthSession, setAuthSession } from "../lib/auth";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const installCmd = "npx packport-agent sync";
  const [Authenticated, setAuthenticated] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function checkAuth() {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
      const response = await fetch(`${backendUrl}/auth/check`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await response.json();

      if (data.status) {
        setAuthenticated(true);
        if (data.user) setAuthSession(undefined, data.user);
      } else {
        clearAuthSession();
        setAuthenticated(false);
      }
    } catch {
      clearAuthSession();
      setAuthenticated(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return Authenticated ? (
    <>
      <div className="min-h-screen bg-background text-[#c9d1d9] flex flex-col justify-between selection:bg-secondary-container/30 selection:text-on-surface antialiased">
        {/* Navigation */}
        <Navbar authenticated={Authenticated} setAuthenticated={setAuthenticated} />

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-16 sm:py-20 flex-1 flex flex-col items-center text-center justify-center">
          {/* Project Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-outline bg-surface text-white text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Unified Developer Package & Port Telemetry</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-on-surface leading-[1.15] mb-6 max-w-3xl">
            Complete visibility over your runtime packages and ports.
          </h1>

          {/* Project Description */}
          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-10 font-normal">
            PackPort connects directly to your local development environment via a
            lightweight background agent—monitoring active Node.js runtimes,
            tracking global package versions, catching outdated dependencies, and
            managing active developer ports.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-12">
            <Link
              to="/auth/signup"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>


            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-[#c9d1d9] hover:text-on-surface bg-surface hover:bg-surface-variant border border-outline transition-colors flex items-center justify-center"
            >
              Open Dashboard
            </Link>

          </div>

          {/* Terminal Command Box */}
          <div className="w-full max-w-md bg-surface border border-outline rounded-xl p-3 flex items-center justify-between text-left mb-16 shadow-lg">
            <div className="flex items-center gap-3 font-mono text-xs text-[#c9d1d9] overflow-hidden text-ellipsis whitespace-nowrap pl-1">
              <Terminal className="w-4 h-4 text-secondary shrink-0" />
              <span className="text-on-surface-variant select-none">$</span>
              <span className="text-on-surface">{installCmd}</span>
            </div>
            <button
              onClick={handleCopy}
              type="button"
              className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors shrink-0 ml-2 cursor-pointer"
              title="Copy command"
              aria-label="Copy command"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-tertiary" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Key Features Grid (Clean & Structured) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full max-w-3xl pt-4 border-t border-outline">
            <div className="p-5 rounded-xl bg-surface border border-outline flex flex-col justify-between shadow-md">
              <div>
                <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center mb-3.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-on-surface mb-1.5">
                  Runtime Detection
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Automatically inspect active Node.js versions, V8 engine builds,
                  and runtime execution paths in real-time.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-outline flex flex-col justify-between shadow-md">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#a371f7] flex items-center justify-center mb-3.5">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-on-surface mb-1.5">
                  Dependency Audits
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Continuously inventory installed global packages, diagnose
                  drift, and flag outdated dependencies immediately.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Clean Minimal Footer */}
        <footer className="border-t border-outline bg-background py-6">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span>All systems operational</span>
            </div>

            <div className="flex items-center gap-6">
              <span>&copy; {new Date().getFullYear()} PackPort. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  ) : (
    <div className="min-h-screen bg-background text-[#c9d1d9] flex flex-col justify-between selection:bg-secondary-container/30 selection:text-on-surface antialiased">
        {/* Navigation */}
        <Navbar authenticated={Authenticated} setAuthenticated={setAuthenticated} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-20 flex-1 flex flex-col items-center text-center justify-center">
        {/* Project Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-outline bg-surface text-secondary text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>Unified Developer Package & Port Telemetry</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-on-surface leading-[1.15] mb-6 max-w-3xl">
          Complete visibility over your runtime packages and ports.
        </h1>

        {/* Project Description */}
        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-10 font-normal">
          PackPort connects directly to your local development environment via a
          lightweight background agent—monitoring active Node.js runtimes,
          tracking global package versions, catching outdated dependencies, and
          managing active developer ports.
        </p>

        {/* CTA Buttons */}

        {Authenticated ? <>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-12">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-[#c9d1d9] hover:text-on-surface bg-surface hover:bg-surface-variant border border-outline transition-colors flex items-center justify-center"
            >
              Open Dashboard
            </Link>
            <Link
              to="/download"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Download
              <ArrowRight className="w-4 h-4" />
            </Link>
            
          </div>
        </> : <>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-12">
            <Link
              to="/auth/signup"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-[#c9d1d9] hover:text-on-surface bg-surface hover:bg-surface-variant border border-outline transition-colors flex items-center justify-center"
            >
              Log In
            </Link>
          </div>
        </>}


        {/* Terminal Command Box */}
        <div className="w-full max-w-md bg-surface border border-outline rounded-xl p-3 flex items-center justify-between text-left mb-16 shadow-lg">
          <div className="flex items-center gap-3 font-mono text-xs text-[#c9d1d9] overflow-hidden text-ellipsis whitespace-nowrap pl-1">
            <Terminal className="w-4 h-4 text-secondary shrink-0" />
            <span className="text-on-surface-variant select-none">$</span>
            <span className="text-on-surface">{installCmd}</span>
          </div>
          <button
            onClick={handleCopy}
            type="button"
            className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors shrink-0 ml-2 cursor-pointer"
            title="Copy command"
            aria-label="Copy command"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-tertiary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Key Features Grid (Clean & Structured) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full max-w-3xl pt-4 border-t border-outline">
          <div className="p-5 rounded-xl bg-surface border border-outline flex flex-col justify-between shadow-md">
            <div>
              <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center mb-3.5">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-on-surface mb-1.5">
                Runtime Detection
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Automatically inspect active Node.js versions, V8 engine builds,
                and runtime execution paths in real-time.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-outline flex flex-col justify-between shadow-md">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#a371f7] flex items-center justify-center mb-3.5">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-on-surface mb-1.5">
                Dependency Audits
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Continuously inventory installed global packages, diagnose
                drift, and flag outdated dependencies immediately.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-outline bg-background py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span>All systems operational</span>
          </div>

          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} PackPort. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
