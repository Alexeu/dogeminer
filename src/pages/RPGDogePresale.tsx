import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Coins, 
  Users, 
  Rocket,
  Copy,
  Shield, 
  Clock, 
  TrendingUp,
  Wallet,
  CheckCircle,
  Sparkles,
  Zap,
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import rpgDogeToken from "@/assets/rpgdoge-token.png";

// Presale configuration
const PRESALE_CONFIG = {
  totalTokens: 1_000_000_000_000, // 1T tokens for presale
  soldTokens: 347_892_156, // Simulated sold amount
  startDate: new Date("2024-12-01"),
  endDate: new Date("2025-02-28T23:59:59"),
  phases: [
    { name: "Fase 1 - Early Bird", price: 0.00001, bonus: 50, active: false, sold: true },
    { name: "Fase 2 - Guerreros", price: 0.000015, bonus: 30, active: true, sold: false },
    { name: "Fase 3 - Caballeros", price: 0.00002, bonus: 15, active: false, sold: false },
    { name: "Fase 4 - Nobles", price: 0.000025, bonus: 5, active: false, sold: false },
  ],
  minPurchase: 1, // USDT
  maxPurchase: 10000, // USDT
  paymentAddress: "0x097b0584a9bd6640371B81028E250AAcda5e06f7",
  paymentNetwork: "ERC-20",
};

const benefits = [
  { icon: Rocket, title: "Acceso Temprano", desc: "Sé de los primeros en obtener RDOGE" },
  { icon: Shield, title: "Precio Exclusivo", desc: "Precio más bajo que en lanzamiento" },
  { icon: TrendingUp, title: "Bonus Extra", desc: "Hasta 50% de tokens adicionales" },
  { icon: Crown, title: "VIP Access", desc: "Beneficios exclusivos para holders" },
];

const stats = [
  { label: "Tokens Vendidos", value: "347.8M" },
  { label: "Holders", value: "12,847" },
  { label: "USDT Recaudados", value: "$521,838" },
  { label: "Bonus Promedio", value: "+35%" },
];

