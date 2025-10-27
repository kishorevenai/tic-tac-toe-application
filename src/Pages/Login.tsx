import { useState, useEffect } from "react";
import client from "../nakamaClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [displayName, setDisplayName] = useState<string>("");
  const [existingUser, setExistingUser] = useState(false); // track if user exists
  const [isChecked, setIsChecked] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Optional: restore session if token exists
    const token = localStorage.getItem("nakamaToken");
    if (!token) return;

    try {
      const restoredSession = client.restoreSession(token);
      if (restoredSession && !restoredSession.isexpired(Date.now() / 1000)) {
        fetchExistingUserData(restoredSession);
      }
    } catch (err) {
      console.log("Failed to restore session", err);
    }
  }, []);

  async function fetchExistingUserData(session) {
    try {
      const account = await client.getAccount(session);
      if (account.display_name) {
        setDisplayName(account.display_name);
        setExistingUser(true); // mark as existing user
      }
    } catch (err) {
      console.log("No existing user data", err);
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsChecked((prev) => !prev);
  };

  async function loginOrCreate(email: string, password: string) {
    try {
      setStatus("Logging in...");
      // Attempt login first

      let session: any;

      if (isChecked) {
        session = await client.authenticateEmail(email, password, false);
      } else {
        session = await client.authenticateEmail(email, password, true);
        await client.updateAccount(session, { display_name: displayName });
      }

      // Don't overwrite display name if existing
      localStorage.setItem("nakamaSession", JSON.stringify(session));
      localStorage.setItem("nakamaToken", session.token);
      setStatus("Login successful!");
      setExistingUser(true); // mark as existing user
      navigate("/dashboard");
      return session;
    } catch (error) {
      console.error("Failed to login or create account:", error);
      setStatus("Failed to login, Please check your credentials.");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecked) {
      if (!email || !password) {
        setStatus("Please enter all the fields.");
        return;
      }
    } else {
      if (!email || !password || !displayName) {
        setStatus("Please enter all the fields.");
        return;
      }
    }
    loginOrCreate(email, password);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-2xl font-semibold">
        {isChecked ? "Login" : "Signup"}
      </h2>

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
        {/* Show display name input only for new users */}
        {!isChecked && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border p-2 rounded"
          />
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {isChecked ? "Login" : "Signup"}
        </button>
        <button checked={isChecked} onClick={handleCheckboxChange}>
          {isChecked ? "Signup ?" : "Login ?"}
        </button>
      </form>

      <p className="text-gray-600">{status}</p>
    </div>
  );
};

export default Login;
