import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <GoogleOAuthProvider clientId="445489948580-stuovmdbh31nbv2utuhmn66eudj5tudj.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </AuthProvider>
);
