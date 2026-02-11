import dogeBuilder from "@/assets/doge-builder.png";
import dogePirate from "@/assets/doge-pirate.png";
import dogeWizard from "@/assets/doge-wizard.png";
import dogeGold from "@/assets/doge-gold.png";
import dogeKing from "@/assets/doge-king.png";
import dogeNinja from "@/assets/doge-ninja.png";
import dogeAstronaut from "@/assets/doge-astronaut.png";
import dogeCyberpunk from "@/assets/doge-cyberpunk.png";
import dogeStarter from "@/assets/doge-starter.png";
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
import dogeCupid from "@/assets/doge-cupid.png";
import dogeRomeo from "@/assets/doge-romeo.png";
import dogeLovefairy from "@/assets/doge-lovefairy.png";
import dogeHeartknight from "@/assets/doge-heartknight.png";
import dogeLovequeen from "@/assets/doge-lovequeen.png";


export type Rarity = "starter" | "common" | "rare" | "epic" | "legendary" | "christmas" | "valentine";

export interface DogeCharacter {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  miningRate: number; // DOGE per hour
}

// Tasas de minado por hora por rareza (en DOGE) - +30% boost aplicado
// Base rates: starter=0.0025, common=0.0015, rare=0.0035, epic=0.0075, legendary=0.01, christmas=0.015
// With 30% boost: starter=0.0025 (no boost), common=0.00195, rare=0.00455, epic=0.00975, legendary=0.013, christmas=0.0195
export const miningRatesByRarity: Record<Rarity, number> = {
  starter: 0.0025, // Sin bonus, tasa fija
  common: 0.00195, // 0.0015 * 1.3
  rare: 0.00455,   // 0.0035 * 1.3
  epic: 0.00975,   // 0.0075 * 1.3
  legendary: 0.013, // 0.01 * 1.3
  christmas: 0.0195, // 0.015 * 1.3 - Superior a legendary!
  valentine: 0.01495, // 0.013 * 1.15 - 15% más que legendary
};

// Personaje starter gratuito al registrarse (sin bonus, 0.0025 DOGE/hora)
export const starterCharacter: DogeCharacter = {
  id: "doge-starter",
  name: "DOGNUS",
  image: dogeStarter,
  rarity: "starter",
  miningRate: 0.0025, // Tasa fija sin bonus
};

export const characters: DogeCharacter[] = [
  // 7 Common (0.00195 DOGE/hour - base 0.0015 + 30% boost)
  { id: "builder", name: "Doge Builder", image: dogeBuilder, rarity: "common", miningRate: 0.00195 },
  { id: "astronaut", name: "Doge Astronaut", image: dogeAstronaut, rarity: "common", miningRate: 0.00195 },
  { id: "farmer", name: "Doge Farmer", image: dogeFarmer, rarity: "common", miningRate: 0.00195 },
  { id: "chef", name: "Doge Chef", image: dogeChef, rarity: "common", miningRate: 0.00195 },
  { id: "mechanic", name: "Doge Mechanic", image: dogeMechanic, rarity: "common", miningRate: 0.00195 },
  { id: "artist", name: "Doge Artist", image: dogeArtist, rarity: "common", miningRate: 0.00195 },
  { id: "explorer", name: "Doge Explorer", image: dogeExplorer, rarity: "common", miningRate: 0.00195 },
  
  // 6 Rare (0.00455 DOGE/hour - base 0.0035 + 30% boost)
  { id: "pirate", name: "Doge Pirate", image: dogePirate, rarity: "rare", miningRate: 0.00455 },
  { id: "ninja", name: "Doge Ninja", image: dogeNinja, rarity: "rare", miningRate: 0.00455 },
  { id: "samurai", name: "Doge Samurai", image: dogeSamurai, rarity: "rare", miningRate: 0.00455 },
  { id: "knight", name: "Doge Knight", image: dogeKnight, rarity: "rare", miningRate: 0.00455 },
  { id: "viking", name: "Doge Viking", image: dogeViking, rarity: "rare", miningRate: 0.00455 },
  { id: "gladiator", name: "Doge Gladiator", image: dogeGladiator, rarity: "rare", miningRate: 0.00455 },
  
  // 4 Epic (0.00975 DOGE/hour - base 0.0075 + 30% boost)
  { id: "wizard", name: "Doge Wizard", image: dogeWizard, rarity: "epic", miningRate: 0.00975 },
  { id: "cyberpunk", name: "Doge Cyberpunk", image: dogeCyberpunk, rarity: "epic", miningRate: 0.00975 },
  { id: "vampire", name: "Doge Vampire", image: dogeVampire, rarity: "epic", miningRate: 0.00975 },
  { id: "phoenix", name: "Doge Phoenix", image: dogePhoenix, rarity: "epic", miningRate: 0.00975 },
  
  // 3 Legendary (0.013 DOGE/hour - base 0.01 + 30% boost)
  { id: "king", name: "Doge King", image: dogeKing, rarity: "legendary", miningRate: 0.013 },
  { id: "gold", name: "Doge Gold", image: dogeGold, rarity: "legendary", miningRate: 0.013 },
  { id: "dragon", name: "Doge Dragon", image: dogeDragon, rarity: "legendary", miningRate: 0.013 },
];

// Christmas Special Characters (0.0195 DOGE/hour - Superior a legendary!)
export const christmasCharacters: DogeCharacter[] = [
  { id: "santa-doge", name: "Santa Doge", image: dogeKing, rarity: "christmas", miningRate: 0.0195 },
  { id: "elf-doge", name: "Elf Doge", image: dogeWizard, rarity: "christmas", miningRate: 0.0195 },
  { id: "snowman-doge", name: "Snowman Doge", image: dogeGold, rarity: "christmas", miningRate: 0.0195 },
  { id: "reindeer-doge", name: "Reindeer Doge", image: dogeDragon, rarity: "christmas", miningRate: 0.0195 },
];

