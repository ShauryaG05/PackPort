import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PackPortLogo from "./PackPortLogo";
import {
  LayoutDashboard,
  Terminal,
  Download,
  Info,
  ArrowRight,
  ChevronDown,
  LogOut,
  LogIn,
  Menu,
  X,
  ExternalLink,
  User,
  Bell,
  Check,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  getAuthHeaders,
  clearAuthSession,
  setAuthSession,
  getStoredUser,
} from "../lib/auth";

export function GithubIcon({ size = 16, className = "" }) {
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
        WebkitMaskImage:
          'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/python.webp")',
        maskImage:
          'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/python.webp")',
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
        WebkitMaskImage:
          'url("https://cdn.simpleicons.org/nodedotjs/5FA04E")',
        maskImage:
          'url("https://cdn.simpleicons.org/nodedotjs/5FA04E")',
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
        WebkitMaskImage:
          'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/ollama.svg")',
        maskImage:
          'url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/ollama.svg")',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [internalUser, setInternalUser] = useState(() => getStoredUser() || null);
  const [internalAuth, setInternalAuth] = useState(() => Boolean(getStoredUser()));
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = propAuth !== undefined ? propAuth : internalAuth;
  const currentUser = propUser || internalUser;

  // Check auth status asynchronously on mount if not passed as prop
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
            (import.meta.env.PROD
              ? "https://packport.onrender.com"
              : "http://localhost:5600");

          const response = await fetch(`${backendUrl}/auth/check`, {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include",
          });

          const data = await response.json();
          if (isMounted) {
            if (data.status) {
              setInternalAuth(true);
              if (propSetAuth) propSetAuth(true);
              if (data.user) {
                setInternalUser(data.user);
                setAuthSession(undefined, data.user);
              }
            } else {
              clearAuthSession();
              setInternalAuth(false);
              if (propSetAuth) propSetAuth(false);
              setInternalUser(null);
            }
          }
        } catch {
          if (isMounted) {
            clearAuthSession();
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
      setProfileDropdownOpen(false);
      return;
    }
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        import.meta.env.VITE_URL ||
        (import.meta.env.PROD
          ? "https://packport.onrender.com"
          : "http://localhost:5600");

      await fetch(`${backendUrl}/auth/logout`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      clearAuthSession();
      setInternalAuth(false);
      if (propSetAuth) propSetAuth(false);
      setInternalUser(null);
      setProfileDropdownOpen(false);
      navigate("/auth/login");
    }
  }

  // Close menus on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Standard navigation links across the entire site
  const navLinks = [
    {
      name: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      isActive: location.pathname === "/dashboard",
    },
    {
      name: "Docs",
      to: "/docs/cli",
      icon: Terminal,
      isActive: location.pathname.startsWith("/docs"),
    },
    {
      name: "Download",
      to: "/download",
      icon: Download,
      isActive: location.pathname === "/download",
    },
    {
      name: "About Us",
      to: "/about",
      icon: Info,
      isActive: location.pathname === "/about",
    },
    {
      name: "GitHub",
      href: "https://github.com/ShauryaG05/PackPort",
      icon: GithubIcon,
      isExternal: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090d]/85 backdrop-blur-xl border-b border-white/8 select-none transition-colors duration-200">
      {/* Top subtle glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/25 to-transparent pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        {/* 1. Left Side: Brand Logo or Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {isDashboard && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/6 transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-95 transition-opacity focus:outline-none group"
            aria-label="PackPort Home"
          >
            <PackPortLogo size={30} showBadge={false} />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>v1.2</span>
            </span>
          </Link>
        </div>

        {/* 2. Center Navigation: Floating Capsule Nav Bar with Smooth Spring Animation */}
        <nav
          className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 bg-[#12141c]/90 border border-white/10 rounded-full p-1 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md gap-0.5"
          aria-label="Main Navigation"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            if (item.isExternal) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/4 transition-colors"
                >
                  <Icon size={14} className="text-zinc-400" />
                  <span className="hidden lg:inline">{item.name}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.to}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
                  item.isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/4"
                }`}
              >
                {item.isActive && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-[#252a36] border border-white/12 rounded-full shadow-inner"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon
                    size={14}
                    className={
                      item.isActive
                        ? "text-blue-400"
                        : "text-zinc-400 group-hover:text-zinc-200"
                    }
                  />
                  <span>{item.name}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right Action Items: Auth & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Docs Link for Compact Desktop (visible only when not on docs) */}
          {!location.pathname.startsWith("/docs") && (
            <Link
              to="/docs/cli"
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/4 transition-colors"
            >
              <Terminal size={13} className="text-zinc-500" />
              <span>CLI Guide</span>
            </Link>
          )}

          {/* Unauthenticated View: Sign In CTA Button */}
          {!isAuth ? (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-container px-3.5 py-1.5 rounded-xl transition-all shadow-[0_0_16px_rgba(37,99,235,0.35)] hover:shadow-[0_0_22px_rgba(37,99,235,0.55)] active:scale-95 cursor-pointer border border-primary/40"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </Link>
            </div>
          ) : (
            /* Authenticated View: User Avatar with Interactive Popover Menu */
            <div className="relative" ref={profileMenuRef}>
              <div className="flex items-center gap-2">
                {/* Dashboard Shortcut Button (on non-dashboard pages) */}
                {location.pathname !== "/dashboard" && (
                  <Link
                    to="/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container transition-all shadow-xs active:scale-95"
                  >
                    <span>Dashboard</span>
                    <ArrowRight size={13} />
                  </Link>
                )}

                {/* Profile Pill Trigger */}
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    profileDropdownOpen
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/4 hover:bg-white/8 border-white/8 text-zinc-200"
                  }`}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  title="Account Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-500 via-indigo-500 to-cyan-400 p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-full bg-[#111317] flex items-center justify-center font-bold text-[11px] text-blue-300">
                      {currentUser?.name
                        ? currentUser.name[0].toUpperCase()
                        : currentUser?.email
                        ? currentUser.email[0].toUpperCase()
                        : "U"}
                    </div>
                  </div>
                  <span className="hidden sm:inline max-w-28 truncate text-xs font-medium">
                    {currentUser?.name || "Profile"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-zinc-400 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#11131a]/98 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 text-left"
                  >
                    {/* User summary card */}
                    <div className="p-3 rounded-xl bg-white/4 border border-white/6 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {currentUser?.name
                            ? currentUser.name[0].toUpperCase()
                            : "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {currentUser?.name || "Developer"}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono truncate">
                            {currentUser?.email || "Local Workstation"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/6 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500">Agent Status</span>
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      </div>
                    </div>

                    {/* Quick navigation links */}
                    <div className="space-y-0.5 text-xs">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-blue-400" />
                        <span>Workstation Dashboard</span>
                      </Link>

                      <Link
                        to="/user"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
                      >
                        <User size={14} className="text-indigo-400" />
                        <span>Telemetry Profile & API</span>
                      </Link>

                      <Link
                        to="/package/python"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
                      >
                        <Layers size={14} className="text-emerald-400" />
                        <span>Monitored Packages</span>
                      </Link>

                      <Link
                        to="/docs/cli"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
                      >
                        <Terminal size={14} className="text-amber-400" />
                        <span>CLI Terminal Guide</span>
                      </Link>
                    </div>

                    {/* Sign Out Button */}
                    <div className="mt-1.5 pt-1.5 border-t border-white/6">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sign Out of Session</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/6 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0c0d12]/98 backdrop-blur-2xl border-b border-white/10 px-4 py-5 overflow-y-auto max-h-[85vh] space-y-4"
          >
            {/* Main Links */}
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Navigation
              </p>
              {navLinks.map((item) => {
                const Icon = item.icon;
                if (item.isExternal) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-zinc-400" />
                        <span>{item.name}</span>
                      </div>
                      <ExternalLink size={13} className="text-zinc-500" />
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      item.isActive
                        ? "bg-[#252a36] text-white border border-white/10"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={item.isActive ? "text-blue-400" : "text-zinc-400"}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth / Account Controls */}
            <div className="pt-3 border-t border-white/6 flex flex-col gap-2">
              {isAuth ? (
                <>
                  <div className="p-3 rounded-xl bg-white/4 border border-white/6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {currentUser?.name || "Developer"}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {currentUser?.email || "Local Workstation"}
                      </p>
                    </div>
                    <Link
                      to="/user"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-medium text-blue-400 hover:underline"
                    >
                      Settings
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-center text-xs font-semibold text-white bg-primary hover:bg-primary-container transition-colors shadow-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-center text-xs font-semibold text-zinc-300 bg-white/6 hover:bg-white/10 border border-white/8 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
