import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./context/CartContext";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/Loader";
import { useNotifications } from "./hooks/useNotifications.jsx";
import "./App.css";
import "./styles/index.css";

function AppContent() {
  // Check for notifications when user visits
  useNotifications();
  
  return (
    <>
      <Suspense fallback={<Loader size="large" />}>
        <AppRoutes />
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        limit={3}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
