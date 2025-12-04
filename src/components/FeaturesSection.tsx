import { Gem, Pickaxe, Gift } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Collect Rare BONKs",
    description:
      "Build your collection with Common to Legendary BONKs. Each character has unique mining power and rarity.",
  },
  {
    icon: Pickaxe,
    title: "Passive Mining",
    description:
      "Earn BONK 24/7 automatically. Your BONKs mine even when you're offline. No manual clicking required.",
  },
  {
    icon: Gift,
    title: "Mystery Boxes",
    description:
      "Open boxes to get new BONKs and boost your mining power. Different rarities with varying drop rates.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose <span className="text-gradient">BONKMine</span>?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-8 text-center hover:shadow-bonk-lg transition-all duration-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-bonk-md">
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
