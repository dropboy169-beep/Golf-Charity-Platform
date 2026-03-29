import { Link } from "react-router-dom";

function Footer() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!token;
  const isAdmin = user.role === "admin";

  // Public View: Horizontal, Centered, and Sleek
  if (!isLoggedIn) {
    return (
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-slate-950" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">Golf Charity <span className="text-emerald-400">Platform</span></span>
          </Link>
          
          <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed mb-8">
            The world's first premium golf performance charity platform. Compete in monthly draws, win big, and drive social impact.
          </p>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 border-y border-white/5 py-6 w-full max-w-lg">
            <Link to="/terms" className="text-slate-400 hover:text-emerald-400 text-xs font-black uppercase tracking-widest transition-colors">Rules of Play</Link>
            <Link to="/privacy" className="text-slate-400 hover:text-emerald-400 text-xs font-black uppercase tracking-widest transition-colors">Privacy Policy</Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full pt-4">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
              © 2026 GOLF CHARITY PLATFORM. ALL RIGHTS RESERVED.
            </p>
            <span className="text-slate-700 text-[10px] font-black uppercase tracking-widest">V2.4.0 High-End Build</span>
          </div>
        </div>
      </footer>
    );
  }

  // Authenticated View: Full Grid Layout
  return (
    <footer className="relative z-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-xl font-black text-white tracking-tighter">Golf Charity <span className="text-emerald-400">Platform</span></span>
            </Link>
            <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed">
              The world's first premium golf performance charity platform. Compete in monthly draws, win big, and drive social impact with every subscription.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/charities" className="text-slate-500 hover:text-emerald-400 text-sm font-bold transition-colors">Charities</Link></li>
              <li><Link to="/winnings" className="text-slate-500 hover:text-emerald-400 text-sm font-bold transition-colors">Winnings</Link></li>
              <li><Link to="/subscribe" className="text-slate-500 hover:text-emerald-400 text-sm font-bold transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-slate-500 hover:text-emerald-400 text-sm font-bold transition-colors">Rules of Play</Link></li>
              <li><Link to="/privacy" className="text-slate-500 hover:text-emerald-400 text-sm font-bold transition-colors">Privacy Policy</Link></li>
              {isAdmin && (
                <li><Link to="/admin-login" className="text-slate-700 hover:text-slate-500 text-[10px] font-black uppercase tracking-widest transition-colors">Staff Portal</Link></li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            © 2026 GOLF CHARITY PLATFORM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 uppercase text-[10px] font-black tracking-widest text-slate-600">
             <span>v2.4.0 High-End Build</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
