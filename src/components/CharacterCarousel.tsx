import dogeKing from "@/assets/doge-king.png";
import dogeBuilder from "@/assets/doge-builder.png";
import dogePirate from "@/assets/doge-pirate.png";
import dogeWizard from "@/assets/doge-wizard.png";
import dogeGold from "@/assets/doge-gold.png";
import dogeNinja from "@/assets/doge-ninja.png";
import dogeAstronaut from "@/assets/doge-astronaut.png";
import dogeCyberpunk from "@/assets/doge-cyberpunk.png";
import dogeFarmer from "@/assets/doge-farmer.png";
import dogeChef from "@/assets/doge-chef.png";
import dogeMechanic from "@/assets/doge-mechanic.png";
import dogeArtist from "@/assets/doge-artist.png";
import dogeExplorer from "@/assets/doge-explorer.png";
import dogeSamurai from "@/assets/doge-samurai.png";
import dogeKnight from "@/assets/doge-knight.png";
import dogeViking from "@/assets/doge-viking.png";
import dogeGladiator from "@/assets/doge-gladiator.png";
import dogeVampire from "@/assets/doge-vampire.png";
import dogePhoenix from "@/assets/doge-phoenix.png";
import dogeDragon from "@/assets/doge-dragon.png";
import dogeSupreme from "@/assets/doge-supreme.png";

const characters = [
  { src: dogeKing, name: "Doge King" },
  { src: dogeBuilder, name: "Doge Builder" },
  { src: dogePirate, name: "Doge Pirate" },
  { src: dogeWizard, name: "Doge Wizard" },
  { src: dogeGold, name: "Doge Gold" },
  { src: dogeNinja, name: "Doge Ninja" },
  { src: dogeAstronaut, name: "Doge Astronaut" },
  { src: dogeCyberpunk, name: "Doge Cyberpunk" },
  { src: dogeFarmer, name: "Doge Farmer" },
  { src: dogeChef, name: "Doge Chef" },
  { src: dogeMechanic, name: "Doge Mechanic" },
  { src: dogeArtist, name: "Doge Artist" },
  { src: dogeExplorer, name: "Doge Explorer" },
  { src: dogeSamurai, name: "Doge Samurai" },
  { src: dogeKnight, name: "Doge Knight" },
  { src: dogeViking, name: "Doge Viking" },
  { src: dogeGladiator, name: "Doge Gladiator" },
  { src: dogeVampire, name: "Doge Vampire" },
  { src: dogePhoenix, name: "Doge Phoenix" },
  { src: dogeDragon, name: "Doge Dragon" },
  { src: dogeSupreme, name: "Doge Supreme" },
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