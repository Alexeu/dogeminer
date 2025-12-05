import dogeKing from "@/assets/doge-king.png";
import dogeBuilder from "@/assets/doge-builder.png";
import dogePirate from "@/assets/doge-pirate.png";
import dogeWizard from "@/assets/doge-wizard.png";
import dogeGold from "@/assets/doge-gold.png";
import dogeNinja from "@/assets/doge-ninja.png";
import dogeAstronaut from "@/assets/doge-astronaut.png";
import dogeCyberpunk from "@/assets/doge-cyberpunk.png";

const characters = [
  { src: dogeKing, name: "Doge King" },
  { src: dogeBuilder, name: "Doge Builder" },
  { src: dogePirate, name: "Doge Pirate" },
  { src: dogeWizard, name: "Doge Wizard" },
  { src: dogeGold, name: "Doge Gold" },
  { src: dogeNinja, name: "Doge Ninja" },
  { src: dogeAstronaut, name: "Doge Astronaut" },
  { src: dogeCyberpunk, name: "Doge Cyberpunk" },
];

const CharacterCarousel = () => {
  // Duplicate for infinite scroll effect
  const allCharacters = [...characters, ...characters];

  return (
    <section className="py-8 bg-secondary/50 overflow-hidden">
      <div className="animate-scroll flex gap-8 w-max">
        {allCharacters.map((char, index) => (
          <div
            key={`${char.name}-${index}`}
            className="flex-shrink-0 group"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl glass p-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-doge-lg">
              <img
                src={char.src}
                alt={char.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CharacterCarousel;
