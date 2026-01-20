import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ExternalLink,
  Rocket,
  Copy,
  Shield, 
  TrendingUp,
  Crown,
  Sparkles,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import rpgDogeToken from "@/assets/rpgdoge-token.png";
import { useLanguage } from "@/contexts/LanguageContext";

const PUMP_FUN_URL = "https://pump.fun/coin/2cbcV3PsabFRttudnJNY5GFVYSLxZiYjPN5Dh5aXpump";
const CONTRACT_ADDRESS = "2cbcV3PsabFRttudnJNY5GFVYSLxZiYjPN5Dh5aXpump";

const RPGDogePresale = () => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const benefits = [
    { icon: Rocket, title: t('presale.earlyAccess'), desc: t('presale.earlyAccessDesc') },
    { icon: Shield, title: t('presale.exclusivePrice'), desc: t('presale.exclusivePriceDesc') },
    { icon: TrendingUp, title: t('presale.extraBonus'), desc: t('presale.extraBonusDesc') },
    { icon: Crown, title: t('presale.vipAccess'), desc: t('presale.vipAccessDesc') },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copiado",
      description: "Dirección del contrato copiada al portapapeles",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link to="/rpgdoge">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.img 
              src={rpgDogeToken} 
              alt="RDOGE Token" 
              className="w-32 h-32 drop-shadow-2xl"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              RPGDOGE Token
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('presale.subtitle')}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              pump.fun
            </span>
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              Solana Network
            </span>
          </div>
        </motion.div>

        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-primary/20 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">
                🚀 ¡RDOGE ya está disponible en pump.fun!
              </h2>
              <p className="text-muted-foreground mb-6">
                Compra tokens RDOGE directamente en la plataforma pump.fun de Solana. 
                Transacciones rápidas, fees bajos y trading descentralizado.
              </p>
            </div>

            {/* Contract Address */}
            <div className="bg-background/50 rounded-xl p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-2 text-center">Contrato (Solana)</p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xs md:text-sm font-mono text-primary break-all">
                  {CONTRACT_ADDRESS}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main CTA Button */}
            <a
              href={PUMP_FUN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-bold gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25"
              >
                <Rocket className="w-6 h-6" />
                Comprar RDOGE en pump.fun
                <ExternalLink className="w-5 h-5" />
              </Button>
            </a>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Serás redirigido a pump.fun para completar tu compra
            </p>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            ¿Por qué comprar RDOGE?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-card/60 backdrop-blur rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/20">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground text-sm"
        >
          <p className="mb-2">© 2025 RPGDOGE - Todos los derechos reservados</p>
          <p className="text-xs opacity-70">
            Trading de criptomonedas implica riesgos. Invierte responsablemente.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RPGDogePresale;
