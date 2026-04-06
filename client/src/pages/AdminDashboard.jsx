import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function AdminDashboard() {
  const [winnerRequests, setWinnerRequests] = useState([]);
  const [allWinners, setAllWinners] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [drawHistory, setDrawHistory] = useState([]);
  const [loadingDraw, setLoadingDraw] = useState(false);
  const [drawSimResult, setDrawSimResult] = useState(null);
  const [drawAlgorithm, setDrawAlgorithm] = useState("algorithmic"); 
  const [currentUser, setCurrentUser] = useState(null);

  const [charities, setCharities] = useState([]);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charityFormData, setCharityFormData] = useState({ id: null, name: '', description: '', featured: false, image: null });
  const [loadingCharity, setLoadingCharity] = useState(false);

  // Deep User Management State
  const [showUserModal, setShowUserModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [userFormData, setUserFormData] = useState({ full_name: "", email: "" });
  const [loadingAdminAction, setLoadingAdminAction] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('analytics');
  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'users', label: 'Users' },
    { id: 'draws', label: 'Draws' },
    { id: 'charities', label: 'Charities' },
    { id: 'winners', label: 'Winners' },
  ];

  const fetchWinnerRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/winners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllWinners(res.data);
      setWinnerRequests(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load winner requests");
    }
  };

  const fetchDrawHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/draw/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrawHistory(res.data);
    } catch (error) {
      toast.error("Failed to load draw history");
    }
  };

  const handleSimulateDraw = async () => {
    try {
      setLoadingDraw(true);
      const token = localStorage.getItem("token");
      const res = await api.post("/admin/draws/run", {
        simulate: true,
        algorithmType: drawAlgorithm,
        forceNumbers: null
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrawSimResult(res.data);
      toast.success("Simulation report generated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Simulation failed");
    } finally {
      setLoadingDraw(false);
    }
  };

  const handlePublishDraw = async () => {
    try {
      setLoadingDraw(true);
      const token = localStorage.getItem("token");
      await api.post("/admin/draws/run", {
        simulate: false,
        algorithmType: drawAlgorithm,
        forceNumbers: null
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Official draw published globally!");
      setDrawSimResult(null);
      fetchDrawHistory();
      fetchWinnerRequests();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Publish failed");
    } finally {
      setLoadingDraw(false);
    }
  };

  const handleVerify = async (winnerId, status) => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/admin/winners/verify", { winnerId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Winner ${status}`);
      fetchWinnerRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
  };

  const handleMarkPaid = async (winnerId) => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/admin/winners/pay", { winnerId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Marked as paid");
      fetchWinnerRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark as paid");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    }
  };

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (error) {
        console.error("Failed to refresh session profile");
      }
    };

    fetchCurrentProfile();
    fetchWinnerRequests();
    fetchUsers();
    fetchDrawHistory();
    fetchAnalytics();
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await api.get("/charity");
      setCharities(res.data);
    } catch (error) {
      toast.error("Failed to load charities");
    }
  };

  const openCharityModal = (charity = null) => {
    if (charity) {
      setCharityFormData({ id: charity.id, name: charity.name, description: charity.description, featured: charity.featured, image: null });
    } else {
      setCharityFormData({ id: null, name: '', description: '', featured: false, image: null });
    }
    setShowCharityModal(true);
  };

  const handleCharitySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingCharity(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", charityFormData.name);
      formData.append("description", charityFormData.description);
      formData.append("featured", charityFormData.featured);
      if (charityFormData.image instanceof File) {
        formData.append("image", charityFormData.image);
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };
      if (charityFormData.id) {
        await api.put(`/charity/${charityFormData.id}`, formData, { headers });
        toast.success("Charity updated");
      } else {
        await api.post(`/charity`, formData, { headers });
        toast.success("Charity added");
      }
      setShowCharityModal(false);
      fetchCharities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save charity");
    } finally {
      setLoadingCharity(false);
    }
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this charity?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/charity/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Charity deleted");
      fetchCharities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete charity");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/admin/users/role", { userId, role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Role updated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setUserFormData({ full_name: user.full_name, email: user.email });
    setShowUserModal(true);
  };

  const handleUpdateUserProfile = async (e) => {
    e.preventDefault();
    try {
      setLoadingAdminAction(true);
      const token = localStorage.getItem("token");
      await api.put(`/admin/users/${selectedUser.id}/profile`, userFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile updated");
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoadingAdminAction(false);
    }
  };

  const handleToggleSubscription = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const token = localStorage.getItem("token");
      await api.put(`/admin/users/${userId}/subscription`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Subscription ${newStatus}`);
      fetchUsers();
      fetchAnalytics();
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const openScoresModal = async (user) => {
    setSelectedUser(user);
    setShowScoresModal(true);
    fetchUserScores(user.id);
  };

  const fetchUserScores = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/admin/users/${userId}/scores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserScores(res.data);
    } catch (error) {
      toast.error("Failed to fetch user scores");
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm("Permanently delete this score?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/scores/${scoreId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Score deleted");
      fetchUserScores(selectedUser.id);
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const handleUpdateScore = async (scoreId, newScore) => {
    try {
      const scoreObj = userScores.find(s => s.id === scoreId);
      const token = localStorage.getItem("token");
      await api.put(`/admin/scores/${scoreId}`, {
        score: Number(newScore),
        played_at: scoreObj.played_at
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Score updated");
      fetchUserScores(selectedUser.id);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen font-sans relative z-10 space-y-6 mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
          Admin <span className="neon-text-gradient">Dashboard</span>
        </h1>

        {/* Horizontal Tab Bar */}
        <div className="flex p-1 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                    ? "text-emerald-400"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'analytics' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl group">
              <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Platform Analytics</h2>
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-blue-500/50 hover:-translate-y-1 transition-transform cursor-default">
                    <p className="text-blue-400/80 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">Total Revenue</p>
                    <p className="font-black text-2xl md:text-3xl text-white flex items-baseline gap-1">
                      <span className="text-sm md:text-lg text-blue-400">₹</span>{stats.totalRevenue?.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-emerald-500/50 hover:-translate-y-1 transition-transform cursor-default">
                    <p className="text-emerald-400/80 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">Total Donated</p>
                    <p className="font-black text-2xl md:text-3xl text-white flex items-baseline gap-1">
                      <span className="text-sm md:text-lg text-emerald-400">₹</span>{stats.totalCharityContribution?.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-cyan-500/50 hover:-translate-y-1 transition-transform cursor-default">
                    <p className="text-cyan-400/80 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">Total Paid Winnings</p>
                    <p className="font-black text-2xl md:text-3xl text-white flex items-baseline gap-1">
                      <span className="text-sm md:text-lg text-cyan-400">₹</span>{stats.totalPrizePool?.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-slate-500/50 hover:-translate-y-1 transition-transform cursor-default">
                    <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">Active Users</p>
                    <p className="font-black text-2xl md:text-3xl text-white flex items-baseline gap-1">
                      <span className="text-emerald-400">{stats.activeUsers}</span>
                      <span className="text-slate-600 text-xl font-medium mx-1">/</span>
                      <span className="text-slate-500 text-xl md:text-2xl">{stats.totalUsers}</span>
                    </p>
                  </div>
                  <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-yellow-500/50 hover:-translate-y-1 transition-transform cursor-default bg-yellow-500/5">
                    <p className="text-yellow-500/80 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">Current Rollover Ledger</p>
                    <p className="font-black text-2xl md:text-3xl text-white flex items-baseline gap-1">
                      <span className="text-sm md:text-lg text-yellow-500">₹</span>{stats.currentRollover?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Section 11: Draw Insights & Participation Board */}
              <div className="mt-12 space-y-6">
                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  Draw Participation Insights
                </h3>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800 rounded-3xl p-8 shadow-inner">
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Historical Success Trend</p>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-lg font-black tracking-[0.1em]">Verified Draws Only</span>
                    </div>

                    <div className="space-y-6">
                      {drawHistory.slice(0, 3).length > 0 ? drawHistory.slice(0, 3).map((draw, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs font-black text-white uppercase tracking-tight">{draw.draw_month} {draw.draw_year}</span>
                            <span className="text-xs font-bold text-emerald-400">Impact Verified</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${80 - (idx * 20)}%` }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            />
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest italic text-center py-4">Awaiting statistical history...</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-inner group-hover:border-emerald-500/20 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2">{stats ? ((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(1) : "0"}%</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Retention Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'draws' && (
            <div className="space-y-10">
              <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Run Monthly Draw</h2>
                    <p className="text-sm text-slate-400 font-medium">Run simulations or execute the official monthly draw.</p>
                  </div>
                  <div className="mt-6 sm:mt-0 flex flex-wrap gap-4 items-center">
                    <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-700/50 mr-2 shadow-inner">
                      <button
                        onClick={() => setDrawAlgorithm('random')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${drawAlgorithm === 'random' ? 'bg-slate-700 text-white shadow-md border border-slate-600' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Random
                      </button>
                      <button
                        onClick={() => setDrawAlgorithm('algorithmic')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${drawAlgorithm === 'algorithmic' ? 'bg-slate-700 text-white shadow-md border border-slate-600' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Algorithmic
                      </button>
                    </div>
                    <button
                      onClick={handleSimulateDraw}
                      disabled={loadingDraw}
                      className="bg-slate-800 border border-slate-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loadingDraw && !drawSimResult ? "Compiling..." : "Run Simulation"}
                    </button>
                    {drawSimResult && (
                      <button
                        onClick={handlePublishDraw}
                        disabled={loadingDraw}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-8 py-3 rounded-xl font-black tracking-wide hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Publish Officially
                      </button>
                    )}
                  </div>
                </div>

                {drawSimResult && (
                  <div className="bg-slate-900/60 rounded-2xl border border-emerald-500/30 p-6 sm:p-8 mt-8 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)] relative z-10 animate-fade-in-up">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                      Simulation Results
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                      <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-700/50 shadow-inner col-span-1 sm:col-span-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Winning Numbers</p>
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                          {drawSimResult.drawNumbers.map((num, i) => (
                            <span key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-300/30">{num}</span>
                          ))}
                        </div>
                      </div>
                      <div className="glass-panel p-6 rounded-2xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Prize Pool</p>
                        <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-2xl sm:text-3xl mb-2">₹{(Number(drawSimResult.prizePool?.totalPool) || 0).toFixed(2)}</p>
                        {drawSimResult.prizePool.rolloverApplied > 0 && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md font-bold shadow-sm">Includes ₹{(Number(drawSimResult.prizePool?.rolloverApplied) || 0).toFixed(2)} Rollover</span>}
                      </div>
                      <div className="glass-panel p-6 rounded-2xl border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rollover Amount</p>
                        <p className="font-black text-yellow-400 text-2xl sm:text-3xl">₹{(Number(drawSimResult.unspentRollover) || 0).toFixed(2)}</p>
                        <p className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-wider mt-2">Added to next month's pool</p>
                      </div>
                    </div>

                    <div className="glass-card grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl border border-slate-700">
                      <div className="text-center">
                        <h4 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{drawSimResult.summary.winners5}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Jackpot Hits</p>
                      </div>
                      <div className="hidden sm:block w-px h-full bg-slate-700 mx-auto"></div>
                      <div className="text-center">
                        <h4 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{drawSimResult.summary.winners4}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tier 2 Matches</p>
                      </div>
                      <div className="hidden sm:block w-px h-full bg-slate-700 mx-auto"></div>
                      <div className="text-center">
                        <h4 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{drawSimResult.summary.winners3}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tier 3 Matches</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-card p-6 sm:p-8 rounded-3xl">
                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Draw History</h2>
                {drawHistory.length === 0 ? (
                  <p className="text-slate-500 bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-center font-medium">Ledger is completely empty.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {drawHistory.map((draw) => (
                      <div key={draw.id} className="border border-slate-700/50 bg-slate-900/40 p-5 sm:p-6 rounded-2xl hover:bg-slate-800/60 hover:border-slate-600 transition-colors group">
                        <div className="flex justify-between items-center border-b border-slate-700/50 pb-4 mb-4">
                          <h3 className="font-extrabold text-white text-base sm:text-lg">{draw.draw_month} {draw.draw_year}</h3>
                          <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-sm ${draw.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>{draw.status}</span>
                        </div>
                        <div className="mb-6">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Winning Numbers</p>
                          <div className="flex flex-wrap gap-2">
                            {draw.winning_numbers?.map((num, i) => (
                              <span key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 text-slate-300 border border-slate-600 flex items-center justify-center font-black text-xs sm:text-sm shadow-inner group-hover:border-emerald-500/30 transition-colors">{num}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 shadow-inner flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prize Pool</span>
                          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-lg sm:text-xl">₹{draw.prize_pools?.[0]?.total_pool || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'charities' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">Charity Management</h2>
                <button onClick={() => openCharityModal()} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-all w-full sm:w-auto">
                  + Add Organization
                </button>
              </div>
              {charities.length === 0 ? (
                <p className="text-slate-500 bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-center font-medium shadow-inner">No charities registered on the platform.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {charities.map((charity) => (
                    <div key={charity.id} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl flex flex-col group overflow-hidden hover:bg-slate-800/60 transition-colors shadow-sm">
                      <div className="h-40 bg-slate-950 relative border-b border-slate-800">
                        {charity.image_url ? (
                          <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest bg-slate-900/50">No Cover Image</div>
                        )}
                        {charity.featured && (
                          <span className="absolute top-3 right-3 bg-cyan-500/90 text-slate-950 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm">Featured</span>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-extrabold text-white text-lg mb-2 leading-tight">{charity.name}</h3>
                        <p className="text-sm text-slate-400 font-medium line-clamp-3 mb-6 flex-1">{charity.description}</p>
                        <div className="flex gap-3 mt-auto">
                          <button onClick={() => openCharityModal(charity)} className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-all shadow-sm">Edit</button>
                          <button onClick={() => handleDeleteCharity(charity.id)} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">User Management</h2>
              {users.length === 0 ? (
                <p className="text-slate-500 bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-center font-medium">No users found.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <div key={user.id} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600 transition-all flex flex-col group">
                      <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white text-lg truncate">{user.full_name}</h3>
                            {user.role === 'superadmin' && <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">Super Admin</span>}
                            {user.role === 'admin' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded">Admin</span>}
                          </div>
                          <p className="text-xs font-medium text-slate-400">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (user.role === 'user' || currentUser?.role === 'superadmin') {
                              handleToggleSubscription(user.id, user.subscription_status);
                            } else {
                              toast.error("You don't have authority to modify staff accounts.");
                            }
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase transition-all ${user.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'}`}
                        >
                          {user.subscription_status || 'Inactive'}
                        </button>
                      </div>
                      <div className="space-y-3 mb-6 flex-1">
                        <p className="text-sm text-slate-300 flex justify-between items-center">
                          <strong className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Access Level</strong>
                          <span className={`px-3 py-1 rounded-lg border uppercase tracking-widest text-[10px] font-bold ${user.role === 'superadmin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : user.role === 'admin' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-950 border-slate-800 text-white'}`}>
                            {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Administrator' : 'Subscriber'}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          {(user.role === 'user' || currentUser?.role === 'superadmin') ? (
                            <>
                              <button onClick={() => openUserModal(user)} className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 bg-cyan-500/5 px-2 py-1 rounded-md border border-cyan-500/10">Edit Profile</button>
                              <button onClick={() => openScoresModal(user)} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">Manage Scores</button>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-600 uppercase italic">Admin Restricted</span>
                          )}
                        </div>
                      </div>
                      {currentUser?.role === 'superadmin' && user.id !== currentUser.id && (
                        <div className="flex gap-3 justify-end mt-auto pt-4 border-t border-slate-800/50">
                          <button onClick={() => handleRoleChange(user.id, "admin")} disabled={user.role === 'admin'} className="flex-1 bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-700 disabled:opacity-30 transition-all shadow-sm">GRANT ADMIN</button>
                          <button onClick={() => handleRoleChange(user.id, "user")} disabled={user.role === 'user'} className="flex-1 bg-gradient-to-r from-red-500/10 to-red-500/20 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-500 hover:text-white disabled:opacity-30 transition-all shadow-inner">REVOKE ADMIN</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'winners' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Winner Verification</h2>
              <div className="flex flex-wrap gap-3 mb-8 bg-slate-950/50 p-2 rounded-2xl border border-slate-800/50 inline-flex shadow-inner">
                {[
                  { label: "All", filter: allWinners },
                  { label: "Pending", filter: allWinners.filter(w => w.verification_status === "pending") },
                  { label: "Approved", filter: allWinners.filter(w => w.verification_status === "approved") },
                  { label: "Rejected", filter: allWinners.filter(w => w.verification_status === "rejected") }
                ].map((tab, idx) => (
                  <button key={idx} onClick={() => setWinnerRequests(tab.filter)} className="bg-slate-900 uppercase tracking-widest text-[11px] font-black px-5 py-2.5 rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-slate-400 hover:text-white border border-slate-700/50 focus:bg-slate-800 focus:text-white transition-all">
                    {tab.label}
                  </button>
                ))}
              </div>
              {winnerRequests.length === 0 ? (
                <p className="text-slate-500 bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-center font-medium">No winner requests found.</p>
              ) : (
                <div className="space-y-6">
                  {winnerRequests.map((winner) => (
                    <div key={winner.id} className={`border rounded-2xl p-6 transition-all shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 ${winner.verification_status === "pending" ? "bg-yellow-500/5 border-yellow-500/20" : winner.verification_status === "approved" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="font-extrabold text-xl text-white">{winner.users?.full_name}</h3>
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase shadow-sm">{winner.match_type} Match</span>
                        </div>
                        <p className="text-sm font-medium text-slate-400 mb-6">{winner.users?.email} • Distributed: {winner.draws?.draw_month} {winner.draws?.draw_year}</p>
                        <div className="grid grid-cols-2 gap-5 max-w-md mb-5">
                          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Prize Amount</p>
                            <p className="font-black text-white text-xl">₹{winner.prize_amount?.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Verification Status</p>
                            <p className={`font-black tracking-widest uppercase text-sm ${winner.verification_status === 'approved' ? 'text-emerald-400' : winner.verification_status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{winner.verification_status}</p>
                          </div>
                        </div>
                        {winner.proof_url ? (
                          <a href={winner.proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            Examine Transfer Document
                          </a>
                        ) : (
                          <p className="text-sm font-bold text-red-400/80 flex items-center gap-2 bg-red-500/5 rounded-lg px-4 py-2 border border-red-500/10 inline-flex">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Awaiting Proof Document Upload
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 min-w-[160px] bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <button onClick={() => handleVerify(winner.id, "approved")} disabled={winner.verification_status !== "pending"} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Approve</button>
                        <button onClick={() => handleVerify(winner.id, "rejected")} disabled={winner.verification_status !== "pending"} className="bg-red-600/20 text-red-400 border border-red-500/30 font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">Reject</button>
                        <button onClick={() => handleMarkPaid(winner.id)} disabled={winner.verification_status !== "approved"} className="bg-slate-800 text-white font-bold py-3 rounded-xl text-xs hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider mt-2 transition-all">{winner.payment_status === "paid" ? "Paid" : "Mark as Paid"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Charity Management Modal Popup */}
      {showCharityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center relative z-10">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                {charityFormData.id ? "Edit Organization" : "Register Organization"}
              </h3>
              <button type="button" onClick={() => setShowCharityModal(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleCharitySubmit} className="p-6 space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Charity Name</label>
                <input type="text" required value={charityFormData.name} onChange={(e) => setCharityFormData({ ...charityFormData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-bold shadow-inner placeholder-slate-700" placeholder="e.g. Cancer Awareness Foundation" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea required rows={4} value={charityFormData.description} onChange={(e) => setCharityFormData({ ...charityFormData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-medium resize-none shadow-inner placeholder-slate-700" placeholder="Provide a summary of their mission..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Logo (Optional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <p className="text-sm font-bold text-slate-400">Click to upload <span className="font-normal text-slate-500">or drag and drop</span></p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{charityFormData.image ? charityFormData.image.name : "PNG, JPG up to 5MB"}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setCharityFormData({ ...charityFormData, image: e.target.files[0] })} />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl mt-2">
                <div>
                  <label htmlFor="featuredCheck" className="text-sm font-bold text-white block">Featured Charity</label>
                  <p className="text-xs text-slate-500 font-medium">Mark as a featured charity on the site.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="featuredCheck" className="sr-only peer" checked={charityFormData.featured} onChange={(e) => setCharityFormData({ ...charityFormData, featured: e.target.checked })} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
              <div className="pt-4 flex gap-4 mt-8">
                <button type="button" onClick={() => setShowCharityModal(false)} className="flex-1 bg-slate-800 border border-slate-700 text-white font-bold py-3.5 rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-wider text-sm">Cancel</button>
                <button type="submit" disabled={loadingCharity} className="flex-[2] bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all uppercase tracking-wider text-sm">
                  {loadingCharity ? "Saving..." : "Save Charity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deep User Management Modals */}
      <EditUserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        formData={userFormData}
        setFormData={setUserFormData}
        onSubmit={handleUpdateUserProfile}
        loading={loadingAdminAction}
      />
      <ManageScoresModal
        isOpen={showScoresModal}
        onClose={() => setShowScoresModal(false)}
        user={selectedUser}
        scores={userScores}
        onDelete={handleDeleteScore}
        onUpdate={handleUpdateScore}
        onRefresh={() => fetchUserScores(selectedUser.id)}
      />
    </div>
  );
}

function EditUserModal({ isOpen, onClose, formData, setFormData, onSubmit, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-white">Edit User Profile</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
            <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-wider text-sm disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ManageScoresModal({ isOpen, onClose, user, scores, onDelete, onUpdate, onRefresh }) {
  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newScore || isNaN(newScore) || Number(newScore) < 1 || Number(newScore) > 45) {
      return toast.error("Score must be between 1 and 45");
    }
    try {
      setAdding(true);
      const token = localStorage.getItem("token");
      await api.post(`/admin/users/${user.id}/scores`, {
        score: Number(newScore),
        played_at: newDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Manual score recorded");
      setNewScore("");
      onRefresh(); // refresh parent stats
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record score");
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white">Score Ledger: {user?.full_name}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Audit and correct user benchmarks</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Section 10: Manual Score Entry Form */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl mb-6">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Manual Entry (Verification Required)</h4>
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                placeholder="Score (1-45)"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-inner"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-inner"
              />
              <button
                type="submit"
                disabled={adding}
                className="bg-emerald-500 text-slate-950 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50"
              >
                {adding ? "Saving..." : "Record"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {scores.length === 0 ? (
              <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-sm">No benchmark data available.</p>
            ) : (
              scores.map((s) => (
                <div key={s.id} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-6 group hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 font-black text-xl text-emerald-300 group-hover:scale-110 transition-transform">
                      {s.score}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Played on {new Date(s.played_at).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">Sequence ID: {s.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const val = prompt("Enter new score (1-45):", s.score);
                        if (val && !isNaN(val)) onUpdate(s.id, val);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
                    >
                      Edit
                    </button>
                    <button onClick={() => onDelete(s.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500/80 bg-red-500/5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-red-600 transition-all border border-red-500/10">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;