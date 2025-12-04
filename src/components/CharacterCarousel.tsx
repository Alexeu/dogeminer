import bonkKing from "@/assets/bonk-king.png";
import bonkBuilder from "@/assets/bonk-builder.png";
import bonkPirate from "@/assets/bonk-pirate.png";
import bonkWizard from "@/assets/bonk-wizard.png";
import bonkGold from "@/assets/bonk-gold.png";
import bonkNinja from "@/assets/bonk-ninja.png";
import bonkAstronaut from "@/assets/bonk-astronaut.png";
import bonkCyberpunk from "@/assets/bonk-cyberpunk.png";

const characters = [
  { src: bonkKing, name: "Bonk King" },
  { src: bonkBuilder, name: "Bonk Builder" },
  { src: bonkPirate, name: "Bonk Pirate" },
  { src: bonkWizard, name: "Bonk Wizard" },
  { src: bonkGold, name: "Bonk Gold" },
  { src: bonkNinja, name: "Bonk Ninja" },
  { src: bonkAstronaut, name: "Bonk Astronaut" },
  { src: bonkCyberpunk, name: "Bonk Cyberpunk" },
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
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl glass p-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-bonk-lg">
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
