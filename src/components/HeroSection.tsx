import { Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import bonkKing from "@/assets/bonk-king.png";
import bonkBuilder from "@/assets/bonk-builder.png";
import bonkPirate from "@/assets/bonk-pirate.png";

const HeroSection = () => {
  const stats = [
    { value: "3,847+", label: "Active Miners" },
    { value: "1,284,592+", label: "BONK Mined" },
    { value: "4,128+", label: "Active BONKs" },
  ];

  return (
    <section className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-bonk-amber/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Mine </span>
              <span className="text-gradient">BONK</span>
              <span className="text-foreground"> with Your </span>
              <span className="text-gradient">BONK</span>
              <span className="text-foreground"> Collection</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Earn passive BONKcoin by collecting unique BONK characters. Start
              mining automatically with your collection.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg">
                <Zap className="w-5 h-5" />
                Start Mining Now
              </Button>
              <Button variant="heroOutline" size="lg">
                <Sparkles className="w-5 h-5" />
                View Collection
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass rounded-xl p-4 text-center animate-slide-up"
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
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
                src={bonkKing}
                alt="Bonk King"
                className="w-48 md:w-56 lg:w-64 absolute left-0 top-1/2 -translate-y-1/2 z-10 animate-float drop-shadow-2xl"
              />
              <img
                src={bonkBuilder}
                alt="Bonk Builder"
                className="w-44 md:w-52 lg:w-60 mx-auto z-20 animate-float animation-delay-200 drop-shadow-2xl"
              />
              <img
                src={bonkPirate}
                alt="Bonk Pirate"
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
