import React, { createContext, useContext, useState } from "react";

interface NakamaSession {
  token: string;
  user_id: string;
  username?: string;
  display_name?: string;
  created_at?: string;
  expires_at?: string;
  refresh_token?: string;
  [key: string]: any;
}

interface NakamaContextType {
  session: NakamaSession | null;
  setSession: (session: NakamaSession | null) => void;
  clearSession: () => void;
  isAuthenticated: boolean;
}

const NakamaContext = createContext<NakamaContextType | undefined>(undefined);

interface NakamaProviderProps {
  children: ReactNode;
}

export const NakamaProvider: React.FC<NakamaProviderProps> = ({ children }) => {
  const [session, setSessionState] = useState<NakamaSession | null>(() => {
    // Initialize from localStorage
    const storedSession = localStorage.getItem("nakamaSession");
    return storedSession ? JSON.parse(storedSession) : null;
  });

  const setSession = (newSession: NakamaSession | null) => {
    setSessionState(newSession);
    if (newSession) {
      localStorage.setItem("nakamaSession", JSON.stringify(newSession));
      localStorage.setItem("nakamaToken", newSession.token);
    }
  };

  const clearSession = () => {
    setSessionState(null);
    localStorage.removeItem("nakamaSession");
    localStorage.removeItem("nakamaToken");
  };

  const isAuthenticated = !!session;

  return (
    <NakamaContext.Provider
      value={{ session, setSession, clearSession, isAuthenticated }}
    >
      {children}
    </NakamaContext.Provider>
  );
};

// Custom hook to use the Nakama context
export const useNakama = (): NakamaContextType => {
  const context = useContext(NakamaContext);
  if (context === undefined) {
    throw new Error("useNakama must be used within a NakamaProvider");
  }
  return context;
};
