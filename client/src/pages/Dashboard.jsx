import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const isSubscribed = user?.subscription_status === "active";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  const [score, setScore] = useState("");
  const [playedAt, setPlayedAt] = useState("");
  const [scores, setScores] = useState([]);
  const [myWinnings, setMyWinnings] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [charities, setCharities] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [shownToast, setShownToast] = useState(false);

  const fetchScores = async () => {
    try {
      const res = await api.get("/score", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScores(res.data);
    } catch (error) {
      if (error.response?.status === 403 && !shownToast) {
        setShownToast(true);
      }
    }
  };

  const fetchWinnings = async () => {
    try {
      const res = await api.get("/winner/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyWinnings(res.data);
    } catch (error) {
      console.log("Failed to load winnings");
    }
  };

  const fetchCharities = async () => {
    try {
      const res = await api.get("/charity");
      setCharities(res.data);
    } catch (error) {
      console.log("Failed to load charities");
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const res = await api.get("/user/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserAnalytics(res.data);
    } catch (error) {
      console.log("Failed to load user analytics");
    }
  };

  useEffect(() => {
    const refreshSubscription = async () => {
      try {
        const res = await api.get("/subscription/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (error) {
        console.log("Failed to refresh subscription status");
      }
    };

    if (token) {
      refreshSubscription();
      fetchScores();
      fetchWinnings();
      fetchCharities();
      fetchUserAnalytics();
    }
  }, []);

  const handleAddScore = async (e) => {
    e.preventDefault();

    if (!score || !playedAt) {
      toast.error("Please enter score and date");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/score/add",
        { score: Number(score), played_at: playedAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.pruned) {
        toast.error(res.data.message, { duration: 5000 });
      } else {
        toast.success("Score recorded in Ledger!");
      }
      
      setScore("");
      setPlayedAt("");
      fetchScores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You'll lose access to monthly draws.")) return;
    try {
      const res = await api.post(
        "/subscription/cancel",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel subscription");
    }
  };

  const handleFileChange = (winnerId, file) => {
    setSelectedFiles((prev) => ({ ...prev, [winnerId]: file }));
  };

  const handleProofUpload = async (winnerId) => {
    try {
      const file = selectedFiles[winnerId];
      if (!file) return toast.error("Please select a file first");

      const formData = new FormData();
      formData.append("winnerId", winnerId);
      formData.append("proof", file);

      await api.post("/winner/upload-proof", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Proof uploaded successfully");
      fetchWinnings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    }
  };

  const getSubColor = (status) => {
    return status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "approved": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "rejected": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "paid": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      default: return "bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  const charityName = user?.charity_id 
    ? charities.find((c) => c.id === user.charity_id)?.name || "Unknown Charity"
    : "";

  const totalWon = myWinnings
    .filter((w) => w.payment_status === "paid")
    .reduce((sum, w) => sum + (w.prize_amount || 0), 0);

  const pendingWon = myWinnings
    .filter((w) => w.verification_status === "approved" && w.payment_status !== "paid")
    .reduce((sum, w) => sum + (w.prize_amount || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 max-w-6xl mx-auto space-y-10 relative z-10 font-sans mt-4 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            User <span className="neon-text-gradient">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Manage your scores, winnings, and impact.</p>
        </motion.div>

        {!isSubscribed && (
          <motion.div 
            variants={itemVariants}
            className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-between gap-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] backdrop-blur-md"
          >
            <p className="text-xs font-bold text-yellow-300">
              ⚡ Action Required: Subscription inactive
            </p>
            <button
              onClick={() => navigate("/subscribe")}
              className="bg-yellow-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wide hover:scale-105 transition-all shadow-lg"
            >
              Subscribe
            </button>
          </motion.div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="glass-card p-8 h-full flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Profile</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getSubColor(user?.subscription_status)}`}>
                  {user?.subscription_status || "inactive"}
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-white font-bold text-lg">{user?.full_name || "User"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-white font-medium text-sm truncate">{user?.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Plan</p>
                    <p className="text-white font-bold text-sm capitalize">{user?.subscription_plan || "None"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Next Renewal</p>
                    <p className="text-white font-bold text-sm">{user?.renewal_date ? new Date(user.renewal_date).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {user?.subscription_status === "active" && (
              <button
                onClick={handleCancelSubscription}
                className="mt-12 text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 group/cancel"
              >
                Cancel Subscription
                <svg className="w-4 h-4 group-hover/cancel:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Impact / Charity Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card p-8 h-full relative overflow-hidden flex flex-col group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>
             
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-lg font-black text-white uppercase tracking-widest">Charity Impact</h2>
               <button onClick={() => navigate("/charities")} className="text-cyan-400 hover:text-cyan-300 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                 Change Setup
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
               </button>
             </div>

             {user?.charity_id ? (
               <div className="flex-1 grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-400">Your contribution is supporting</p>
                    <h3 className="text-3xl font-black text-white leading-tight drop-shadow-md">
                      {charityName}
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse-slow shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                       <span className="text-sm font-black text-cyan-400 uppercase tracking-widest">{user?.charity_percentage || 10}% Commitment</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center shadow-inner group-hover:border-slate-700 transition-colors">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">This Month</p>
                        <p className="text-2xl font-black text-white">₹{userAnalytics?.activeContributed.toFixed(2) || "0.00"}</p>
                     </div>
                     <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center shadow-inner group-hover:border-slate-700 transition-colors">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Life</p>
                        <p className="text-2xl font-black text-emerald-400">₹{userAnalytics?.totalContributed.toFixed(2) || "0.00"}</p>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/40 rounded-[2rem] border border-dashed border-slate-700 mt-2">
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 mb-6 border border-slate-800">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Impact Disabled</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-sm mb-6 leading-relaxed">Select a charity to dedicate a portion of your subscription to a meaningful cause.</p>
                  <button
                    onClick={() => navigate("/charities")}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
                  >
                    Select Partner
                  </button>
               </div>
             )}
          </div>
        </motion.div>
      </div>

      {/* Rewards Status Section */}
      <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2rem] overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex-1 space-y-2">
             <h2 className="text-3xl font-black text-white tracking-tight">Reward Wallets</h2>
             <p className="text-slate-400 font-medium text-sm">Review your draw match history and approved payouts.</p>
           </div>
           
           <div className="flex gap-4">
              <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 min-w-[140px] text-center shadow-inner">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Rewards</p>
                 <p className="text-3xl font-black text-emerald-400">₹{totalWon.toLocaleString()}</p>
              </div>
              <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 min-w-[140px] text-center shadow-inner">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Awaiting Payout</p>
                 <p className="text-3xl font-black text-yellow-500">₹{pendingWon.toLocaleString()}</p>
              </div>
           </div>
        </div>

        <div className="mt-12">
          {myWinnings.length === 0 ? (
            <div className="p-16 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-center">
               <p className="text-slate-600 font-black text-lg uppercase tracking-widest">No Prize Ledger Entries Found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myWinnings.map((w) => (
                <div key={w.id} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-800/40 transition-all border group/win">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm group-hover/win:shadow-emerald-500/10 transition-shadow">
                         <span className="font-black text-xl">{w.match_type}</span>
                      </div>
                      <div>
                        <p className="font-black text-white text-xl">₹{w.prize_amount?.toLocaleString()}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{w.draws?.draw_month} {w.draws?.draw_year} Winner</p>
                      </div>
                   </div>

                   <div className="flex flex-wrap items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(w.verification_status)}`}>
                        {w.verification_status}
                      </span>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(w.payment_status)}`}>
                        {w.payment_status}
                      </span>

                      {w.proof_url ? (
                        <a href={w.proof_url} target="_blank" rel="noreferrer" className="ml-4 bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm">View Proof</a>
                      ) : (
                        <div className="flex gap-2 ml-4">
                           <label className="bg-slate-950 border border-slate-800 text-slate-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:border-slate-600 transition-all">
                              Upload Slip
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(w.id, e.target.files[0])} />
                           </label>
                           {selectedFiles[w.id] && (
                             <button onClick={() => handleProofUpload(w.id)} className="bg-cyan-500 text-slate-950 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.4)]">Go</button>
                           )}
                        </div>
                      )}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Score Submission Card */}
        <motion.div variants={itemVariants}>
          <div className="glass-card p-8 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-8">Participate</h2>
            <form onSubmit={handleAddScore} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Golf Score / Number (1-45)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={!isSubscribed}
                  placeholder="e.g. 18"
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-black text-xl shadow-inner disabled:opacity-30"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date Played</label>
                <input
                  type="date"
                  value={playedAt}
                  onChange={(e) => setPlayedAt(e.target.value)}
                  disabled={!isSubscribed}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-bold disabled:opacity-30"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !isSubscribed}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-2xl py-4 font-black uppercase tracking-widest text-xs mt-4 disabled:opacity-20 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all"
              >
                {loading ? "Recording..." : "Record Performance"}
              </button>
            </form>
          </div>
        </motion.div>

        {/* History Card */}
        <motion.div variants={itemVariants}>
          <div className="glass-card p-8 h-full relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Performance Ledger</h2>
              <div className="group/info relative">
                <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-black cursor-help hover:border-emerald-500/50 hover:text-emerald-400 transition-colors">i</div>
                <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 leading-relaxed">
                  Your Ledger is a <span className="text-emerald-400">rolling record</span> of your 5 most recent games. Older performances are automatically rotated out.
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Record of {scores.length} entries</p>
            
            {scores.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center bg-slate-950/40 rounded-3xl border border-slate-800/60 shadow-inner">
                <p className="text-slate-700 font-extrabold uppercase tracking-tighter text-3xl">Empty</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-3">
                {scores.map((item) => (
                  <div key={item.id} className="bg-slate-900/60 border border-slate-800 border-l-4 border-l-emerald-500/50 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-all group/item">
                     <span className="font-black text-2xl text-white group-hover/item:text-emerald-400 transition-colors w-12 text-center">{item.score}</span>
                     <div className="text-right">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated On</p>
                       <p className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">{item.played_at}</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;