const RPGDogePresale = () => {
  const [amount, setAmount] = useState<string>("100");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  // Calculate tokens based on amount and current phase
  const currentPhase = PRESALE_CONFIG.phases.find(p => p.active) || PRESALE_CONFIG.phases[1];
  const baseTokens = parseFloat(amount || "0") / currentPhase.price;
  const bonusTokens = baseTokens * (currentPhase.bonus / 100);
  const totalTokens = baseTokens + bonusTokens;

  // Progress percentage
  const progressPercent = (PRESALE_CONFIG.soldTokens / PRESALE_CONFIG.totalTokens) * 100;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = PRESALE_CONFIG.endDate.getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePurchase = async () => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum < PRESALE_CONFIG.minPurchase) {
      toast({
        title: "⚠️ Cantidad inválida",
        description: `El mínimo de compra es ${PRESALE_CONFIG.minPurchase} USDT`,
        variant: "destructive",
      });
      return;
    }

    if (amountNum > PRESALE_CONFIG.maxPurchase) {
      toast({
        title: "⚠️ Cantidad excedida",
        description: `El máximo de compra es ${PRESALE_CONFIG.maxPurchase} USDT`,
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "🎉 ¡Reserva Confirmada!",
      description: `Has reservado ${totalTokens.toLocaleString()} RDOGE tokens. Te contactaremos para completar el pago.`,
    });
    
    setIsPurchasing(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(1) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0f0f23] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent" />
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/40 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{ y: [null, -30, 30], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-yellow-500/20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/rpgdoge">
            <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Lore
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={rpgDogeToken} alt="RPGDOGE" className="w-8 h-8" />
            <span className="font-bold text-yellow-400">RPGDOGE</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-yellow-500/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-yellow-300 text-sm font-medium">Preventa Activa - Fase 2</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                Preventa RPGDOGE
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Únete a la revolución del Reino Crypto. Obtén tokens RDOGE al mejor precio antes del lanzamiento oficial.
            </motion.p>
          </div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-200 font-medium">La preventa termina en:</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: timeLeft.days, label: "Días" },
                  { value: timeLeft.hours, label: "Horas" },
                  { value: timeLeft.minutes, label: "Min" },
                  { value: timeLeft.seconds, label: "Seg" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-black/50 rounded-xl p-4 border border-yellow-500/20">
                      <span className="text-3xl md:text-5xl font-bold text-yellow-400">
                        {item.value.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm mt-2 block">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Progreso de Venta</span>
                <span className="text-yellow-400 font-bold">{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-400 rounded-full"
                />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400/50 to-transparent rounded-full"
                  style={{ width: `${progressPercent}%` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-gray-400">
                  Vendidos: <span className="text-white font-medium">{formatNumber(PRESALE_CONFIG.soldTokens)}</span>
                </span>
                <span className="text-gray-400">
                  Total: <span className="text-white font-medium">{formatNumber(PRESALE_CONFIG.totalTokens)}</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Purchase Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm rounded-3xl p-8 border border-yellow-500/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Comprar RDOGE</h2>
                  <p className="text-gray-400 text-sm">Precio actual: ${currentPhase.price.toFixed(6)} USDT</p>
                </div>
              </div>

              {/* Phase Info */}
              <div className="bg-black/30 rounded-xl p-4 mb-6 border border-yellow-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-300 font-medium">{currentPhase.name}</span>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    +{currentPhase.bonus}% Bonus
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-4 mb-6">
                <label className="block text-gray-300 text-sm font-medium">Cantidad a invertir (USDT)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    min={PRESALE_CONFIG.minPurchase}
                    max={PRESALE_CONFIG.maxPurchase}
                    className="bg-black/50 border-yellow-500/30 text-white text-xl h-14 pr-16 focus:border-yellow-400"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 font-medium">
                    USDT
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[1, 10, 50, 100, 500].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                      className="flex-1 min-w-[60px] border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Token Calculation */}
              <div className="bg-black/40 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Tokens base:</span>
                  <span className="text-white">{formatNumber(baseTokens)} RDOGE</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Bonus (+{currentPhase.bonus}%):</span>
                  <span>+{formatNumber(bonusTokens)} RDOGE</span>
                </div>
                <div className="border-t border-yellow-500/20 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-yellow-300">Total a recibir:</span>
                    <span className="text-yellow-400">{formatNumber(totalTokens)} RDOGE</span>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg rounded-xl shadow-lg shadow-yellow-500/30"
                >
                  {isPurchasing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Coins className="w-5 h-5 mr-2" />
                      Reservar Tokens
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-gray-500 text-xs text-center mt-4">
                Mínimo: ${PRESALE_CONFIG.minPurchase} • Máximo: ${PRESALE_CONFIG.maxPurchase}
              </p>

              {/* Payment Address Info */}
              <div className="mt-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">Dirección de Pago USDT</span>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                    {PRESALE_CONFIG.paymentNetwork}
                  </span>
                </div>
                <div className="bg-black/50 rounded-lg p-3 flex items-center justify-between gap-2">
                  <code className="text-yellow-400 text-xs md:text-sm break-all font-mono">
                    {PRESALE_CONFIG.paymentAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(PRESALE_CONFIG.paymentAddress);
                      toast({
                        title: "✅ Copiado",
                        description: "Dirección copiada al portapapeles",
                      });
                    }}
                    className="shrink-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  ⚠️ Envía únicamente USDT a través de la red <span className="text-blue-400 font-medium">Ethereum (ERC-20)</span>. 
                  Otras redes no serán procesadas.
                </p>
              </div>
            </motion.div>

            {/* Phases & Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-6"
            >
              {/* Phases */}
              <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Fases de Preventa
                </h3>
                <div className="space-y-3">
                  {PRESALE_CONFIG.phases.map((phase, i) => (
                    <motion.div
                      key={phase.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        phase.active
                          ? "bg-yellow-500/10 border-yellow-500/50"
                          : phase.sold
                          ? "bg-gray-800/50 border-gray-700/50 opacity-60"
                          : "bg-gray-900/50 border-gray-700/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {phase.sold ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : phase.active ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Sparkles className="w-5 h-5 text-yellow-400" />
                            </motion.div>
                          ) : (
                            <Clock className="w-5 h-5 text-gray-500" />
                          )}
                          <div>
                            <p className={`font-medium ${phase.active ? "text-yellow-300" : phase.sold ? "text-gray-400" : "text-gray-300"}`}>
                              {phase.name}
                            </p>
                            <p className="text-sm text-gray-500">${phase.price.toFixed(6)} / token</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          phase.active
                            ? "bg-yellow-500/20 text-yellow-400"
                            : phase.sold
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-700/50 text-gray-400"
                        }`}>
                          {phase.sold ? "Vendido" : phase.active ? `+${phase.bonus}%` : `+${phase.bonus}%`}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/10 text-center"
                  >
                    <p className="text-2xl font-bold text-yellow-400">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto mt-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8 text-white">
              ¿Por qué comprar en preventa?
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 text-center"
                >
                  <div className="inline-flex p-4 bg-yellow-500/10 rounded-full mb-4">
                    <benefit.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-10 border-t border-yellow-500/10 text-center">
        <p className="text-gray-500 text-sm">
          © 2024 RPGDOGE Kingdom • Todos los derechos reservados
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Los tokens se distribuirán después del lanzamiento oficial
        </p>
      </footer>
    </div>
  );
};

export default RPGDogePresale;
