import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PackPortLogo from "./PackPortLogo";
import {
  Terminal,
  ArrowRight,
  ChevronDown,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Zap,
  Boxes,
  FileCode,
  User,
  Download,
  BookOpen,
  Sliders,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  Cable,
  LayoutDashboard,
  ChevronRight,
  Bell,
  HardDrive,
  Database
} from "lucide-react";

// Genuine SVG Icon components for Ecosystems
export function PythonIcon({ size = 18, className = "" }) {
  return (
    <span
      role="img"
      aria-label="Python"
      style={{
        background: "#38bdf8",
        width: size,
        height: size,
        WebkitMaskImage: 'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/python.webp")',
        maskImage: 'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/python.webp")',
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
      className={`inline-block shrink-0 ${className}`}
    />
  );
}

export function NodeIcon({ size = 18, className = "" }) {
  return (
    <span
      role="img"
      aria-label="NodeJS"
      style={{
        background: "#4ade80",
        width: size,
        height: size,
        WebkitMaskImage: 'url("https://cdn.simpleicons.org/nodedotjs/5FA04E")',
        maskImage: 'url("https://cdn.simpleicons.org/nodedotjs/5FA04E")',
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
      className={`inline-block shrink-0 ${className}`}
    />
  );
}

export function OllamaIcon({ size = 18, className = "" }) {
  return (
    <span
      role="img"
      aria-label="Ollama"
      style={{
        background: "#e2e8f0",
        width: size,
        height: size,
        WebkitMaskImage: 'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/ollama.svg")',
        maskImage: 'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/ollama.svg")',
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
      className={`inline-block shrink-0 ${className}`}
    />
  );
}

export default function Navbar({
  authenticated: propAuth,
  setAuthenticated: propSetAuth,
  isDashboard = false,
  onToggleSidebar,
  user: propUser,
  onLogout: propOnLogout,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const [internalUser, setInternalUser] = useState(null);
  const [internalAuth, setInternalAuth] = useState(false);
  const navContainerRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = propAuth !== undefined ? propAuth : internalAuth;
  const currentUser = propUser || internalUser;

  // Check auth if not passed via props
  useEffect(() => {
    let isMounted = true;
    if (propUser) {
      setInternalUser(propUser);
    }
    if (propAuth === undefined) {
      async function checkAuthStatus() {
        try {
          const backendUrl =
            import.meta.env.VITE_BACKEND_URL ||
            import.meta.env.VITE_URL ||
            (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
          const response = await fetch(`${backendUrl}/auth/check`, {
            method: "GET",
            credentials: "include",
          });
          const data = await response.json();
          if (isMounted) {
            if (data.status) {
              setInternalAuth(true);
              if (propSetAuth) propSetAuth(true);
              if (data.user) setInternalUser(data.user);
            } else {
              setInternalAuth(false);
              if (propSetAuth) propSetAuth(false);
              setInternalUser(null);
            }
          }
        } catch {
          if (isMounted) {
            setInternalAuth(false);
            if (propSetAuth) propSetAuth(false);
          }
        }
      }
      checkAuthStatus();
    }
    return () => {
      isMounted = false;
    };
  }, [propAuth, propSetAuth, propUser]);

  // Handle Logout
  async function handleLogout() {
    if (propOnLogout) {
      propOnLogout();
      setActiveDropdown(null);
      return;
    }
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        import.meta.env.VITE_URL ||
        (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
      const response = await fetch(`${backendUrl}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setInternalAuth(false);
        if (propSetAuth) propSetAuth(false);
        setInternalUser(null);
        setActiveDropdown(null);
        navigate("/");
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  }

  // Hover delay handlers to prevent accidental closes
  const handleMouseEnter = (key) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleMobileSubmenu = (key) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090d]/90 backdrop-blur-xl border-b border-white/8 select-none">
      <div
        ref={navContainerRef}
        onMouseLeave={handleMouseLeave}
        className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative"
      >
        {/* 1. Left Side: Logo shifted to the left edge or Dashboard status */}
        <div className="flex items-center shrink-0">
          {isDashboard ? (
            onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/6 transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>
            )
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity focus:outline-none"
              aria-label="PackPort Home"
            >
              <PackPortLogo size={32} showBadge={false} />
            </Link>
          )}
        </div>

        {/* 2. Center Navigation: Mathematically centered in the menu bar */}
        <nav className="hidden lg:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          {/* Runtimes Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("runtimes")}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "runtimes" ? null : "runtimes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                activeDropdown === "runtimes"
                  ? "text-white bg-white/8"
                  : "text-zinc-300 hover:text-white hover:bg-white/4"
              }`}
              aria-expanded={activeDropdown === "runtimes"}
            >
              <span>Runtimes</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 ${
                  activeDropdown === "runtimes" ? "rotate-180 text-white" : ""
                }`}
              />
            </button>
          </div>

          {/* Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("resources")}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "resources" ? null : "resources")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                activeDropdown === "resources"
                  ? "text-white bg-white/8"
                  : "text-zinc-300 hover:text-white hover:bg-white/4"
              }`}
              aria-expanded={activeDropdown === "resources"}
            >
              <span>Resources</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 ${
                  activeDropdown === "resources" ? "rotate-180 text-white" : ""
                }`}
              />
            </button>
          </div>

          {/* Download Direct Link (NO SUBMENU) */}
          <Link
            to="/download"
            onMouseEnter={() => handleMouseEnter(null)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/4 transition-all duration-150"
          >
            Download
          </Link>

          {/* Account Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("account")}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "account" ? null : "account")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                activeDropdown === "account"
                  ? "text-white bg-white/8"
                  : "text-zinc-300 hover:text-white hover:bg-white/4"
              }`}
              aria-expanded={activeDropdown === "account"}
            >
              <span>{isAuth ? "Account" : "Account"}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 ${
                  activeDropdown === "account" ? "rotate-180 text-white" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        {/* 3. Right Action Items */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* Docs Link */}
          <Link
            to="/docs/cli"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/4"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>Docs</span>
          </Link>

          {/* Sign In Button with styled Background (when unauthenticated) */}
          {!isAuth ? (
            <Link
              to="/auth/login"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#6366f1] hover:bg-[#5457e5] px-4 py-2 rounded-xl transition-all shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:shadow-[0_0_25px_rgba(99,102,241,0.55)] active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          ) : (
            /* Authenticated view */
            <div className="flex items-center gap-2.5">
              {isDashboard && (
                <button
                  type="button"
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/6 transition-colors relative"
                  title="Notifications"
                >
                  <Bell size={17} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </button>
              )}

              <Link
                to="/user"
                className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-200 hover:text-white transition-colors px-2.5 py-1.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/8"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-bold text-indigo-400 flex items-center justify-center">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <span className="max-w-27.5 truncate">{currentUser?.name || "Profile"}</span>
              </Link>

              {!isDashboard && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#6366f1] hover:bg-[#5457e5] transition-all shadow-sm"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          {!isAuth ? (
            <Link
              to="/auth/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6366f1]"
            >
              Sign In
            </Link>
          ) : !isDashboard ? (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6366f1]"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/user"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-zinc-200 bg-white/6 border border-white/8"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
              </div>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/6 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── MEGA MENU DROPDOWN PANEL (Desktop) ── */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              key="mega-menu"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onMouseEnter={() => handleMouseEnter(activeDropdown)}
              onMouseLeave={handleMouseLeave}
              className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[94vw] ${
                isDashboard ? "max-w-4xl" : "max-w-5xl"
              } bg-[#0c0d12]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-6 z-50 overflow-hidden text-left`}
            >
              {/* Invisible top hover bridge */}
              <div className="absolute -top-3 left-0 right-0 h-3" />

              {/* Subtle top reflection line */}
              <div className="absolute top-0 inset-x-8 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

              {/* 1. RUNTIMES DROPDOWN */}
              {activeDropdown === "runtimes" && (
                <div className="grid grid-cols-12 gap-6 items-stretch">
                  <div className="col-span-8 grid grid-cols-3 gap-5">
                    {/* Column 1: RUNTIMES */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                        Runtimes
                      </p>
                      <div className="space-y-1">
                        <DropdownItem
                          to="/package/python"
                          icon={<PythonIcon size={16} />}
                          iconBg="bg-sky-500/10 border-sky-500/20 text-sky-400"
                          title="Python"
                          desc="Pip packages & venvs"
                        />
                        <DropdownItem
                          to="/package/node"
                          icon={<NodeIcon size={16} />}
                          iconBg="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          title="Node.js"
                          desc="npm, yarn, pnpm packages"
                        />
                        <DropdownItem
                          to="/package/ollama"
                          icon={<OllamaIcon size={16} />}
                          iconBg="bg-slate-400/10 border-slate-400/20 text-slate-300"
                          title="Ollama AI"
                          desc="Local model weights & RAM"
                        />
                        <DropdownItem
                          to="/docs/cli#rust-cargo"
                          icon={<Boxes className="w-4 h-4 text-orange-400" />}
                          iconBg="bg-orange-500/10 border-orange-500/20"
                          title="Rust Cargo"
                          desc="Crates & compilation drift"
                        />
                        <DropdownItem
                          to="/docs/cli#go-modules"
                          icon={<FileCode className="w-4 h-4 text-cyan-400" />}
                          iconBg="bg-cyan-500/10 border-cyan-500/20"
                          title="Go Modules"
                          desc="Binary caches & packages"
                        />
                      </div>

                      <div className="pt-3 px-2">
                        <Link
                          to="/package/python"
                          className="text-[11px] font-bold tracking-wider text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                        >
                          <span>VIEW ALL RUNTIMES</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Column 2: PACKAGE OBSERVABILITY */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                        Auditing
                      </p>
                      <div className="space-y-1">
                        <DropdownItem
                          to="/package/python"
                          icon={<Layers className="w-4 h-4 text-amber-400" />}
                          iconBg="bg-amber-500/10 border-amber-500/20"
                          title="Dependency Drift"
                          desc="Outdated module alerts"
                        />
                        <DropdownItem
                          to="/dashboard"
                          icon={<Cpu className="w-4 h-4 text-purple-400" />}
                          iconBg="bg-purple-500/10 border-purple-500/20"
                          title="V8 & Runtime Engine"
                          desc="Node.js and Python builds"
                        />
                        <DropdownItem
                          to="/package/node"
                          icon={<Database className="w-4 h-4 text-blue-400" />}
                          iconBg="bg-blue-500/10 border-blue-500/20"
                          title="Global Packages"
                          desc="CLI binaries & caches"
                        />
                        <DropdownItem
                          to="/dashboard"
                          icon={<Activity className="w-4 h-4 text-emerald-400" />}
                          iconBg="bg-emerald-500/10 border-emerald-500/20"
                          title="Telemetry Status"
                          desc="Continuous monitoring"
                        />
                      </div>
                    </div>

                    {/* Column 3: DEVELOPER TOOLS */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                        Developer Tools
                      </p>
                      <div className="space-y-1">
                        <DropdownItem
                          to="/docs/cli"
                          icon={<Terminal className="w-4 h-4 text-fuchsia-400" />}
                          iconBg="bg-fuchsia-500/10 border-fuchsia-500/20"
                          title="Terminal Daemon"
                          desc="Single-command sync"
                        />
                        <DropdownItem
                          to="/docs/cli#quickstart"
                          icon={<Zap className="w-4 h-4 text-yellow-400" />}
                          iconBg="bg-yellow-500/10 border-yellow-500/20"
                          title="Agent Sync API"
                          desc="Telemetry packet protocol"
                        />
                        <DropdownItem
                          to="/download"
                          icon={<Download className="w-4 h-4 text-indigo-400" />}
                          iconBg="bg-indigo-500/10 border-indigo-500/20"
                          title="Desktop Binaries"
                          desc="macOS, Win & Linux"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Featured Card */}
                  <div className="col-span-4">
                    <FeaturedPreviewCard
                      tag1="Primary / 6"
                      tag2="16px"
                      title="Advance UI Customization"
                      subtitle="Personalize your collaboration and telemetry experience."
                      primaryBtnText="View Docs"
                      primaryBtnLink="/docs/cli"
                      secondaryBtnText="Downloads"
                      secondaryBtnLink="/download"
                    />
                  </div>
                </div>
              )}

              {/* 2. RESOURCES & DOCS DROPDOWN */}
              {activeDropdown === "resources" && (
                <div className="grid grid-cols-12 gap-6 items-stretch">
                  <div className="col-span-8 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                        Documentation
                      </p>
                      <div className="space-y-1">
                        <DropdownItem
                          to="/docs/cli"
                          icon={<Terminal className="w-4 h-4 text-sky-400" />}
                          iconBg="bg-sky-500/10 border-sky-500/20"
                          title="CLI Documentation"
                          desc="Complete command line tool reference"
                        />
                        <DropdownItem
                          to="/docs/cli#quickstart"
                          icon={<Zap className="w-4 h-4 text-yellow-400" />}
                          iconBg="bg-yellow-500/10 border-yellow-500/20"
                          title="Quickstart Guide"
                          desc="Set up telemetry in under 60 seconds"
                        />
                        <DropdownItem
                          to="/docs/cli#python-pip"
                          icon={<PythonIcon size={16} />}
                          iconBg="bg-blue-500/10 border-blue-500/20"
                          title="Python Pip Auditing"
                          desc="Pip, poetry, and virtualenv telemetry"
                        />
                        <DropdownItem
                          to="/docs/cli#nodejs-npm"
                          icon={<NodeIcon size={16} />}
                          iconBg="bg-emerald-500/10 border-emerald-500/20"
                          title="Node.js npm Auditing"
                          desc="npm, yarn, pnpm, and Bun support"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                        System & Releases
                      </p>
                      <div className="space-y-1">
                        <DropdownItem
                          to="/download"
                          icon={<Download className="w-4 h-4 text-purple-400" />}
                          iconBg="bg-purple-500/10 border-purple-500/20"
                          title="Agent Download"
                          desc="macOS Universal, Windows, and Linux"
                        />
                        <DropdownItem
                          to="/docs/cli#troubleshooting"
                          icon={<Sliders className="w-4 h-4 text-amber-400" />}
                          iconBg="bg-amber-500/10 border-amber-500/20"
                          title="Troubleshooting Guide"
                          desc="Fix daemon permissions & socket locks"
                        />
                        <DropdownItem
                          to="/dashboard"
                          icon={<Activity className="w-4 h-4 text-emerald-400" />}
                          iconBg="bg-emerald-500/10 border-emerald-500/20"
                          title="System Status"
                          desc="Local daemon and WebSocket health"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4">
                    <FeaturedPreviewCard
                      tag1="CLI v1.0"
                      tag2="Stable"
                      title="Autonomous Agent Sync"
                      subtitle="Audit and manage all local package registries from one unified CLI."
                      primaryBtnText="Read Docs"
                      primaryBtnLink="/docs/cli"
                      secondaryBtnText="Downloads"
                      secondaryBtnLink="/download"
                    />
                  </div>
                </div>
              )}

              {/* 3. ACCOUNT & PROFILE DROPDOWN */}
              {activeDropdown === "account" && (
                <div className="grid grid-cols-12 gap-6 items-stretch">
                  <div className="col-span-8 grid grid-cols-2 gap-6">
                    {isAuth ? (
                      <>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                            User Profile
                          </p>
                          <div className="space-y-1">
                            <DropdownItem
                              to="/user"
                              icon={<User className="w-4 h-4 text-indigo-400" />}
                              iconBg="bg-indigo-500/10 border-indigo-500/20"
                              title="Telemetry Profile"
                              desc="Account settings and agent code"
                            />
                            <DropdownItem
                              to="/dashboard"
                              icon={<LayoutDashboard className="w-4 h-4 text-blue-400" />}
                              iconBg="bg-blue-500/10 border-blue-500/20"
                              title="Main Dashboard"
                              desc="Full telemetry control center"
                            />
                            <DropdownItem
                              to="/package/python"
                              icon={<Layers className="w-4 h-4 text-emerald-400" />}
                              iconBg="bg-emerald-500/10 border-emerald-500/20"
                              title="Package Inventory"
                              desc="View all synced runtime packages"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                            Session Actions
                          </p>
                          <div className="space-y-1">
                            <button
                              onClick={handleLogout}
                              type="button"
                              className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left group cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                <LogOut className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-zinc-200 group-hover:text-red-400 transition-colors">
                                  Sign Out
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  End active telemetry session
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                            Account Access
                          </p>
                          <div className="space-y-1">
                            <DropdownItem
                              to="/auth/login"
                              icon={<LogIn className="w-4 h-4 text-blue-400" />}
                              iconBg="bg-blue-500/10 border-blue-500/20"
                              title="Sign In"
                              desc="Access your cloud telemetry metrics"
                            />
                            <DropdownItem
                              to="/auth/signup"
                              icon={<User className="w-4 h-4 text-emerald-400" />}
                              iconBg="bg-emerald-500/10 border-emerald-500/20"
                              title="Create Free Account"
                              desc="Sync local telemetry across workstations"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-2">
                            Standalone
                          </p>
                          <div className="space-y-1">
                            <DropdownItem
                              to="/download"
                              icon={<Download className="w-4 h-4 text-purple-400" />}
                              iconBg="bg-purple-500/10 border-purple-500/20"
                              title="Download Standalone Agent"
                              desc="Run locally without an account"
                            />
                            <DropdownItem
                              to="/docs/cli"
                              icon={<Terminal className="w-4 h-4 text-amber-400" />}
                              iconBg="bg-amber-500/10 border-amber-500/20"
                              title="Quickstart CLI"
                              desc="Test commands immediately"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="col-span-4">
                    {isAuth ? (
                      <div className="h-full bg-[#12131b] border border-white/8 rounded-xl p-4.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 font-bold text-sm flex items-center justify-center">
                              {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-white truncate">
                                {currentUser?.name || currentUser?.email || "Authenticated User"}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  Agent Online
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                            Your background daemon is syncing packages and runtime
                            inventories in real-time.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Link
                            to="/dashboard"
                            className="flex-1 text-center py-2 px-3 rounded-lg bg-[#6366f1] hover:bg-[#5457e5] text-white text-xs font-medium transition-colors shadow-sm"
                          >
                            Open Dashboard
                          </Link>
                          <Link
                            to="/user"
                            className="py-2 px-3 rounded-lg bg-white/6 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/8 text-xs font-medium transition-colors"
                          >
                            Profile
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <FeaturedPreviewCard
                        tag1="Cloud Sync"
                        tag2="Free"
                        title="Sync Telemetry Across Devices"
                        subtitle="Create a free account to track local runtime health everywhere."
                        primaryBtnText="Sign Up Free"
                        primaryBtnLink="/auth/signup"
                        secondaryBtnText="Log In"
                        secondaryBtnLink="/auth/login"
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOBILE MENU DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#0c0d12] border-b border-white/10 px-4 py-6 overflow-y-auto max-h-[85vh] space-y-4"
          >
            {/* Mobile Runtimes Section */}
            <div className="border-b border-white/6 pb-3">
              <button
                onClick={() => toggleMobileSubmenu("runtimes")}
                className="w-full flex items-center justify-between py-2 text-sm font-semibold text-zinc-200"
              >
                <span>Runtimes</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileExpanded.runtimes ? "rotate-180 text-white" : "text-zinc-500"
                  }`}
                />
              </button>
              {mobileExpanded.runtimes && (
                <div className="pl-2 pt-2 space-y-1">
                  <Link
                    to="/package/python"
                    className="block py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Python Packages & Venvs
                  </Link>
                  <Link
                    to="/package/node"
                    className="block py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Node.js & npm Modules
                  </Link>
                  <Link
                    to="/package/ollama"
                    className="block py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Ollama Local AI Models
                  </Link>
                  <Link
                    to="/docs/cli#rust-cargo"
                    className="block py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Rust Cargo & Go Modules
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Resources Section */}
            <div className="border-b border-white/6 pb-3">
              <button
                onClick={() => toggleMobileSubmenu("resources")}
                className="w-full flex items-center justify-between py-2 text-sm font-semibold text-zinc-200"
              >
                <span>Resources & Docs</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileExpanded.resources ? "rotate-180 text-white" : "text-zinc-500"
                  }`}
                />
              </button>
              {mobileExpanded.resources && (
                <div className="pl-2 pt-2 space-y-1">
                  <Link
                    to="/docs/cli"
                    className="block py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    CLI Documentation
                  </Link>
                  <Link
                    to="/docs/cli#quickstart"
                    className="block py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Quickstart Guide
                  </Link>
                  <Link
                    to="/download"
                    className="block py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Download Desktop Agent
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Download Direct Link */}
            <div className="border-b border-white/6 pb-3">
              <Link
                to="/download"
                className="block py-2 text-sm font-semibold text-zinc-200 hover:text-white"
              >
                Download Agent
              </Link>
            </div>

            {/* Mobile Account Section */}
            <div className="pt-2 flex flex-col gap-2">
              {isAuth ? (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-white bg-[#6366f1]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/user"
                    className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-medium text-zinc-300 bg-white/6 border border-white/8"
                  >
                    Telemetry Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 text-center text-xs text-red-400 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-white bg-[#6366f1]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/docs/cli"
                    className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-medium text-zinc-300 bg-white/6 border border-white/8"
                  >
                    Read Docs
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Sub-component for individual dropdown items with glowing icons
function DropdownItem({ to, icon, iconBg = "bg-white/6 border-white/10", title, desc }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/6 border border-transparent hover:border-white/6 transition-all text-left group cursor-pointer"
    >
      <div
        className={`w-7 h-7 rounded-lg ${iconBg} border flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
          {title}
        </p>
        {desc && (
          <p className="text-[11px] text-zinc-500 line-clamp-1 leading-tight mt-0.5">
            {desc}
          </p>
        )}
      </div>
    </Link>
  );
}

// Sub-component for the Right Featured Preview Card (Faithfully reproducing the reference image)
function FeaturedPreviewCard({
  tag1 = "Primary / 6",
  tag2 = "16px",
  title = "Advance UI Customization",
  subtitle = "Personalize your collaboration experience",
  primaryBtnText = "View Docs",
  primaryBtnLink = "/docs/cli",
  secondaryBtnText = "Learn More",
  secondaryBtnLink = "/download",
}) {
  return (
    <div className="h-full bg-[#12131b] border border-white/8 rounded-xl p-4 flex flex-col justify-between shrink-0">
      {/* Top Visual Mockup Interface (Replicating the reference screenshot) */}
      <div className="relative w-full h-32 rounded-lg bg-[#08090e] border border-white/6 p-3 overflow-hidden flex flex-col justify-between">
        {/* Subtle grid dots in background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Top interactive elements */}
        <div className="flex items-center justify-end gap-1.5 relative z-10">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/6 text-zinc-400 border border-white/8 font-mono">
            Open ▾
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/6 text-zinc-400 border border-white/8 font-mono">
            P0 ▾
          </span>
        </div>

        {/* Center UI Node with Bounding Box and selection tags */}
        <div className="relative z-10 my-auto">
          {/* Tag 1 (Pink/Red Pill Badge) */}
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#f43f5e]/20 border border-[#f43f5e]/40 text-[#f43f5e] text-[9px] font-mono font-medium mb-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>{tag1}</span>
          </div>

          {/* Wireframe Card with handles */}
          <div className="relative w-full py-1.5 px-2 rounded-md bg-white/4 border border-dashed border-white/20 flex items-center justify-between">
            <span className="text-[10px] text-zinc-300 font-mono font-medium">
              runtime: Node.js • v20.x
            </span>

            {/* Corner selection handle */}
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-[1px]" />
          </div>

          {/* Tag 2 (Sky-blue Pill Badge) */}
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-tertiary/20 border border-tertiary/40 text-tertiary text-[9px] font-mono font-medium mt-1">
            <span>{tag2}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="mt-3">
        <h4 className="text-xs font-semibold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-2">
          {subtitle}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/6">
        {secondaryBtnLink && (
          <Link
            to={secondaryBtnLink}
            className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-white/6 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/8 text-xs font-medium transition-colors"
          >
            {secondaryBtnText}
          </Link>
        )}
        {primaryBtnLink && (
          <Link
            to={primaryBtnLink}
            className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-[#6366f1] hover:bg-[#5457e5] text-white text-xs font-medium transition-colors shadow-sm"
          >
            {primaryBtnText}
          </Link>
        )}
      </div>
    </div>
  );
}
