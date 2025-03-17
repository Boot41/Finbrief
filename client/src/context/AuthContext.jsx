import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkToken = async () => {
    if (localStorage.getItem("token")) {
      const me = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { token: ` ${localStorage.getItem("token")}` },
      });

      if (me.status === 200) {
        setIsLoggedIn(true);
      }
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
