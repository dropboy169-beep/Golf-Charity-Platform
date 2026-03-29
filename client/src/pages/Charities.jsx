import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function Charities() {
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // New: Donation State
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(100);
  const [donationCharity, setDonationCharity] = useState(null);
  
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const card = scrollRef.current.firstElementChild;
      if (card) {
        const cardWidth = card.offsetWidth;
        const gap = window.innerWidth < 768 ? 16 : 32;
        const scrollAmount = cardWidth + gap;
        scrollRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [charities]);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await api.get("/charity");
        setCharities(res.data);
      } catch (error) {
        toast.error("Failed to load charities");
      }
    };

    fetchCharities();
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.charity_id) {
      setSelectedCharity(user.charity_id);
      setPercentage(user.charity_percentage || 10);
    }
  }, []);

  const handleSelect = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (!selectedCharity) {
      toast.error("Please select a charity");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(
        "/charity/select",
        {
          charity_id: selectedCharity,
          charity_percentage: Number(percentage),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const oldUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = {
        ...oldUser,
        charity_id: res.data.user.charity_id,
        charity_percentage: res.data.user.charity_percentage,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Impact settings updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDonation = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to donate");

    try {
      setLoading(true);
      const res = await api.post("/subscription/create-donation-session", {
        charityId: donationCharity.id,
        amount: Number(donationAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 max-w-6xl mx-auto font-sans relative z-10 space-y-12 mt-4 pb-20"
    >
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight drop-shadow-lg">
          Explore Listed <span className="neon-text-gradient">Charities</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
          Select a charity to support and specify the contribution percentage from your subscription.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="relative group/carousel px-4">
        {/* Navigation Arrows */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll("left")}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-[30] w-14 h-14 rounded-full glass-panel border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-110 hover:bg-emerald-500/10 transition-all duration-300 backdrop-blur-xl group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll("right")}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-[30] w-14 h-14 rounded-full glass-panel border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-110 hover:bg-emerald-500/10 transition-all duration-300 backdrop-blur-xl group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-emerald-500/5 rounded-[100%] blur-[120px] pointer-events-none"></div>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-8 overflow-x-auto scroll-smooth pb-12 pt-4 no-scrollbar snap-x snap-mandatory"
        >
          {charities.map((charity) => (
            <div
              key={charity.id}
              className={`flex-none w-[85%] sm:w-[calc((100%-48px)/2)] lg:w-[calc((100%-64px)/3)] snap-start glass-card flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 relative group z-10 ${
                selectedCharity === charity.id
                  ? "border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/10 ring-2 ring-emerald-500/20"
                  : "border-slate-700/50 hover:border-emerald-500/30 bg-slate-900/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              }`}
              onClick={() => setSelectedCharity(charity.id)}
            >
              <div className="h-56 relative border-b border-slate-700/50 overflow-hidden">
                {charity.image_url ? (
                  <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                    <span className="text-slate-700 font-extrabold tracking-widest uppercase text-xs">Listed Charity</span>
                  </div>
                )}
                {selectedCharity === charity.id && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-4 right-4 bg-emerald-500 text-slate-950 p-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-start relative bg-slate-900/40">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{charity.name}</h2>
                  <p className="text-sm text-slate-400 mt-3 line-clamp-3 leading-relaxed font-medium">{charity.description}</p>
                </div>
                 {charity.featured && (
                  <span className="inline-block mt-5 text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg max-w-max font-black tracking-widest uppercase shadow-sm">
                    Featured Charity
                  </span>
                )}
                
                {/* Section 08: Independent Donation Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDonationCharity(charity);
                    setIsDonationModalOpen(true);
                  }}
                  className="mt-6 w-full py-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group-hover:bg-slate-900 shadow-inner"
                >
                  Give Directly
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

       <motion.div variants={itemVariants} className="mb-10 glass-panel p-10 rounded-[2.5rem] max-w-3xl mx-auto border border-emerald-500/20 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Your Impact Level</h3>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Adjust your contribution percentage</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black neon-text-gradient">{percentage}%</span>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black text-slate-500 uppercase">of monthly</span>
                <span className="text-[14px] font-black text-white uppercase">Subscription</span>
              </div>
            </div>
          </div>

          <div className="relative pt-6 pb-2">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full h-3 bg-slate-950 rounded-full appearance-none cursor-pointer accent-emerald-500 border border-slate-800 shadow-inner"
            />
            <div className="flex justify-between mt-4">
              {[10, 25, 50, 75, 100].map((val) => (
                <button 
                  key={val}
                  onClick={() => setPercentage(val)}
                  className={`text-[9px] font-black uppercase tracking-tighter transition-all ${percentage >= val ? 'text-emerald-400' : 'text-slate-600'}`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50 flex items-center justify-between group-hover:border-emerald-500/20 transition-all">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Donation</span>
              <span className="text-2xl font-black text-white">₹{(250 * (percentage / 100)).toFixed(2)}</span>
            </div>
            <button
              onClick={handleSelect}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-xl font-black uppercase text-[11px] tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Confirm My Impact"}
            </button>
          </div>
          
          <p className="text-[9px] text-slate-500 text-center font-bold italic">
            * Minimum contribution is 10%. Your selection helps determine the prize pool for the monthly draw.
          </p>
        </div>
      </motion.div>

      {/* Direct Donation Modal */}
      <AnimatePresence>
        {isDonationModalOpen && donationCharity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-emerald-500/30 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-white">Direct Support</h3>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{donationCharity.name}</p>
                </div>
                <button onClick={() => setIsDonationModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleDirectDonation} className="p-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-400 leading-relaxed text-center">Your one-time gift goes directly to the charity of your choice. This contribution is independent of monthly draws.</p>
                  
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">₹</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-12 pr-6 py-5 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-black text-3xl shadow-inner text-center"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    {[100, 500, 1000].map(amt => (
                      <button 
                        key={amt} 
                        type="button" 
                        onClick={() => setDonationAmount(amt)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${donationAmount == amt ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-2xl py-5 font-black uppercase text-sm tracking-widest hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all"
                >
                  {loading ? "Preparing Checkout..." : "Continue to Payment"}
                </button>
                
                <p className="text-[10px] text-slate-600 text-center font-black uppercase tracking-[0.2em]">Secure Stripe Checkout</p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Charities;