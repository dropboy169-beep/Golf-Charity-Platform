import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsSubscribed(userData.subscription_status === "active");
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);

  return (
    <div className="min-h-screen font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-6 pt-32 pb-24 max-w-6xl mx-auto text-center flex flex-col items-center z-10 overflow-hidden">
        {/* Layered Background Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 blur-[120px] rounded-full -z-10"
        ></motion.div>
        
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full -z-10"
        ></motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.05 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          Welcome to the <br/><span className="neon-text-gradient italic">Golf Charity Platform</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.15 }}
          className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-semibold opacity-90"
        >
          Explore charities, understand how our draws work, and start a subscription to win.
        </motion.p>
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center"
        >
          {!isLoggedIn ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-10 py-4 rounded-xl font-black md:text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center justify-center"
                >
                  Join the Platform
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-10 py-4 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all font-bold md:text-lg shadow-inner flex items-center justify-center"
                >
                  Member Login
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              {!isSubscribed ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/subscribe"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-12 py-4 rounded-xl font-black md:text-lg shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Get Your Subscription
                  </Link>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto bg-slate-100 text-slate-950 px-12 py-4 rounded-xl font-black md:text-lg hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
                  >
                    Go to Dashboard
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black text-center mb-16 text-white tracking-tight"
        >
          How It Works
        </motion.h2>
        
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { step: '01', title: 'Enter Scores', desc: 'Enter your golf scores regularly to qualify for our rewards.' },
            { step: '02', title: 'Monthly Draws', desc: 'Active subscribers are automatically entered into our monthly prize draws.' },
            { step: '03', title: 'Win & Support', desc: 'Win cash prizes while a percentage of your subscription goes to your selected charity.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { y: 15, opacity: 0 },
                show: { y: 0, opacity: 1 }
              }}
              className="group glass-card-premium p-10 rounded-3xl relative overflow-hidden flex flex-col items-center text-center"
            >
              {/* Scanning Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
              
              <div className="w-20 h-20 rounded-2xl bg-slate-950/80 border border-slate-800 text-emerald-400 flex items-center justify-center font-black text-3xl mb-8 group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500 relative">
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {item.step}
              </div>
              <h3 className="text-2xl font-black mb-4 text-white tracking-tight">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. CHARITY IMPACT SECTION */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-32 px-6 relative overflow-hidden z-10 my-20"
      >
        <div className="absolute inset-0 bg-slate-950 border-y border-slate-800/50 backdrop-blur-sm -z-10"></div>
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] -z-10" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/20 rounded-full px-8 py-3 mb-12 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
             <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.9)]"></span>
             <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">Live Ecosystem Hub</span>
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight"
          >
            Platform <span className="neon-text-gradient">Concept</span>
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Every subscription contributes to a cause. You choose which charity to support and what percentage to give directly from your dashboard.
          </motion.p>
        </div>
      </motion.section>

      {/* 4. TRUST SECTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800"
        >
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="p-4 flex flex-col items-center gap-4 group">
             <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
             </div>
              <p className="font-bold text-slate-300 text-lg">Transparent Monthly Draws</p>
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="p-4 flex flex-col items-center gap-4 group">
             <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:text-emerald-300 transition-all duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
              <p className="font-bold text-slate-300 text-lg">Verified Winners List</p>
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="p-4 flex flex-col items-center gap-4 group">
             <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             </div>
              <p className="font-bold text-slate-300 text-lg">Secure Payment System</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. CTA SECTION */}
      <motion.section 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-28 px-6 text-center mt-12 relative z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-slate-950 -z-10"></div>
        <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight text-white leading-tight">
          {isSubscribed ? (
            user?.subscription_plan === "yearly" ? 
            <>Your legacy is secure. <br/> Review your yearly impact.</> : 
            <>Your journey continues <br/> here.</>
          ) : <>Start your subscription <br/> today.</>}
        </h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to={isSubscribed ? "/dashboard" : "/subscribe"}
            className={`inline-block px-12 py-5 rounded-2xl font-black text-lg md:text-xl transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] ${
              isSubscribed && user?.subscription_plan === "yearly" ? 
              "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950" : 
              "bg-white text-slate-950"
            }`}
          >
            {isSubscribed ? (user?.subscription_plan === "yearly" ? "💎 PREMIUM DASHBOARD" : "View Your Impact") : "Subscribe Now"}
          </Link>
        </motion.div>
      </motion.section>

    </div>
  );
}

export default Home;