import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function Subscribe() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSubscribe = async (plan) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/register");
      return;
    }

    try {
      setLoadingPlan(plan);

      const res = await api.post(
        "/subscription/create-checkout-session",
        { plan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.href = res.data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="text-center mb-16 max-w-2xl relative z-10 mt-10">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
          Select a Subscription <span className="neon-text-gradient">Plan</span>
        </h1>
        <p className="text-lg text-slate-400 font-medium">Start a subscription to enter our monthly draws and support your favorite charities.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center items-stretch relative z-10">
        
        {/* Monthly Plan */}
        <div className="flex-1 glass-card p-8 rounded-3xl relative group flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Monthly Plan</h2>
            <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-700/50">Monthly subscription.</p>
            
            <div className="mb-8">
              <span className="text-4xl font-black text-white">₹250</span>
              <span className="text-slate-500 font-medium"> / month</span>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Participate in monthly draws</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Win real cash rewards</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Support charities natively</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe("monthly")}
            disabled={loadingPlan !== null}
            className="w-full bg-slate-800 border border-slate-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-700 hover:border-slate-600 shadow-lg disabled:opacity-50 transition-all mt-auto tracking-wide"
          >
            {loadingPlan === "monthly" ? "Processing..." : "Subscribe Monthly"}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="flex-1 glass-card border border-emerald-500/50 p-8 rounded-3xl relative flex flex-col shadow-[0_0_30px_rgba(16,185,129,0.15)] group hover:shadow-[0_0_50px_rgba(16,185,129,0.25)]">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-6 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.5)] whitespace-nowrap">
            Best Value
          </div>
          
          <div className="flex-1 mt-2">
            <h2 className="text-2xl font-bold text-white mb-2">Yearly Plan</h2>
            <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-700/50">Save with our yearly plan.</p>
            
            <div className="mb-8 relative inline-block">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">₹2500</span>
              <span className="text-slate-500 font-medium"> / year</span>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-6 h-6 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="font-bold text-white">2 months absolutely free</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Participate in monthly draws</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Win real cash rewards</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Support charities natively</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={() => handleSubscribe("yearly")}
            disabled={loadingPlan !== null}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 py-4 rounded-xl font-black text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] disabled:opacity-50 transition-all mt-auto tracking-wide"
          >
            {loadingPlan === "yearly" ? "Processing..." : "Subscribe Yearly"}
          </button>
        </div>

      </div>

      {message && <p className="mt-8 text-red-500 font-bold bg-red-500/10 px-6 py-3 border border-red-500/30 rounded-xl max-w-lg text-center backdrop-blur-sm shadow-xl">{message}</p>}
    </div>
  );
}

export default Subscribe;