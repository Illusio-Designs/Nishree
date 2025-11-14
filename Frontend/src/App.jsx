import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./context/CartContext";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/Loader";
import "./App.css";
import "./Styles/index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<Loader size="large" />}>
            <AppRoutes />
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            limit={3}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
