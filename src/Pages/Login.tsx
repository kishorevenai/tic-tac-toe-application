import { useState, useEffect, useContext } from "react";
import client from "../nakamaClient";
import { useNavigate } from "react-router-dom";

import { MyContext } from "../store/nakamaContext";

const Login = () => {
  const { user, setUser }: any = useContext(MyContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [displayName, setDisplayName] = useState<string>("");

  const [isChecked, setIsChecked] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Optional: restore session if token exists
    const token = user || localStorage.getItem("nakamaToken");
    if (!token) return;

    try {
      const restoredSession = client.sessionRefresh(token);
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

      setUser(session);

      // Don't overwrite display name if existing
      localStorage.setItem("nakamaSession", JSON.stringify(session));
      localStorage.setItem("nakamaToken", session.token);

      setStatus("Login successful!");

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
    // <div className="flex flex-col items-center justify-center h-screen gap-4">
    //   <h2 className="text-2xl font-semibold">
    //     {isChecked ? "Login" : "Signup"}
    //   </h2>

    //   <form
    //     onSubmit={handleSubmit}
    //     className="flex flex-col gap-3 p-4 bg-gray-100 rounded-lg w-80"
    //   >
    //     <input
    //       type="email"
    //       placeholder="Email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //       className="border p-2 rounded"
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       className="border p-2 rounded"
    //     />
    //     {/* Show display name input only for new users */}
    //     {!isChecked && (
    //       <input
    //         type="text"
    //         placeholder="Display Name"
    //         value={displayName}
    //         onChange={(e) => setDisplayName(e.target.value)}
    //         className="border p-2 rounded"
    //       />
    //     )}
    //     <button
    //       type="submit"
    //       className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
    //     >
    //       {isChecked ? "Login" : "Signup"}
    //     </button>
    //     <button checked={isChecked} onClick={handleCheckboxChange}>
    //       {isChecked ? "Signup ?" : "Login ?"}
    //     </button>
    //   </form>

    //   <p className="text-gray-600">{status}</p>
    // </div>
    <div className="w-full h-[100vh] flex justify-center items-center px-5">
      <form onSubmit={handleSubmit} className="h-[500px]">
        <h1 className="text-[20px] sm:text-[20px] md:text-[100px]">
          Player Login
        </h1>

        <p className="span mb-5">Welcome back to Tic-Tac-Toe Pro</p>
        <p className="text-gray-600">{status}</p>
        <div className="flex flex-col gap-1 mb-2">
          <label htmlFor="email">Email:</label>

          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-input"
          />
        </div>
        <div className="flex flex-col gap-1 mb-2">
          <label htmlFor="password">Password:</label>

          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-input"
          />
        </div>
        {!isChecked && (
          <div className="flex flex-col gap-1 mb-2">
            <label htmlFor="displayname">Display Name:</label>
            <input
              id="displayname"
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="p-input"
            />
          </div>
        )}

        <div className="flex gap-5">
          <button type="submit" className="p-button">
            {isChecked ? "Login" : "Signup"}
          </button>

          <button
            className="s-button"
            checked={isChecked}
            onClick={handleCheckboxChange}
          >
            {isChecked ? "Signup ?" : "Login ?"}{" "}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
