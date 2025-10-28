import { createContext, useState } from "react";

export const MyContext = createContext(null);

export const MyProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<any>(null);

  return (
    <MyContext.Provider value={{ user, setUser }}>
      {children}
    </MyContext.Provider>
  );
};
