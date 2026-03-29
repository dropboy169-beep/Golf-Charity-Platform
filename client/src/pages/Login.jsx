import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Login successful");
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-sans relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md glass-card p-8 sm:p-10 rounded-3xl relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
           <h1 className="text-3xl font-black mb-3 text-white tracking-tight drop-shadow-md">Welcome <span className="neon-text-gradient">Back</span></h1>
           <p className="text-sm text-slate-400 font-medium">
             Login to your account
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full bg-slate-900/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner font-medium text-sm"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-slate-900/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner font-medium text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L14.12 14.12"/><path d="M2 2l20 20"/><path d="M10.37 4.37a9 9 0 0 1 8.7 5.03"/><path d="M22 12c0 2.13-1.66 4.85-4 6.67"/><path d="M15.42 15.42a4.87 4.87 0 0 1-6.84-6.84"/><path d="M2 12c.04-1.2.32-2.38.8-3.5"/><path d="M6.38 6.38a9 9 0 0 0-4.38 5.62"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-xl text-center text-sm font-bold shadow-sm">
               {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-xl px-4 py-3.5 font-black uppercase tracking-wider text-sm mt-8 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all active:scale-95"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-8 text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;