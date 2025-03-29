import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import DashboardLogin from "./pages/Dashboard/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<DashboardLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
