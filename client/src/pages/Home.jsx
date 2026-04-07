import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 12, mins: 30, secs: 59 });
  const [faqIndex, setFaqIndex] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, mins, secs } = prev;
        if (secs > 0) secs--;
        else {
          secs = 59;
          if (mins > 0) mins--;
          else {
            mins = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="font-sans relative bg-slate-950">
      {/* 0. GLOBAL PREMIUM OVERLAYS */}
      <div className="noise-overlay" />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section id="home" className="relative px-6 pt-16 pb-20 scroll-mt-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 z-10">
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">Premium Golf Ecosystem</span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="text-5xl sm:text-6xl lg:text-[3.5rem] xl:text-[4.2rem] font-black tracking-tighter text-white mb-4 leading-[0.95] text-glow"
          >
            Play for a <br />
            <span className="neon-text-gradient italic">Higher Cause.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 max-w-lg mb-6 mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            The world's first luxury performance platform that rewards your golf skills while funding global charities.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            {!isLoggedIn ? (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  Join the Circle
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center"
                >
                  Member Access
                </Link>
              </>
            ) : (
              <Link
                to={isSubscribed ? "/dashboard" : "/subscribe"}
                className="bg-white text-slate-950 px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300"
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
            className="mt-10 flex flex-wrap justify-center lg:justify-start gap-10 border-t border-white/5 pt-6"
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
          className="flex-1 relative group w-full max-w-[380px] lg:max-w-[440px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-[100px] rounded-full group-hover:from-emerald-500/30 transition-all duration-1000" />
          <div className="relative glass-card-premium p-4 rounded-[2.5rem] rotate-[-2deg] group-hover:rotate-0 transition-transform duration-700">
             <img 
               src="/assets/hero_golf_luxury.png" 
               alt="Luxury Golf" 
               className="w-full h-auto rounded-[2rem] shadow-2xl brightness-90 group-hover:brightness-100 transition-all duration-700" 
             />
             <div className="absolute bottom-10 left-10 right-10 glass-panel p-6 rounded-2xl border-white/20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                 <p className="text-white font-black text-sm uppercase tracking-widest mb-1 italic">Play With Purpose</p>
                 <p className="text-slate-400 text-xs font-medium">Your precision on the green becomes a gift for the world.</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* LIVE COUNTDOWN TIMER */}
      <section className="relative z-20 mt-32 mb-20 px-6 max-w-5xl mx-auto">
        <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-950/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-emerald-400 h-full shadow-[0_0_20px_rgba(52,211,153,1)]"></div>
          <div>
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Pool
            </p>
            <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">Mega Draw Countdown</h3>
          </div>
          
          <div className="flex items-center gap-4 text-center">
            <div className="flex flex-col">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-black text-white shadow-inner">{String(timeLeft.days).padStart(2, '0')}</div>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Days</span>
            </div>
            <span className="text-2xl font-black text-slate-700 pb-5">:</span>
            <div className="flex flex-col">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-black text-white shadow-inner">{String(timeLeft.hours).padStart(2, '0')}</div>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Hours</span>
            </div>
            <span className="text-2xl font-black text-slate-700 pb-5">:</span>
            <div className="flex flex-col">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-black text-white shadow-inner">{String(timeLeft.mins).padStart(2, '0')}</div>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Mins</span>
            </div>
            <span className="text-2xl font-black text-slate-700 pb-5 hidden sm:block">:</span>
            <div className="flex flex-col hidden sm:flex">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-black text-emerald-400 shadow-inner">{String(timeLeft.secs).padStart(2, '0')}</div>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE ECOSYSTEM (WHY GOLF?) */}
      <section id="ecosystem" className="pt-16 pb-16 px-6 scroll-mt-24 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight"
          >
            The Exclusive Golf <br />
            <span className="neon-text-gradient italic">Ecosystem.</span>
          </motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-base font-medium tracking-wide">
            Why do we track golf scores? Because this isn't a simple lottery. Your weekend scorecard is your verified entry ticket into our elite monthly prize pool.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              step: '01', 
              title: 'Your Entry Ticket', 
              desc: 'Hit the links and seamlessly log your 18-hole scorecard. Active golfers unlock access to the draw.',
              icon: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            },
            { 
              step: '02', 
              title: 'The Algo-Draw', 
              desc: 'At the end of every month, our secure cryptographic algorithm selects 5 numbers. Match them to win.',
              icon: <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            },
            { 
              step: '03', 
              title: 'Win & Donate', 
              desc: 'If you hit the jackpot, you claim massive winnings, and your designated charity receives direct funding.',
              icon: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-card-premium p-8 rounded-[2rem] flex flex-col items-center text-center hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-white/5 text-emerald-400 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  {item.icon}
                </svg>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2">Phase {item.step}</span>
              <h3 className="text-xl font-black mb-2 text-white uppercase tracking-tight">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium text-[13px]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CHARITABLE IMPACT SECTION */}
      <section id="impact" className="pt-24 pb-24 px-6 scroll-mt-24 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-left">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight"
            >
              Transparent <br />
              <span className="text-emerald-400">Charitable Impact</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg mb-6 leading-relaxed font-medium"
            >
              When you subscribe, you aren't just playing for yourself. You select exactly which verified charity receives your dedicated contribution.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg mb-10 leading-relaxed font-medium"
            >
              Watch the global impact meters fill up in real time as our community drives thousands of rupees directly to front-line causes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/charities" className="inline-block px-8 py-3 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                Join the Mission
              </Link>
            </motion.div>
          </div>

          <div className="flex-1 w-full max-w-xl flex flex-col gap-5">
            {/* Charity Bar 1 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#0b0e17] border border-slate-800/60 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-bold text-sm">Cancer Awareness Foundation</span>
                <span className="text-blue-400 font-black text-sm">₹34,200</span>
              </div>
              <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[70%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
            </motion.div>

            {/* Charity Bar 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#0b0e17] border border-slate-800/60 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-bold text-sm">Hope Foundation</span>
                <span className="text-purple-400 font-black text-sm">₹28,500</span>
              </div>
              <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[55%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              </div>
            </motion.div>

            {/* Charity Bar 3 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#0b0e17] border border-slate-800/60 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-bold text-sm">Care & Smile</span>
                <span className="text-emerald-400 font-black text-sm">₹21,800</span>
              </div>
              <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[40%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RECENT WINNERS SHOWCASE */}
      <section className="py-20 bg-slate-900/40 border-y border-white/5 relative z-10 overflow-hidden shadow-inner">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Recent <span className="neon-text-gradient">Winners</span></h2>
            <p className="text-slate-400 font-medium mt-2">Real players. Real impact. Real cash.</p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg bg-emerald-500/10">
            Live Leaderboard
          </div>
        </div>
        
        <div className="flex gap-6 px-6 overflow-x-auto pb-8 snap-x hide-scrollbar flex-nowrap" style={{ scrollbarWidth: 'none' }}>
          {[
            { name: "Michael T.", prize: "₹45,000", charity: "Hope Foundation", match: "4 Numbers" },
            { name: "Sarah L.", prize: "₹32,500", charity: "Care & Smile", match: "4 Numbers" },
            { name: "David K.", prize: "₹18,200", charity: "Cancer Awareness", match: "3 Numbers" },
            { name: "Aisha R.", prize: "₹18,200", charity: "Hope Foundation", match: "3 Numbers" },
            { name: "James M.", prize: "₹18,200", charity: "Care & Smile", match: "3 Numbers" }
          ].map((winner, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[280px] sm:min-w-[320px] snap-center glass-card-premium p-6 rounded-3xl border-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-lg shrink-0 group hover:-translate-y-2 cursor-default"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-white font-black text-xl mb-2">{winner.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-md">{winner.match}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 text-slate-500 font-black text-lg group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                  {winner.name.charAt(0)}
                </div>
              </div>
              <p className="text-4xl font-black text-white mb-6 tracking-tighter">{winner.prize}</p>
              <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Supported:</span>
                <span className="text-xs font-bold text-slate-300 bg-slate-800/50 px-2 py-1 rounded-md">{winner.charity}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* PRIZE POOL TIERS SECTION */}
      <section id="prizes" className="pt-16 pb-24 px-6 scroll-mt-24 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight relative inline-block">
            Prize Pool <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Tiers</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium tracking-wide">
            The total prize pool is divided fairly based on how many numbers you match.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          {/* Card 1: 5-Match */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-[2rem] border border-yellow-500/20 hover:border-yellow-500/40 transition-colors shadow-[inset_0_0_40px_rgba(234,179,8,0.05)]"
          >
            <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 drop-shadow-sm">40%</h3>
            <p className="text-white font-bold text-lg mb-2">5-Number Match</p>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Jackpot (Rollover if no winner)</p>
          </motion.div>

          {/* Card 2: 4-Match */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-12 rounded-[2rem] border border-cyan-500/20 hover:border-cyan-500/40 transition-colors shadow-[inset_0_0_40px_rgba(6,182,212,0.05)]"
          >
            <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-6 drop-shadow-sm">35%</h3>
            <p className="text-white font-bold text-lg mb-2">4-Number Match</p>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Second Tier</p>
          </motion.div>

          {/* Card 3: 3-Match */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-12 rounded-[2rem] border border-purple-500/20 hover:border-purple-500/40 transition-colors shadow-[inset_0_0_40px_rgba(168,85,247,0.05)]"
          >
            <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600 mb-6 drop-shadow-sm">25%</h3>
            <p className="text-white font-bold text-lg mb-2">3-Number Match</p>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Third Tier</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="pt-16 pb-24 px-6 scroll-mt-12 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white tracking-tight mb-4">Frequently Asked <span className="text-emerald-400">Questions</span></h2>
          <p className="text-slate-400 font-medium">Everything you need to know about the platform.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {[
            {
              q: "How are the winning numbers selected?",
              a: "Everything is fully automated and transparent. At the end of every month, our secure cryptographic algorithm randomly selects 5 numbers. Match all 5 to win the massive Jackpot rollover."
            },
            {
              q: "Where does the charity money actually go?",
              a: "When you win the Jackpot or place in the 4-match tier, a percentage of your winnings is directly routed to the verified global charity of your choice (e.g. Hope Foundation, Cancer Awareness). You give back by winning."
            },
            {
              q: "Is am I locked into a contract?",
              a: "Absolutely not. Your subscription is strictly month-to-month and managed securely via Stripe. You can cancel with a single click in your dashboard at any time."
            },
            {
              q: "Why do I have to upload my golf scores?",
              a: "To keep our prize pools exclusive to active, passionate golfers, we require you to verify your participation by logging your weekend 18-hole scorecards. Active scorecards equal active entry."
            }
          ].map((faq, i) => (
            <div 
              key={i} 
              className={`glass-panel border overflow-hidden rounded-2xl transition-all duration-300 ${faqIndex === i ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-800/60 hover:border-slate-700'}`}
            >
              <button 
                onClick={() => setFaqIndex(faqIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-white font-bold text-lg">{faq.q}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${faqIndex === i ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 rotate-180' : 'border-slate-700 text-slate-500'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              <AnimatePresence>
                {faqIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-slate-400 font-medium leading-relaxed border-t border-slate-800/40 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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