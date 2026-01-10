import { motion } from "framer-motion";
import { Coins, TrendingUp, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import rpgDogeToken from "@/assets/rpgdoge-token.png";

// Simulated presale data (should match RPGDogePresale.tsx)
const PRESALE_STATS = {
  soldTokens: 347_892_156,
  totalTokens: 1_000_000_000_000,
  holders: 12847,
  usdtRaised: 521838,
};

const formatNumber = (num: number) => {
  if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + "T";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
};

const RPGDogeTokenCounter = () => {
  const progressPercent = (PRESALE_STATS.soldTokens / PRESALE_STATS.totalTokens) * 100;

  return (
    <section className="py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-900/30 via-orange-900/20 to-purple-900/30 rounded-2xl border border-yellow-500/30 p-6">
          {/* Animated background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-60 h-60 bg-orange-500/20 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
              <motion.img
                  src={rpgDogeToken}
                  alt="DOGE KINGDOM PROTECTOR Token"
                  className="w-12 h-12"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    DOGE KINGDOM PROTECTOR
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </h3>
                  <p className="text-yellow-400/80 text-sm">Fase 2 Activa - ¡Únete ahora!</p>
                </div>
              </div>
              <Link to="/rpgdoge/presale">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold shadow-lg shadow-yellow-500/20">
                  <Coins className="w-4 h-4 mr-2" />
                  Comprar Tokens
                </Button>
              </Link>
            </div>

            {/* Main Counter */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-1">Tokens Vendidos</p>
              <motion.div
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 bg-clip-text text-transparent"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
              >
                {formatNumber(PRESALE_STATS.soldTokens)}
              </motion.div>
              <p className="text-gray-500 text-sm mt-1">
                de {formatNumber(PRESALE_STATS.totalTokens)} RDOGE
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progreso</span>
                <span className="text-yellow-400 font-medium">{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-400 rounded-full relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-black/30 rounded-xl p-3">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-bold">{formatNumber(PRESALE_STATS.holders)}</p>
                <p className="text-gray-500 text-xs">Holders</p>
              </div>
              <div className="text-center bg-black/30 rounded-xl p-3">
                <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-white font-bold">${formatNumber(PRESALE_STATS.usdtRaised)}</p>
                <p className="text-gray-500 text-xs">Recaudado</p>
              </div>
              <div className="text-center bg-black/30 rounded-xl p-3">
                <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-bold">+30%</p>
                <p className="text-gray-500 text-xs">Bonus Activo</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default RPGDogeTokenCounter;
