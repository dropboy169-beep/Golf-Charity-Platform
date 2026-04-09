import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  
  const token = localStorage.getItem("token");
  let user = {};
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error parsing user data");
  }

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = document.querySelectorAll("section[id]");
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      rootMargin: "-100px 0px -40% 0px"
    });

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path.includes("#")) {
      const [p, h] = path.split("#");
      const normalizedPath = p === "" ? "/" : p;
      if (location.pathname === normalizedPath) {
        if (activeSection) {
          return activeSection === h;
        }
        return location.hash === "#" + h;
      }
      return false;
    }
    return location.pathname === path && !location.hash;
  };

  const activeStyles = "text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]";
  const inactiveStyles = "text-slate-200 hover:text-white transition-colors hover:glow";

  const publicLinks = token 
    ? [
        { to: "/#home", label: "Home" },
        { to: "/charities", label: "Charities" }
      ]
    : [
        { to: "/#home", label: "Home" },
        { to: "/#ecosystem", label: "Ecosystem" },
        { to: "/#impact", label: "Impact" },
        { to: "/#prizes", label: "Prizes" },
        { to: "/#faq", label: "FAQ" },
        { to: "/charities", label: "Charities" }
      ];

  const authLinks = token ? [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/winnings", label: "Winnings" },
  ] : [];

  const allLinks = [...publicLinks, ...authLinks];

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-800/60 bg-slate-950 sticky top-0 z-[100] shadow-2xl backdrop-blur-md w-full">
        <Link to="/#home" className="text-xl font-extrabold tracking-tight text-white group flex items-center gap-2 relative z-[200]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center text-white transition-transform group-hover:scale-110">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <span className="hidden sm:inline">Golf Charity <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all">Platform</span></span>
          <span className="sm:hidden text-emerald-400 font-black">GCP</span>
        </Link>

        {/* Desktop Nav Links (Centered) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-8 text-sm items-center font-bold tracking-wider uppercase">
          {allLinks.map((link) => (
            <Link key={link.to} to={link.to} className={isActive(link.to) ? activeStyles : inactiveStyles}>{link.label}</Link>
          ))}
        </div>

        {/* Desktop Auth/Profile Buttons (Right Corner) */}
        <div className="hidden lg:flex items-center">
          {token ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">Hi, <strong className="text-white">{user?.full_name?.split(' ')[0]}</strong></span>
              
              {isAdmin && (
                <Link to="/admin" className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                  Admin Console
                </Link>
              )}
              
              {user?.subscription_status !== "active" && (
                <Link to="/subscribe" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all text-xs font-black uppercase tracking-wider">
                  Subscribe
                </Link>
              )}
              
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors text-xs uppercase font-bold tracking-wider hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)] border-l border-slate-800 pl-4 ml-2">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-inner">
                Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-5 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all font-black text-xs uppercase tracking-widest">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden relative z-[500] p-2 text-slate-200 hover:text-emerald-400 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay - Sibling Isolation Fix */}
      <AnimatePresence>
        {isOpen && (
          <div 
            style={{ 
              position: 'fixed',
              inset: 0,
              backgroundColor: "#020617", 
              opacity: 1, 
              zIndex: 999, // Way above everything
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Dedicated Close Button for Overlay */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-[1000]"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center justify-center w-full h-full pb-10 px-8 relative gap-16">
              <div className="flex flex-col items-center gap-10 w-full">
                {allLinks.map((link, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 + 0.1 }}
                    key={link.to}
                    className="w-full text-center"
                  >
                    <Link 
                      to={link.to} 
                      className={`text-4xl font-black tracking-tight block py-1 ${isActive(link.to) ? 'text-emerald-400' : 'text-white'}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: allLinks.length * 0.04 + 0.1 }}
                    className="w-full text-center mt-4"
                  >
                    <Link 
                      to="/admin" 
                      className="inline-block px-10 py-4 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 text-emerald-400 text-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.1)] active:scale-95 transition-all"
                    >
                      Admin Console
                    </Link>
                  </motion.div>
                )}
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full flex flex-col gap-5 max-w-[340px] px-4"
              >
                {token ? (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] text-center shadow-inner">
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mb-1">Authenticated</p>
                      <p className="text-white font-black text-xl truncate">{user?.full_name}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-red-400 font-black text-xl tracking-tighter border-2 border-red-500/20 py-5 rounded-2xl bg-red-500/5 shadow-lg active:scale-95 transition-all"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    <Link to="/login" className="bg-white text-slate-950 py-5 rounded-2xl font-black text-xl text-center shadow-2xl active:scale-95 transition-all uppercase tracking-widest">Login Account</Link>
                    <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 py-5 rounded-2xl font-black text-xl text-center shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all uppercase tracking-widest">Register Now</Link>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;