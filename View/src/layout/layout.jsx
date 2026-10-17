import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";

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

    async function handleLogout() {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
            const response = await fetch(`${backendUrl}/auth/logout`, {
                method: "GET",
                credentials: "include"
            });
            const data = await response.json();

            if (data.success) {
                setUser(null);
                navigate("/");
            } else {
                alert("Logout Failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    useEffect(() => {
        let isMounted = true;
        async function fetchUser() {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
                const res = await fetch(`${backendUrl}/auth/check`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (isMounted && data.user?.name) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        }

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, []);

    const navigationItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Terminal Guide",
            path: "/docs/cli",
            icon: Terminal,
        },
        {
            name: "System Updates",
            path: "/package",
            icon: Settings,
        }
    ];

    const secondaryNav = [
        {
            name: "Python",
            path: "/package/python",
            icon: PythonIcon,
        },
        {
            name: "Node.js",
            path: "/package/node",
            icon: NodeIcon,
        },
        {
            name: "Ollama",
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

    return (
        <div className="flex h-screen w-full bg-background text-[#c9d1d9] overflow-hidden font-sans">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* LEFT SIDEBAR */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 shrink-0 bg-[#0d1117] border-r border-outline transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Sidebar Header / Brand */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-outline bg-[#161b22]/50">
                    <NavLink
                        to="/dashboard"
                        className="hover:opacity-90 transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <PackPortLogo size={32} showBadge={true} />
                    </NavLink>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* System Status Card - Refined Dell/HP Style */}
                <div className="px-4 pt-6 pb-4">
                    <Card className="bg-background/40 border-outline p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[11px] font-medium text-gray-300">System Agent</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                Online
                            </Badge>
                        </div>
                    </Card>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-8">
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
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
                                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                            : "text-gray-400 hover:text-white hover:bg-[#21262d]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                size={18}
                                                className={`transition-colors ${isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                                                    }`}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                            Ecosystems
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
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                            ? "text-white bg-[#21262d] font-medium"
                                            : "text-gray-400 hover:text-white hover:bg-[#21262d]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={17} className={isActive ? "text-primary" : "text-gray-500"} />
                                            <span>{item.name}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-600" />
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Footer / User Profile section */}
                <div className="p-4 border-t border-outline bg-[#0d1117]">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#161b22] border border-outline transition-all hover:border-primary/30 group">
                        <NavLink to="/user" className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90 transition-opacity">
                            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                {user?.name ? user.name[0].toUpperCase() : "A"}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-semibold text-white truncate">
                                    {user?.name || user?.email || "Admin User"}
                                </p>
                                <p className="text-[10px] text-gray-500 font-mono truncate">
                                    {user?.agentCode ? `Agent ${user.agentCode}` : "v1.0.0-stable"}
                                </p>
                            </div>
                        </NavLink>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="h-8 w-8 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                            title="Log Out"
                        >
                            <LogOut size={16} />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* RIGHT SIDE MAIN CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top Navbar */}
                <Navbar
                    isDashboard={true}
                    onToggleSidebar={() => setSidebarOpen(true)}
                    authenticated={true}
                    user={user}
                    onLogout={handleLogout}
                />

                {/* Dynamic Route Content Area */}
                <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
}
