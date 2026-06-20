import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import { X, Brain, Sparkles, Zap, Target, GitBranch, Trophy, Clock, Check } from 'lucide-react';

import { useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface SmartMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeClick?: () => void;
}

const MATCH_FACTORS = [
  { icon: Zap,       label: 'Skills Match',      desc: '35% — shared technologies', color: 'text-[#00e5ff]',  bg: 'bg-[#00e5ff]/10',  border: 'border-[#00e5ff]/20'  },
  { icon: Target,    label: 'Startup Intent',     desc: '20% — same builder goals',  color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: GitBranch, label: 'GitHub Similarity',  desc: '15% — coding patterns',     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  { icon: Brain,     label: 'Builder Score',      desc: '10% — ambition level',      color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20'},
  { icon: Trophy,    label: 'Hackathon Activity', desc: '10% — event participation', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { icon: Clock,     label: 'Availability',       desc: '10% — build schedule',      color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20'   },
];

const PRO_BENEFITS = [
  'Top 10 curated builder matches',
  'Full compatibility breakdown',
  'Smart "Why you match" insights',
  'Weekly fresh recommendations',
  'Builder Score comparisons',
];

export const SmartMatchesModal = ({ isOpen, onClose }: SmartMatchesModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      const { data: order } = await api.post('/payments/create-order', { amount: 599 });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
        amount: order.amount,
        currency: order.currency,
        name: 'Merge App',
        description: 'Upgrade to Merge Pro',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Successfully upgraded to Pro!');
            onClose();
            setTimeout(() => window.location.reload(), 1500);
          } catch (e) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#8b5cf6' }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (error) {
      toast.error('Could not initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9998]"
          />

          {/* ── Scroll shell: fixed + overflow-y-auto so the modal is scrollable on short screens ── */}
          <div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={onClose}>

            {/* Inner centering wrapper — min-h-full keeps items-center working even when content is taller than viewport */}
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">

              {/* ── Modal card ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-lg"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative bg-gradient-to-b from-[#13131a] to-[#0d0d12] border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden">

                  {/* Glows */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#00e5ff]/10 blur-[100px] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-600/10 blur-[80px] pointer-events-none" />

                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="relative p-5 sm:p-6">

                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00e5ff]/20 to-violet-600/20 border border-[#00e5ff]/30 mb-3 shadow-lg shadow-[#00e5ff]/10">
                        <Brain className="w-6 h-6 text-[#00e5ff]" />
                      </div>
                      <h2 className="text-xl font-black text-white mb-1.5">AI Smart Matches</h2>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Stop scrolling. Let our compatibility engine surface your best builder matches automatically.
                      </p>
                    </div>



                    {/* Matching factors */}
                    <div className="mb-4">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Matching Factors</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {MATCH_FACTORS.map(({ icon: Icon, label, desc, color, bg, border }) => (
                          <div key={label} className={`flex items-center gap-2 p-2 rounded-xl ${bg} border ${border}`}>
                            <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                            <div className="min-w-0">
                              <p className={`text-[10px] font-black ${color} leading-tight`}>{label}</p>
                              <p className="text-[8px] text-zinc-600 font-semibold leading-tight truncate">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro benefits */}
                    <div className="mb-5 p-3 bg-gradient-to-r from-violet-500/8 to-purple-600/8 border border-violet-500/20 rounded-2xl">
                      <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-2">🚀 What Pro unlocks</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {PRO_BENEFITS.map(b => (
                          <div key={b} className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                              <Check className="w-2 h-2 text-emerald-400" />
                            </div>
                            <span className="text-[11px] text-zinc-300 font-medium truncate">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handleUpgrade}
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-gradient-to-r from-[#00e5ff] to-violet-500 text-[#0a0a0b] font-black rounded-2xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#00e5ff]/20 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Upgrade to Pro - ₹599'}
                    </button>
                    <p className="text-center text-[10px] text-zinc-600 mt-3">
                      Secure payment via Razorpay. Instantly unlocks all Pro features.
                    </p>

                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SmartMatchesModal;
