import { useState } from "react";
import { useAuth } from "../Hooks/useAuth";

export default function LoginPage() {
    const { login, register } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                if (password !== confirmPassword) {
                    alert("Passwords do not match!");
                    return;
                }
                await register(username, email, password);
                alert("User registered! You can login now.");
                setIsRegister(false);
                setPassword("");
                setConfirmPassword("");
            } else {
                await login(username, password);
                window.location.href = "/calendar";
            }
        } catch (err) {
            alert("Error: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md shadow-2xl border border-slate-700 bg-slate-800 rounded-lg">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isRegister ? "Create Account" : "Welcome Back"}
                        </h1>
                        <p className="text-slate-400">
                            {isRegister ? "Join us today" : "Sign in to your account"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Email Input (Register only) */}
                        {isRegister && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Confirm Password Input (Register only) */}
                        {isRegister && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-6 rounded transition-colors"
                        >
                            {isRegister ? "Register" : "Login"}
                        </button>
                    </form>

                    {/* Toggle between Login and Register */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    setPassword("");
                                    setConfirmPassword("");
                                }}
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                            >
                                {isRegister ? "Login" : "Register"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
