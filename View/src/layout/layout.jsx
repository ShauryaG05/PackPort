import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import PackPortLogo from "../components/PackPortLogo";
import Navbar from "../components/Navbar";

import docIconWebp from "../assets/docIcon.webp";
import { ArrowDownToLine } from "lucide-react";

import {
    LayoutDashboard,
    Terminal,
    Container,
    LogOut,
    Network,
    Menu,
    X,
    ChevronRight,
    User,
    Settings,
    Bell,
    RefreshCw,
} from "lucide-react";

import { getAuthHeaders, clearAuthSession, setAuthSession, getStoredUser } from "../lib/auth";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function OllamaIcon({ size = 17, className = "" }) {
    return (
        <span
            role="img"
            aria-label="Ollama"
            style={{
                background: "white",
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
            className={`inline-block bg-current shrink-0 ${className}`}
        />
    );
}

function NodeIcon({ size = 17, className = "" }) {
    return (
        <span
            role="img"
            aria-label="Ollama"
            style={{
                background: "Green",
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
            className={`inline-block bg-current shrink-0 ${className}`}
        />
    );
}

function DocIcon({ size = 16, className = "" }) {
    return (
        <img
            src={docIconWebp}
            alt="Docs"
            style={{ width: size, height: size }}
            className={`object-contain shrink-0 ${className}`}
        />
    );
}




function PythonIcon({ size = 17, className = "" }) {
    return (
        <span
            role="img"
            aria-label="Python"
            style={{
                background: "white",
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
            className={`inline-block bg-current shrink-0 ${className}`}
        />
    );
}



export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [agentOnline, setAgentOnline] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);

    async function handleLogout() {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
            await fetch(`${backendUrl}/auth/logout`, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include"
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            clearAuthSession();
            setUser(null);
            setAgentOnline(false);
            navigate("/auth/login", { replace: true });
        }
    }

    useEffect(() => {
        let isMounted = true;
        async function fetchUser() {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
                const res = await fetch(`${backendUrl}/auth/check`, {
                    method: "GET",
                    headers: getAuthHeaders(),
                    credentials: "include",
                });
                const data = await res.json();
                if (isMounted && data.status && data.user) {
                    setUser(data.user);
                    setAuthSession(undefined, data.user);
                    setAuthChecking(false);
                } else {
                    if (isMounted) {
                        clearAuthSession();
                        setUser(null);
                        setAuthChecking(false);
                        navigate("/auth/login", { replace: true, state: { from: location.pathname } });
                    }
                    return;
                }

                // Initial agent status check
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
            } catch (error) {
                console.error("Failed to fetch user or agent status:", error);
                if (isMounted) {
                    const cached = getStoredUser();
                    if (cached) {
                        setUser(cached);
                        setAuthChecking(false);
                        return;
                    }
                    if (import.meta.env.DEV) {
                        const devUser = { name: "Developer", email: "developer@packport.dev", agentCode: "PP-LOCAL" };
                        setUser(devUser);
                        setAuthChecking(false);
                        return;
                    }
                    clearAuthSession();
                    setUser(null);
                    setAuthChecking(false);
                    navigate("/auth/login", { replace: true, state: { from: location.pathname } });
                }
            }
        }

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, []);

    // Real-time agent status via Socket.IO
    useEffect(() => {
        if (!user?.agentCode) return;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
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
    }, [user?.agentCode]);

    const navigationItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "CLI Docs & Guide",
            path: "/docs/cli",
            icon: Terminal,
        },
        {
            name: "Download Agent",
            path: "/download",
            icon: ArrowDownToLine,
        }
    ];

    const secondaryNav = [
        {
            name: "Python (PyPI)",
            path: "/package/python",
            icon: PythonIcon,
        },
        {
            name: "Node.js (npm)",
            path: "/package/node",
            icon: NodeIcon,
        },
        {
            name: "Ollama (Local AI)",
            path: "/package/ollama",
            icon: OllamaIcon,
        }
    ];

    const ecosystemTabs = [
        {
            name: "DashBoard",
            path: "/dashboard",
            icon: PythonIcon,
            activeClass: "bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-xs",
        },
        {
            name: "Docs",
            path: "/docs/cli",
            icon: DocIcon,
            activeClass: "bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-xs",
        },
        {
            name: "Download",
            path: "/download",
            icon: ArrowDownToLine,
            activeClass: "bg-purple-600/20 text-purple-400 border-purple-500/40 shadow-xs",
        },
    ];

    if (authChecking) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground font-sans">
                <div className="relative mb-5 flex items-center justify-center">
                    <div className="absolute -inset-2 rounded-2xl bg-[#238636]/15 blur-lg animate-pulse" />
                    <PackPortLogo size={36} showBadge={false} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7bdb80]" />
                    <span>Verifying session...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const isDashboardRoute = location.pathname === "/dashboard";

    return (
        <div className="flex h-screen w-full bg-[#111317] text-[#c9d1d9] overflow-hidden font-sans">
            {/* Mobile / Flyout Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR - Accessible across all routes including Dashboard */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 shrink-0 bg-[#13151b] border-r border-white/[0.06] transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                {/* Sidebar Header / Brand */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-white/[0.06] bg-[#161922]/40">
                    <NavLink
                        to="/dashboard"
                        className="hover:opacity-90 transition-opacity flex items-center gap-2.5"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <PackPortLogo size={30} showBadge={false} />
                        <span className="font-bold text-white text-base tracking-tight">PackPort</span>
                    </NavLink>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Agent Status Card - Dynamic Connection State */}
                <div className="px-4 pt-5 pb-3">
                    <div className="rounded-2xl bg-[#1c1f28] border border-white/[0.06] p-3 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    {agentOnline && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    )}
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${agentOnline ? "bg-emerald-500" : "bg-gray-500"}`}></span>
                                </span>
                                <span className="text-[11px] font-semibold text-gray-300">Telemetry Daemon</span>
                            </div>
                            <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                    agentOnline
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                }`}
                            >
                                {agentOnline ? "Online" : "Standby"}
                            </span>
                        </div>
                        {user?.agentCode && (
                            <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-gray-400">
                                <span>Agent ID:</span>
                                <span className="text-primary font-bold">{user.agentCode}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
                    {/* Control Center */}
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Control Center
                        </p>
                        <nav className="space-y-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                            isActive
                                                ? "bg-[#282c35] text-white shadow-xs border border-white/[0.08]"
                                                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon
                                                size={16}
                                                className={`transition-colors ${
                                                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-200"
                                                }`}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Languages & Frameworks */}
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Languages & Frameworks
                        </p>
                        <nav className="space-y-1">
                            {secondaryNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                            isActive
                                                ? "text-white bg-[#282c35] border border-white/[0.08] shadow-xs"
                                                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon size={16} className={isActive ? "text-primary" : "text-gray-400"} />
                                            <span>{item.name}</span>
                                        </div>
                                        <ChevronRight size={13} className="text-gray-500" />
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Footer / Real User Profile section */}
                <div className="p-3 border-t border-white/[0.06] bg-[#161922]/50">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c1f28] border border-white/[0.05] transition-all hover:border-white/20 group">
                        <NavLink to="/user" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-400 p-[1.5px] shrink-0">
                                <div className="w-full h-full rounded-full bg-[#111317] flex items-center justify-center font-bold text-xs text-amber-300">
                                    {user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : "U")}
                                </div>
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-semibold text-white truncate">
                                    {user?.name || (user?.email ? user.email.split('@')[0] : "Developer")}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono truncate">
                                    {user?.email || "Local Workstation"}
                                </p>
                            </div>
                        </NavLink>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="h-7 w-7 text-gray-400 hover:text-red-400 transition-colors shrink-0"
                            title="Log Out"
                        >
                            <LogOut size={14} />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* RIGHT SIDE MAIN CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#111317]">
                {/* Standard Top Navbar only on non-dashboard pages */}
                {!isDashboardRoute && (
                    <Navbar
                        isDashboard={true}
                        onToggleSidebar={() => setSidebarOpen(true)}
                        authenticated={Boolean(user)}
                        user={user}
                        onLogout={handleLogout}
                    />
                )}

                {/* Dynamic Route Content Area */}
                <main className={`flex-1 overflow-y-auto ${isDashboardRoute ? "bg-[#111317] p-0" : "bg-background p-4 md:p-8"}`}>
                    {children || (
                        <Outlet
                            context={{
                                user,
                                agentOnline,
                                onLogout: handleLogout,
                                onToggleSidebar: () => setSidebarOpen(true),
                            }}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
