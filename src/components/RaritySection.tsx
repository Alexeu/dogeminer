import bonkBuilder from "@/assets/bonk-builder.png";
import bonkPirate from "@/assets/bonk-pirate.png";
import bonkWizard from "@/assets/bonk-wizard.png";
import bonkGold from "@/assets/bonk-gold.png";

const rarities = [
  {
    image: bonkBuilder,
    name: "Bonk Builder",
    rarity: "Common",
    dropRate: "60-85%",
    miningRate: "220-245 BONK/day",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
  {
    image: bonkPirate,
    name: "Bonk Pirate",
    rarity: "Rare",
    dropRate: "7-30%",
    miningRate: "360-380 BONK/day",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    image: bonkWizard,
    name: "Bonk Wizard",
    rarity: "Epic",
    dropRate: "5-10%",
    miningRate: "480-550 BONK/day",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    image: bonkGold,
    name: "Bonk Gold",
    rarity: "Legendary",
    dropRate: "1-5%",
    miningRate: "710-1000 BONK/day",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
  },
];

const RaritySection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Rarity System
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rarities.map((rarity, index) => (
            <div
              key={rarity.name}
              className="glass rounded-2xl p-6 text-center hover:shadow-bonk-lg transition-all duration-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative mb-4">
                <div className={`absolute inset-0 bg-gradient-to-b ${rarity.color} opacity-20 rounded-xl blur-xl`} />
                <img
                  src={rarity.image}
                  alt={rarity.name}
                  className="w-32 h-32 mx-auto relative z-10 object-contain"
                />
              </div>

              <h3 className="text-lg font-bold mb-2">{rarity.name}</h3>

              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${rarity.bgColor} ${rarity.textColor} mb-4`}
              >
                {rarity.rarity}
              </span>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {rarity.dropRate}
                  </span>{" "}
                  Drop Rate
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-gradient">
                    {rarity.miningRate}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RaritySection;
