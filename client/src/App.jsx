import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Charities from "./pages/Charities";
import Winnings from "./pages/Winnings";
import Subscribe from "./pages/Subscribe";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SubscribeSuccess from "./pages/SubscribeSuccess";
import SubscribeCancel from "./pages/SubscribeCancel";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Decorative Global Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/charities" element={<Charities />} />
            <Route path="/winnings" element={<Winnings />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/subscribe-success" element={<SubscribeSuccess />} />
            <Route path="/subscribe-cancel" element={<SubscribeCancel />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;