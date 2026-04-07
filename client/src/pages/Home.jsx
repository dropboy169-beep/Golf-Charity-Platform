import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen font-sans relative overflow-hidden bg-slate-950">
      {/* 0. GLOBAL PREMIUM OVERLAYS */}
      <div className="noise-overlay" />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative px-6 pt-32 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 z-10">
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">Premium Golf Ecosystem v2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.95] text-glow"
          >
            Play for a <br />
            <span className="neon-text-gradient italic">Higher Cause.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-xl mb-12 leading-relaxed font-medium"
          >
            The world's first luxury performance platform that rewards your golf skills while funding global charities.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start"
          >
            {!isLoggedIn ? (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  Join the Circle
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center"
                >
                  Member Access
                </Link>
              </>
            ) : (
              <Link
                to={isSubscribed ? "/dashboard" : "/subscribe"}
                className="bg-white text-slate-950 px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300"
              >
                {isSubscribed ? "Go to Dashboard" : "Get Activated"}
              </Link>
            )}
          </motion.div>

          {/* Mini Stats Ticker */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-wrap justify-center lg:justify-start gap-12 border-t border-white/5 pt-8"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">₹50L+</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awarded Pools</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">12k+</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Members</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">96%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Impact Rating</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 50, delay: 0.4 }}
          className="flex-1 relative group w-full max-w-[500px] lg:max-w-none"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-[100px] rounded-full group-hover:from-emerald-500/30 transition-all duration-1000" />
          <div className="relative glass-card-premium p-4 rounded-[2.5rem] rotate-[-2deg] group-hover:rotate-0 transition-transform duration-700">
             <img 
               src="/assets/hero_golf_luxury.png" 
               alt="Luxury Golf" 
               className="w-full h-auto rounded-[2rem] shadow-2xl brightness-90 group-hover:brightness-100 transition-all duration-700" 
             />
             <div className="absolute bottom-10 left-10 right-10 glass-panel p-6 rounded-2xl border-white/20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-white font-black text-sm uppercase tracking-widest mb-1 italic">Pro Precision</p>
                <p className="text-slate-400 text-xs font-medium">Your scorecard is your entry ticket to the elite draw.</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS (REFINED) */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
          >
            A Simple Path to <br />
            <span className="neon-text-gradient italic">Greatness.</span>
          </motion.h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { 
              step: '01', 
              title: 'Record History', 
              desc: 'Submit your regular golf scores via your dashboard.',
              icon: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            },
            { 
              step: '02', 
              title: 'Automatic Entry', 
              desc: 'Every active subscriber is automatically entered into the monthly prize pool.',
              icon: <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            },
            { 
              step: '03', 
              title: 'Global Impact', 
              desc: 'Claim your winnings and watch your impact grow for your chosen charity.',
              icon: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-card-premium p-10 rounded-[2.5rem] flex flex-col items-center text-center hover:-translate-y-2"
            >
              <div className="w-20 h-20 rounded-3xl bg-slate-950/80 border border-white/5 text-emerald-400 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  {item.icon}
                </svg>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Phase {item.step}</span>
              <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. CTA SECTION (REFINED) */}
      <section className="py-40 px-6 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto glass-panel p-12 md:p-20 rounded-[4rem] text-center relative overflow-hidden border-white/10"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-white/[0.02] blur-[100px] pointer-events-none" />
          <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tight leading-tight relative z-10">
            Secure Your <br />
            <span className="neon-text-gradient italic">Legacy.</span>
          </h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/subscribe"
              className="inline-block bg-white text-slate-950 px-16 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-300 relative z-10"
            >
              Start Subscription
            </Link>
          </motion.div>
          <div className="mt-12 flex items-center justify-center gap-12 opacity-30 grayscale relative z-10">
             {/* Simple placeholders for trusted logos */}
             <div className="text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-lg">Stripe Verified</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-lg">Cloudinary Secure</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-lg">ISO 9001</div>
          </div>
        </motion.div>
      </section>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}

export default Home;