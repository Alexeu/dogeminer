import dogeBuilder from "@/assets/doge-builder.png";
import dogePirate from "@/assets/doge-pirate.png";
import dogeWizard from "@/assets/doge-wizard.png";
import dogeGold from "@/assets/doge-gold.png";
import dogeKing from "@/assets/doge-king.png";
import dogeNinja from "@/assets/doge-ninja.png";
import dogeAstronaut from "@/assets/doge-astronaut.png";
import dogeCyberpunk from "@/assets/doge-cyberpunk.png";
import dogeStarter from "@/assets/doge-starter.png";

export type Rarity = "starter" | "common" | "rare" | "epic" | "legendary";

export interface DogeCharacter {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  miningRate: number; // DOGE per hour (4 decimals)
}

// Mining rates per hour by rarity (in DOGE)
export const miningRatesByRarity: Record<Rarity, number> = {
  starter: 0.0004,
  common: 0.0044,
  rare: 0.0062,
  epic: 0.0080,
  legendary: 0.0100,
};

// Starter character given for free upon registration
export const starterCharacter: DogeCharacter = {
  id: "doge-starter",
  name: "Doge Starter",
  image: dogeStarter,
  rarity: "starter",
  miningRate: 0.0004,
};

export const characters: DogeCharacter[] = [
  // 7 Common (0.0044 DOGE/hour)
  { id: "builder", name: "Doge Builder", image: dogeBuilder, rarity: "common", miningRate: 0.0044 },
  { id: "astronaut", name: "Doge Astronaut", image: dogeAstronaut, rarity: "common", miningRate: 0.0044 },
  { id: "farmer", name: "Doge Farmer", image: dogeBuilder, rarity: "common", miningRate: 0.0044 },
  { id: "chef", name: "Doge Chef", image: dogeAstronaut, rarity: "common", miningRate: 0.0044 },
  { id: "mechanic", name: "Doge Mechanic", image: dogeBuilder, rarity: "common", miningRate: 0.0044 },
  { id: "artist", name: "Doge Artist", image: dogeAstronaut, rarity: "common", miningRate: 0.0044 },
  { id: "explorer", name: "Doge Explorer", image: dogeBuilder, rarity: "common", miningRate: 0.0044 },
  
  // 6 Rare (0.0062 DOGE/hour)
  { id: "pirate", name: "Doge Pirate", image: dogePirate, rarity: "rare", miningRate: 0.0062 },
  { id: "ninja", name: "Doge Ninja", image: dogeNinja, rarity: "rare", miningRate: 0.0062 },
  { id: "samurai", name: "Doge Samurai", image: dogePirate, rarity: "rare", miningRate: 0.0062 },
  { id: "knight", name: "Doge Knight", image: dogeNinja, rarity: "rare", miningRate: 0.0062 },
  { id: "viking", name: "Doge Viking", image: dogePirate, rarity: "rare", miningRate: 0.0062 },
  { id: "gladiator", name: "Doge Gladiator", image: dogeNinja, rarity: "rare", miningRate: 0.0062 },
  
  // 4 Epic (0.0080 DOGE/hour)
  { id: "wizard", name: "Doge Wizard", image: dogeWizard, rarity: "epic", miningRate: 0.0080 },
  { id: "cyberpunk", name: "Doge Cyberpunk", image: dogeCyberpunk, rarity: "epic", miningRate: 0.0080 },
  { id: "vampire", name: "Doge Vampire", image: dogeWizard, rarity: "epic", miningRate: 0.0080 },
  { id: "phoenix", name: "Doge Phoenix", image: dogeCyberpunk, rarity: "epic", miningRate: 0.0080 },
  
  // 3 Legendary (0.0100 DOGE/hour)
  { id: "king", name: "Doge King", image: dogeKing, rarity: "legendary", miningRate: 0.0100 },
  { id: "gold", name: "Doge Gold", image: dogeGold, rarity: "legendary", miningRate: 0.0100 },
  { id: "dragon", name: "Doge Dragon", image: dogeKing, rarity: "legendary", miningRate: 0.0100 },
];

// Ultra-rare mythic legendary (0.15% in legendary box)
export const mythicCharacter: DogeCharacter = {
  id: "doge-supreme",
  name: "Doge Supreme",
  image: dogeGold,
  rarity: "legendary",
  miningRate: 0.0200, // Double the normal legendary rate!
};

// Check if a character is the mythic one
export const isMythicCharacter = (id: string) => id === "doge-supreme";

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
};

export interface BoxType {
  id: string;
  name: string;
  price: number; // in DOGE (4 decimals)
  dropRates: Record<Rarity, number>;
  gradient: string;
  description: string;
}

export const boxTypes: BoxType[] = [
  {
    id: "common",
    name: "Common Box",
    price: 3.0000,
    dropRates: { starter: 0, common: 100, rare: 0, epic: 0, legendary: 0 },
    gradient: "from-gray-500 to-gray-700",
    description: "Solo personajes comunes garantizados",
  },
  {
    id: "rare",
    name: "Rare Box",
    price: 13.0000,
    dropRates: { starter: 0, common: 40, rare: 40, epic: 0, legendary: 20 },
    gradient: "from-blue-500 to-indigo-600",
    description: "40% común, 40% raro, 20% legendario",
  },
  {
    id: "legendary",
    name: "Legendary Box",
    price: 30.0000,
    dropRates: { starter: 0, common: 0, rare: 40, epic: 40, legendary: 20 },
    gradient: "from-yellow-500 to-amber-600",
    description: "40% raro, 40% épico, 20% legendario",
  },
];

export function getRandomCharacter(dropRates: Record<Rarity, number>, boxId?: string): DogeCharacter {
  // Special case: 0.15% chance for mythic in legendary box
  if (boxId === "legendary") {
    const mythicRoll = Math.random() * 100;
    if (mythicRoll <= 0.15) {
      return mythicCharacter;
    }
  }

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

  const charactersOfRarity = characters.filter((c) => c.rarity === selectedRarity);
  return charactersOfRarity[Math.floor(Math.random() * charactersOfRarity.length)];
}

// Format DOGE with 4 decimals
export const formatDoge = (amount: number): string => {
  return amount.toFixed(4);
};
