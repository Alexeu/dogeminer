import dogeBuilder from "@/assets/doge-builder.png";
import dogePirate from "@/assets/doge-pirate.png";
import dogeWizard from "@/assets/doge-wizard.png";
import dogeGold from "@/assets/doge-gold.png";

const rarities = [
  {
    image: dogeBuilder,
    name: "Doge Builder",
    rarity: "Common",
    dropRate: "60-85%",
    miningRate: "0.047 DOGE/día",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
  {
    image: dogePirate,
    name: "Doge Pirate",
    rarity: "Rare",
    dropRate: "7-30%",
    miningRate: "0.109 DOGE/día",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    image: dogeWizard,
    name: "Doge Wizard",
    rarity: "Epic",
    dropRate: "5-10%",
    miningRate: "0.234 DOGE/día",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    image: dogeGold,
    name: "Doge Gold",
    rarity: "Legendary",
    dropRate: "1-5%",
    miningRate: "0.312 DOGE/día",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
  },
  {
    image: dogeGold,
    name: "Santa Doge",
    rarity: "🎄 Christmas",
    dropRate: "Solo en Caja Navideña",
    miningRate: "0.468 DOGE/día",
    color: "from-red-500 via-green-500 to-red-500",
    bgColor: "bg-gradient-to-r from-red-100 to-green-100",
    textColor: "text-red-600",
    isChristmas: true,
  },
];

const RaritySection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Sistema de Rareza
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {rarities.map((rarity, index) => (
            <div
              key={rarity.name}
              className={`glass rounded-2xl p-6 text-center hover:shadow-doge-lg transition-all duration-300 hover:-translate-y-2 animate-slide-up ${
                rarity.isChristmas ? "ring-2 ring-red-500/50 relative" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {rarity.isChristmas && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  ¡NUEVO!
                </div>
              )}
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