// Valentine Special Characters (0.01495 DOGE/hour - 15% más que legendary!)
export const valentineCharacters: DogeCharacter[] = [
  { id: "cupid-doge", name: "Cupid Doge", image: dogeCupid, rarity: "valentine", miningRate: 0.01495 },
  { id: "romeo-doge", name: "Romeo Doge", image: dogeRomeo, rarity: "valentine", miningRate: 0.01495 },
  { id: "lovefairy-doge", name: "Love Fairy Doge", image: dogeLovefairy, rarity: "valentine", miningRate: 0.01495 },
  { id: "heartknight-doge", name: "Heart Knight Doge", image: dogeHeartknight, rarity: "valentine", miningRate: 0.01495 },
  { id: "lovequeen-doge", name: "Love Queen Doge", image: dogeLovequeen, rarity: "valentine", miningRate: 0.01495 },
];


export const rarityConfig = {
  starter: {
    label: "Starter",
    color: "from-amber-400 to-yellow-500",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
    glowColor: "shadow-amber-400/50",
  },
  common: {
    label: "Common",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    glowColor: "shadow-gray-400/50",
  },
  rare: {
    label: "Rare",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    glowColor: "shadow-blue-400/50",
  },
  epic: {
    label: "Epic",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
    glowColor: "shadow-purple-400/50",
  },
  legendary: {
    label: "Legendary",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
    glowColor: "shadow-yellow-400/50",
  },
  christmas: {
    label: "🎄 Christmas",
    color: "from-red-500 via-green-500 to-red-500",
    bgColor: "bg-gradient-to-r from-red-100 to-green-100",
    textColor: "text-red-600",
    glowColor: "shadow-red-400/50",
  },
  valentine: {
    label: "💕 Valentine",
    color: "from-pink-400 via-rose-500 to-pink-600",
    bgColor: "bg-gradient-to-r from-pink-100 to-rose-100",
    textColor: "text-pink-600",
    glowColor: "shadow-pink-400/50",
  },
};

export interface BoxType {
  id: string;
  name: string;
  price: number; // in DOGE
  dropRates: Record<Rarity, number>;
  gradient: string;
  description: string;
}

// Precios en DOGE
export const boxTypes: BoxType[] = [
  {
    id: "common",
    name: "Common Box",
    price: 1,
    dropRates: { starter: 0, common: 100, rare: 0, epic: 0, legendary: 0, christmas: 0, valentine: 0 },
    gradient: "from-gray-500 to-gray-700",
    description: "Solo personajes comunes garantizados",
  },
  {
    id: "rare",
    name: "Rare Box",
    price: 4,
    dropRates: { starter: 0, common: 40, rare: 40, epic: 20, legendary: 0, christmas: 0, valentine: 0 },
    gradient: "from-blue-500 to-indigo-600",
    description: "40% común, 40% raro, 20% épico",
  },
  {
    id: "legendary",
    name: "Legendary Box",
    price: 9,
    dropRates: { starter: 0, common: 0, rare: 40, epic: 40, legendary: 20, christmas: 0, valentine: 0 },
    gradient: "from-yellow-500 to-amber-600",
    description: "40% raro, 40% épico, 20% legendario",
  },
  {
    id: "christmas",
    name: "🎄 Christmas Box",
    price: 15,
    dropRates: { starter: 0, common: 0, rare: 0, epic: 30, legendary: 40, christmas: 30, valentine: 0 },
    gradient: "from-red-500 via-green-500 to-red-500",
    description: "¡Edición limitada! 30% épico, 40% legendario, 30% Christmas",
  },
  {
    id: "valentine",
    name: "💕 Valentine Box",
    price: 30,
    dropRates: { starter: 0, common: 0, rare: 0, epic: 0, legendary: 0, christmas: 0, valentine: 100 },
    gradient: "from-pink-500 via-rose-500 to-pink-600",
    description: "¡San Valentín! 100% personaje Valentine (+15% minado vs Legendary)",
  },
  {
    id: "supreme",
    name: "👑 Supreme Box",
    price: 20,
    dropRates: { starter: 0, common: 0, rare: 20, epic: 50, legendary: 30, christmas: 0, valentine: 0 },
    gradient: "from-purple-600 via-pink-500 to-amber-500",
    description: "¡La mejor caja! 20% raro, 50% épico, 30% legendario",
  },
];

export function getRandomCharacter(dropRates: Record<Rarity, number>, boxId?: string): DogeCharacter {
  const random = Math.random() * 100;
  let cumulative = 0;
  let selectedRarity: Rarity = "common";

  for (const [rarity, rate] of Object.entries(dropRates) as [Rarity, number][]) {
    cumulative += rate;
    if (random <= cumulative) {
      selectedRarity = rarity;
      break;
    }
  }

  // Si es Christmas rarity, usar los personajes navideños
  if (selectedRarity === "christmas") {
    return christmasCharacters[Math.floor(Math.random() * christmasCharacters.length)];
  }

  // Si es Valentine rarity, usar los personajes de San Valentín
  if (selectedRarity === "valentine") {
    return valentineCharacters[Math.floor(Math.random() * valentineCharacters.length)];
  }

  const charactersOfRarity = characters.filter((c) => c.rarity === selectedRarity);
  return charactersOfRarity[Math.floor(Math.random() * charactersOfRarity.length)];
}

// Format DOGE with 8 decimals
export const formatDoge = (amount: number): string => {
  return amount.toFixed(8);
};
