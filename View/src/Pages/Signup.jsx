import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackPortIcon } from "../components/PackPortLogo";
import {
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";


function SuccessVerification({ onRedirect }) {
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();


    useEffect(() => {
        checkUser()
        if (countdown <= 0) {
            onRedirect();
            return;
        }
        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);


    }, [countdown, onRedirect]);

    return (
        <div className="w-full bg-surface border border-primary rounded-xl p-8 flex flex-col items-center justify-center gap-4 shadow-xl text-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-tertiary">
                <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-on-surface">Account Created Successfully</h2>
                <p className="text-xs text-on-surface-variant mt-1">Your PackPort workspace is ready.</p>
            </div>
            <div className="w-full bg-background border border-outline rounded-lg py-2.5 px-4 text-xs text-on-surface-variant flex items-center justify-between">
                <span>Redirecting to Dashboard</span>
                <span className="font-semibold text-tertiary">{countdown}s</span>
            </div>
            <button
                type="button"
                onClick={onRedirect}
                className="text-xs text-secondary hover:underline cursor-pointer mt-1"
            >
                Click here if not redirected automatically
            </button>
        </div>
    );
}

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [phase, setPhase] = useState(1); // 1: Signup detail input, 2: Loading/Wait stage, 3: Success & redirect, 4: failed 
    const navigate = useNavigate();





    // Password strength logic
    const getPasswordMetrics = (pass) => {
        let score = 0;
        if (!pass) return { score: 0, label: "", color: "" };
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { score: 1, label: "Weak", color: "bg-error", text: "text-error" };
        if (score === 2 || score === 3) return { score: 2, label: "Medium", color: "bg-[#d29922]", text: "text-[#d29922]" };
        return { score: 3, label: "Strong", color: "bg-tertiary", text: "text-tertiary" };
    };

    const pwdMetrics = getPasswordMetrics(password);

    async function handleSignup(e) {
        if (e) e.preventDefault();
        setPhase(2); // Loading/Wait stage
        const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL || (import.meta.env.PROD ? "https://packport.onrender.com" : "http://localhost:5600");
        try {
            const response = await fetch(`${backendUrl}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    confirm_password: confirmPassword,
                    confirmPassword: confirmPassword
                })
            });

            const data = await response.json();
            console.log("Signup Response:", data);

            if (data.success) {
                console.log("Signup successful! User data:", data.user);
                setPhase(3); // transition to success phase
            } else {
                console.error("Signup failed:", data.message);
                setErrorMessage(data.message || "Failed to create account. Please try again.");
                setPhase(4); // failed phase
            }
        } catch (err) {
            console.error("Signup error:", err);
            setErrorMessage("Network error. Please try again.");
            setPhase(4);
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
            <main className="w-full max-w-100 flex flex-col items-center my-auto">
                {/* Logo Mark & Title */}
                <div className="mb-5 flex flex-col items-center text-center">
                    <div className="mb-3">
                        <PackPortIcon size={52} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-on-surface tracking-tight">
                        Create your PackPort account
                    </h1>
                </div>

                {phase === 1 ? (
                    <>
                        {/* Form Card */}
                        <div className="w-full bg-surface border border-outline rounded-xl p-5 sm:p-6 shadow-xl">
                            <form onSubmit={handleSignup} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                                        Full name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Shaurya Gupta"
                                        required
                                        className="w-full bg-background border border-outline focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-lg px-3 py-2 text-sm text-on-surface placeholder-[#484f58] outline-none transition-colors"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                                        Work email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        required
                                        className="w-full bg-background border border-outline focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-lg px-3 py-2 text-sm text-on-surface placeholder-[#484f58] outline-none transition-colors"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="At least 6 characters"
                                            required
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

                                    {/* Password strength indicator */}
                                    {password.length > 0 && (
                                        <div className="mt-2 p-2 rounded-lg bg-background border border-outline space-y-1">
                                            <div className="flex items-center justify-between text-[11px] font-medium">
                                                <span className="text-on-surface-variant">Password strength:</span>
                                                <span className={pwdMetrics.text}>{pwdMetrics.label}</span>
                                            </div>
                                            <div className="w-full bg-surface-variant h-1 rounded-full overflow-hidden flex gap-1">
                                                <div
                                                    className={`h-full transition-all duration-300 ${pwdMetrics.score >= 1 ? pwdMetrics.color : "bg-transparent"
                                                        } flex-1`}
                                                />
                                                <div
                                                    className={`h-full transition-all duration-300 ${pwdMetrics.score >= 2 ? pwdMetrics.color : "bg-transparent"
                                                        } flex-1`}
                                                />
                                                <div
                                                    className={`h-full transition-all duration-300 ${pwdMetrics.score >= 3 ? pwdMetrics.color : "bg-transparent"
                                                        } flex-1`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter password"
                                            required
                                            className="w-full bg-background border border-outline focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-lg pl-3 pr-9 py-2 text-sm text-on-surface placeholder-[#484f58] outline-none transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-[#c9d1d9] p-1 transition-colors"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-2.5 px-4 rounded-lg font-medium text-sm bg-primary hover:bg-primary-container active:bg-[#1a56db] text-white transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] active:translate-y-0.5 shadow-sm hover:shadow-md active:shadow-inner flex items-center justify-center gap-2 mt-2 select-none"
                                >
                                    Create account
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
                                    onClick={() => navigate("/Home")}
                                    className="w-full py-2 px-3 rounded-lg bg-background hover:bg-surface-variant border border-outline text-xs font-medium text-[#c9d1d9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                    <span>Continue with GitHub</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/Home")}
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

                        {/* Link to Login */}
                        <div className="mt-4 p-4 border border-outline rounded-xl bg-surface text-center w-full text-xs text-on-surface-variant">
                            <span>Already have an account? </span>
                            <Link
                                to="/auth/login"
                                className="text-secondary hover:underline font-medium"
                            >
                                Sign in
                            </Link>
                        </div>
                    </>
                ) : phase === 2 ? (
                    <div className="w-full bg-surface border border-outline rounded-xl p-8 flex flex-col items-center justify-center gap-3 shadow-xl text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                        <h1 className="text-lg font-medium text-on-surface">Creating your account...</h1>
                        <p className="text-xs text-on-surface-variant">Setting up your workspace and credentials</p>
                    </div>
                ) : phase === 3 ? (
                    <SuccessVerification onRedirect={() => navigate("/dashboard")} />
                ) : phase === 4 ? (
                    <div className="w-full bg-surface border border-error/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 shadow-xl text-center">
                        <div className="w-12 h-12 rounded-full bg-error/10 border border-error flex items-center justify-center text-error">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h1 className="text-lg font-medium text-on-surface">Signup Failed</h1>
                        <p className="text-xs text-on-surface-variant max-w-xs">{errorMessage}</p>
                        <button
                            type="button"
                            onClick={() => setPhase(1)}
                            className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-primary hover:bg-primary-container text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2"
                        >
                            Try Again
                        </button>
                    </div>
                ) : null}
            </main>

            {/* Footer */}
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

export default Signup;