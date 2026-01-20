import { motion } from "framer-motion";
import { Coins, TrendingUp, Users, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import rpgDogeToken from "@/assets/rpgdoge-token.png";

const PUMP_FUN_URL = "https://pump.fun/coin/2cbcV3PsabFRttudnJNY5GFVYSLxZiYjPN5Dh5aXpump";

// Token stats
const TOKEN_STATS = {
  holders: 12847,
  marketCap: 521838,
};

const formatNumber = (num: number) => {
  if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + "T";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
};

const RPGDogeTokenCounter = () => {
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
                  alt="RPGDOGE Token"
                  className="w-12 h-12"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    RPGDOGE Token
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </h3>
                  <p className="text-yellow-400/80 text-sm">¡Disponible en pump.fun!</p>
                </div>
              </div>
              <a href={PUMP_FUN_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold shadow-lg shadow-yellow-500/20">
                  <Coins className="w-4 h-4 mr-2" />
                  Comprar en pump.fun
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </a>
            </div>

            {/* Main Message */}
            <div className="text-center mb-6">
              <motion.div
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 bg-clip-text text-transparent"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
              >
                ¡Token RDOGE en Solana!
              </motion.div>
              <p className="text-gray-400 text-sm mt-2">
                Compra directamente en pump.fun con SOL
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-black/30 rounded-xl p-3">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-bold">{formatNumber(TOKEN_STATS.holders)}</p>
                <p className="text-gray-500 text-xs">Holders</p>
              </div>
              <div className="text-center bg-black/30 rounded-xl p-3">
                <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-white font-bold">${formatNumber(TOKEN_STATS.marketCap)}</p>
                <p className="text-gray-500 text-xs">Market Cap</p>
              </div>
            </div>

            {/* Contract Address */}
            <div className="mt-4 p-3 bg-black/40 rounded-xl border border-yellow-500/20">
              <p className="text-xs text-gray-400 mb-1">Contrato (Solana):</p>
              <p className="text-xs text-yellow-400 font-mono break-all">
                2cbcV3PsabFRttudnJNY5GFVYSLxZiYjPN5Dh5aXpump
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default RPGDogeTokenCounter;
