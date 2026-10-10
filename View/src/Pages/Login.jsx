import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackPortIcon } from "../components/PackPortLogo";
import { Eye, EyeOff, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";



function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState("Input");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    async function loginHandler(e) {
        e.preventDefault();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                password: password,
            })
        })

        const data = await response.json();
        console.log(data);
        if (data.success) {
            setLoading("Success");
            console.log("Login successful")

        }
        else if (!data.success) {
            setLoading("Failed");
            console.log("Login failed")
        }
        else {
            setLoading("Input");
        }
    }

    return (
        <div className="min-h-screen bg-background text-[#c9d1d9] flex flex-col justify-between items-center px-4 py-8 font-sans selection:bg-secondary-container/30 selection:text-on-surface">
            {/* Top Header Helper Bar */}
            <header className="w-full flex items-center justify-start text-xs text-on-surface-variant px-2 sm:px-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>
            </header>

            {/* Main Container */}
            <main className="w-full max-w-90 flex flex-col items-center my-auto">
                {/* Logo & Title */}
                <div className="mb-5 flex flex-col items-center text-center">
                    <div className="mb-3">
                        <PackPortIcon size={52} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-on-surface tracking-tight">
                        Sign in to PackPort
                    </h1>
                </div>

                {loading === "Checking" ? (
                    <div className="w-full bg-surface border border-outline rounded-xl p-8 flex flex-col items-center justify-center gap-3 shadow-xl text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                        <h1 className="text-lg font-medium text-on-surface">Checking Credentials</h1>
                        <p className="text-xs text-on-surface-variant">Please wait while we verify your account...</p>
                    </div>
                ) : loading === "Input" ? (
                    <>
                        {/* Form Card */}
                        <div className="w-full bg-surface border border-outline rounded-xl p-5 sm:p-6 shadow-xl">
                            <form onSubmit={loginHandler} className="space-y-4">
                                {/* Email / Username Input */}
                                <div>
                                    <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                                        Username or Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full bg-background border border-outline focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-lg px-3 py-2 text-sm text-on-surface placeholder-[#484f58] outline-none transition-colors"
                                    />
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full bg-background border border-outline focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-lg pl-3 pr-9 py-2 text-sm text-on-surface placeholder-[#484f58] outline-none transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-[#c9d1d9] p-1 transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Login Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-primary hover:bg-primary-container text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2"
                                >
                                    Login
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-4 text-center">
                                <div className="w-full border-t border-outline absolute top-1/2 -translate-y-1/2" />
                                <span className="bg-surface px-2.5 text-xs text-on-surface-variant relative z-10 font-normal">
                                    or
                                </span>
                            </div>

                            {/* Social SSO Buttons */}
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/dashboard")}
                                    className="w-full py-2 px-3 rounded-lg bg-background hover:bg-surface-variant border border-outline text-xs font-medium text-[#c9d1d9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>
                            </div>
                        </div>

                        {/* Link to Register / Signup Box */}
                        <div className="mt-4 p-4 border border-outline rounded-xl bg-surface text-center w-full text-xs text-on-surface-variant">
                            <span>New to PackPort? </span>
                            <Link
                                to="/auth/signup"
                                className="text-secondary hover:underline font-medium"
                            >
                                Create an account
                            </Link>
                        </div>
                    </>
                ) : loading === "Success" ? (
                    navigate("/dashboard")
                ) : loading === "Failed" ? (
                    <>
                        <h1 className="text-xl font-medium text-on-surface">Login Failed</h1>
                        <p className="text-xs text-on-surface-variant">Please check your credentials and try again</p>
                        <div onClick={() => navigate("/auth/login")} className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-primary hover:bg-primary-container text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2">
                            Try Again
                        </div>
                    </>
                ) : null}
            </main>

            {/* Footer Links */}
            <footer className="w-full mt-auto pt-8 text-[11px] text-[#484f58] flex flex-wrap items-center justify-center gap-4 text-center">
                <a href="#terms" className="hover:text-on-surface-variant transition-colors">
                    Terms
                </a>
                <a href="#privacy" className="hover:text-on-surface-variant transition-colors">
                    Privacy
                </a>
                <a href="#docs" className="hover:text-on-surface-variant transition-colors">
                    Docs
                </a>
                <a href="#support" className="hover:text-on-surface-variant transition-colors">
                    Contact Support
                </a>
            </footer>
        </div>
    );
}

export default Login;