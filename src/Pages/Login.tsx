import { useState } from "react";
import client from "../nakamaClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  async function loginOrCreate(email: string, password: string) {
    try {
      setStatus("Logging in...");
      const session = await client.authenticateEmail(
        email,
        password,
        create: false,
      );
      console.log("Logged in existing user:", session);
      localStorage.setItem("nakamaToken", session.token);
      setStatus("Login successful!");
      navigate("/dashboard");
      return session;
    } catch (error) {
      console.log("User not found, creating new one...");
      try {
        const session = await client.authenticateEmail({
          email,
          password,
          create: true,
        });
        console.log("New user created:", session);
        localStorage.setItem("nakamaToken", session.token);
        setStatus("Account created successfully!");
        navigate("/dashboard");
        return session;
      } catch (err) {
        console.error("Failed to login or create account:", err);
        setStatus("Login failed. Please try again.");
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus("Please enter both email and password.");
      return;
    }
    loginOrCreate(email, password);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-2xl font-semibold">Login / Sign Up</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-4 bg-gray-100 rounded-lg w-80"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login / Create Account
        </button>
      </form>
      <p className="text-gray-600">{status}</p>
    </div>
  );
};

export default Login;
