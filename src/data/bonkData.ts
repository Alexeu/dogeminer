import bonkBuilder from "@/assets/bonk-builder.png";
import bonkPirate from "@/assets/bonk-pirate.png";
import bonkWizard from "@/assets/bonk-wizard.png";
import bonkGold from "@/assets/bonk-gold.png";
import bonkKing from "@/assets/bonk-king.png";
import bonkNinja from "@/assets/bonk-ninja.png";
import bonkAstronaut from "@/assets/bonk-astronaut.png";
import bonkCyberpunk from "@/assets/bonk-cyberpunk.png";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface BonkCharacter {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  miningRate: number; // BONK per hour
}

// Mining rates per hour by rarity
export const miningRatesByRarity: Record<Rarity, number> = {
  common: 22,
  rare: 31,
  epic: 40,
  legendary: 50,
};

export const characters: BonkCharacter[] = [
  // 7 Common (22 BONK/hour)
  { id: "builder", name: "Bonk Builder", image: bonkBuilder, rarity: "common", miningRate: 22 },
  { id: "astronaut", name: "Bonk Astronaut", image: bonkAstronaut, rarity: "common", miningRate: 22 },
  { id: "farmer", name: "Bonk Farmer", image: bonkBuilder, rarity: "common", miningRate: 22 },
  { id: "chef", name: "Bonk Chef", image: bonkAstronaut, rarity: "common", miningRate: 22 },
  { id: "mechanic", name: "Bonk Mechanic", image: bonkBuilder, rarity: "common", miningRate: 22 },
  { id: "artist", name: "Bonk Artist", image: bonkAstronaut, rarity: "common", miningRate: 22 },
  { id: "explorer", name: "Bonk Explorer", image: bonkBuilder, rarity: "common", miningRate: 22 },
  
  // 6 Rare (31 BONK/hour)
  { id: "pirate", name: "Bonk Pirate", image: bonkPirate, rarity: "rare", miningRate: 31 },
  { id: "ninja", name: "Bonk Ninja", image: bonkNinja, rarity: "rare", miningRate: 31 },
  { id: "samurai", name: "Bonk Samurai", image: bonkPirate, rarity: "rare", miningRate: 31 },
  { id: "knight", name: "Bonk Knight", image: bonkNinja, rarity: "rare", miningRate: 31 },
  { id: "viking", name: "Bonk Viking", image: bonkPirate, rarity: "rare", miningRate: 31 },
  { id: "gladiator", name: "Bonk Gladiator", image: bonkNinja, rarity: "rare", miningRate: 31 },
  
  // 4 Epic (40 BONK/hour)
  { id: "wizard", name: "Bonk Wizard", image: bonkWizard, rarity: "epic", miningRate: 40 },
  { id: "cyberpunk", name: "Bonk Cyberpunk", image: bonkCyberpunk, rarity: "epic", miningRate: 40 },
  { id: "vampire", name: "Bonk Vampire", image: bonkWizard, rarity: "epic", miningRate: 40 },
  { id: "phoenix", name: "Bonk Phoenix", image: bonkCyberpunk, rarity: "epic", miningRate: 40 },
  
  // 3 Legendary (50 BONK/hour)
  { id: "king", name: "Bonk King", image: bonkKing, rarity: "legendary", miningRate: 50 },
  { id: "gold", name: "Bonk Gold", image: bonkGold, rarity: "legendary", miningRate: 50 },
  { id: "dragon", name: "Bonk Dragon", image: bonkKing, rarity: "legendary", miningRate: 50 },
];

export const rarityConfig = {
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
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
    glowColor: "shadow-amber-400/50",
  },
};

export interface BoxType {
  id: string;
  name: string;
  price: number;
  dropRates: Record<Rarity, number>;
  gradient: string;
  description: string;
}

export const boxTypes: BoxType[] = [
  {
    id: "basic",
    name: "Basic Box",
    price: 5000,
    dropRates: { common: 70, rare: 22, epic: 7, legendary: 1 },
    gradient: "from-gray-500 to-gray-700",
    description: "Standard mystery box with decent drop rates",
  },
  {
    id: "premium",
    name: "Premium Box",
    price: 80000,
    dropRates: { common: 45, rare: 35, epic: 15, legendary: 5 },
    gradient: "from-blue-500 to-indigo-600",
    description: "Better chances for rare and epic BONKs",
  },
  {
    id: "legendary",
    name: "Legendary Box",
    price: 250000,
    dropRates: { common: 20, rare: 35, epic: 30, legendary: 15 },
    gradient: "from-amber-500 to-orange-600",
    description: "Highest chance for legendary BONKs!",
  },
];

export function getRandomCharacter(dropRates: Record<Rarity, number>): BonkCharacter {
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
