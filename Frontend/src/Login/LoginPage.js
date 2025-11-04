import { useState } from "react";
import { useAuth } from "../Hooks/useAuth";

export default function LoginPage() {
    const { login, register } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await register(username, email, password);
                alert("User registered! You can login now.");
                setIsRegister(false);
            } else {
                await login(username, password);
                window.location.href = "/calendar";
            }
        } catch (err) {
            alert("Error: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div style={{ padding: "50px" }}>
            <h2>{isRegister ? "Register" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                {isRegister && (
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                )}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isRegister ? "Register" : "Login"}</button>
            </form>
            <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? "Go to Login" : "Create an Account"}
            </button>
        </div>
    );
}
