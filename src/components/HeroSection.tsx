import { Zap, Sparkles, Rocket, Dog, Star, TrendingUp, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import dogeKing from "@/assets/doge-king.png";
import dogeBuilder from "@/assets/doge-builder.png";
import dogePirate from "@/assets/doge-pirate.png";

const HeroSection = () => {
  const { t } = useLanguage();
  const { onlineCount } = useOnlinePresence();
  
  const stats = [
    { value: onlineCount > 0 ? onlineCount.toString() : "...", label: t('hero.statOnline') || "Online Now", icon: Users, isLive: true },
    { value: "42,069+", label: t('hero.statMined') || "DOGE Mined", icon: Sparkles },
    { value: "4,128+", label: t('hero.statDoges') || "Very Doges", icon: Star },
  ];

  const features = [
    { icon: Gift, text: t('hero.featureFree') || "100% Gratis" },
    { icon: Rocket, text: t('hero.featureMining') || "Minería 24/7" },
    { icon: Zap, text: t('hero.featureWithdraw') || "Retiros Instantáneos" },
  ];

  return (
    <section className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-comic border border-primary/30">
              <Dog className="w-5 h-5" />
              <span className="font-bold">{t('hero.badge') || "Much WOW! To The Moon! 🚀"}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">{t('hero.title1') || "Gana "}</span>
              <span className="text-gradient">DOGE</span>
              <span className="text-foreground">{t('hero.title2') || " Gratis"}</span>
              <br />
              <span className="text-foreground">{t('hero.title3') || "con tu "}</span>
              <span className="text-gradient">{t('hero.title4') || "Colección"}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl font-comic">
              {t('hero.subtitle') || "Colecciona personajes Doge únicos y gana Dogecoin automáticamente 24/7. ¡Retiros instantáneos a FaucetPay! 🌙"}
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-sm font-medium"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  {feature.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" className="text-lg">
                <Rocket className="w-5 h-5" />
                {t('hero.ctaPrimary') || "¡Comenzar Gratis!"}
              </Button>
              <Button variant="heroOutline" size="lg">
                <Sparkles className="w-5 h-5" />
                {t('hero.ctaSecondary') || "Ver Colección"}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass rounded-xl p-4 text-center animate-slide-up relative"
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  {'isLive' in stat && stat.isLive && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-gradient">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Characters */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              <img
                src={dogeKing}
                alt="Doge King"
                className="w-48 md:w-56 lg:w-64 absolute left-0 top-1/2 -translate-y-1/2 z-10 animate-float drop-shadow-2xl"
              />
              <img
                src={dogeBuilder}
                alt="Doge Builder"
                className="w-44 md:w-52 lg:w-60 mx-auto z-20 animate-float animation-delay-200 drop-shadow-2xl"
              />
              <img
                src={dogePirate}
                alt="Doge Pirate"
                className="w-48 md:w-56 lg:w-64 absolute right-0 top-1/2 -translate-y-1/2 z-10 animate-float animation-delay-400 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
