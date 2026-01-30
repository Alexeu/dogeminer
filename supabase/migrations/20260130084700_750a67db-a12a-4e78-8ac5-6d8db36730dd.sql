-- Fix character_rarity values to use lowercase and valid rarities
UPDATE user_characters 
SET character_rarity = LOWER(character_rarity)
WHERE character_rarity != LOWER(character_rarity);

-- Convert 'uncommon' to 'common' since 'uncommon' doesn't exist in the system
UPDATE user_characters 
SET character_rarity = 'common'
WHERE LOWER(character_rarity) = 'uncommon';