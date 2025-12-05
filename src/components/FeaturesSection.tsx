import { Dog, Pickaxe, Gift, Rocket } from "lucide-react";

const features = [
  {
    icon: Dog,
    title: "Collect Rare Doges",
    description:
      "Much collect! Build your pack with Common to Legendary Doges. Each character has unique mining power and rarity. Very wow!",
  },
  {
    icon: Pickaxe,
    title: "Passive Mining",
    description:
      "Earn DOGE 24/7 automatically. Your Doges mine even when you're offline. No manual clicking required. Such easy!",
  },
  {
    icon: Gift,
    title: "Mystery Boxes",
    description:
      "Open boxes to get new Doges and boost your mining power. Different rarities with varying drop rates. Many surprise!",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Why Choose <span className="text-gradient">DOGEMiner</span>?
        </h2>
        <p className="text-center text-muted-foreground mb-12 font-comic">
          Such features! Very benefits! 🐕
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-8 text-center hover:shadow-doge-lg transition-all duration-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-doge-md">
                <feature.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
