import { useState, useEffect } from "react";
import { characters, starterCharacter, rarityConfig, DogeCharacter } from "@/data/dogeData";
import { useInventory } from "@/contexts/InventoryContext";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Gift, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const COLLECTION_REWARD = 45.5; // Recompensa por colección completa en DOGE

// All characters including starter
const allCharacters: DogeCharacter[] = [starterCharacter, ...characters];
const TOTAL_CHARACTERS = allCharacters.length;

interface ClaimResponse {
  success: boolean;
  error?: string;
  new_balance?: number;
  reward?: number;
}

const CollectionSection = () => {
  const { inventory } = useInventory();
  const { refreshBalance } = useDogeBalance();
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if reward was already claimed (from database)
  useEffect(() => {
    const checkClaimStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('collection_reward_claimed_at')
            .eq('id', user.id)
            .single();
          
          setRewardClaimed(!!data?.collection_reward_claimed_at);
        }
      } catch (error) {
        console.error('Error checking claim status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkClaimStatus();
  }, []);

  // Get collected character IDs
  const collectedIds = new Set(inventory.map((item) => item.character.id));
  const collectedCount = collectedIds.size;
  const isCollectionComplete = collectedCount >= TOTAL_CHARACTERS;

  const handleClaimReward = async () => {
    if (!isCollectionComplete || rewardClaimed || isClaiming) return;
    
    setIsClaiming(true);
    try {
      const { data, error } = await supabase.rpc('claim_collection_reward');
      
      if (error) throw error;
      
      const result = data as unknown as ClaimResponse;
      if (result?.success) {
        setRewardClaimed(true);
        await refreshBalance();
        toast.success(`¡Felicidades! Has recibido ${COLLECTION_REWARD} DOGE por completar la colección!`);
      } else {
        toast.error(result?.error || "Error al reclamar la recompensa");
      }
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast.error("Error al reclamar la recompensa");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <section id="collection" className="py-16 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Colección de Personajes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tu Colección
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Colecciona los {TOTAL_CHARACTERS} personajes únicos de DOGE. ¡Completa la colección para obtener una recompensa especial!
          </p>
          
          {/* Progress */}
          <div className="flex items-center justify-center gap-4">
            <div className="bg-card border border-border rounded-full px-6 py-2">
              <span className="text-2xl font-bold text-primary">{collectedCount}</span>
              <span className="text-muted-foreground"> / {TOTAL_CHARACTERS}</span>
            </div>
            <div className="w-48 h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
                style={{ width: `${(collectedCount / TOTAL_CHARACTERS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Collection Reward Banner */}
        <div className={`mb-8 p-4 rounded-xl border-2 ${
          isCollectionComplete && !rewardClaimed 
            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 animate-pulse" 
            : isCollectionComplete && rewardClaimed
            ? "bg-green-500/10 border-green-500"
            : "bg-card border-border"
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                isCollectionComplete ? "bg-amber-500/20" : "bg-secondary"
              }`}>
                <Gift className={`w-8 h-8 ${
                  isCollectionComplete ? "text-amber-500" : "text-muted-foreground"
                }`} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Recompensa por Colección Completa</h3>
                <p className="text-muted-foreground">
                  {isCollectionComplete && rewardClaimed 
                    ? "¡Ya has reclamado tu recompensa!" 
                    : `Obtén ${COLLECTION_REWARD} DOGE al completar los ${TOTAL_CHARACTERS} personajes`}
                </p>
              </div>
            </div>
            {isCollectionComplete && !rewardClaimed ? (
              <Button 
                onClick={handleClaimReward}
                disabled={isClaiming || isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
              >
                <Gift className="w-5 h-5 mr-2" />
                {isClaiming ? "Reclamando..." : `¡Reclamar ${COLLECTION_REWARD} DOGE!`}
              </Button>
            ) : isCollectionComplete && rewardClaimed ? (
              <div className="flex items-center gap-2 text-green-500 font-semibold">
                <Check className="w-5 h-5" />
                Reclamado
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                Te faltan {TOTAL_CHARACTERS - collectedCount} personajes
              </span>
            )}
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4">
          {allCharacters.map((character) => {
            const isCollected = collectedIds.has(character.id);
            const config = rarityConfig[character.rarity];
            const inventoryItem = inventory.find(item => item.character.id === character.id);
            const quantity = inventoryItem?.quantity || 0;

            return (
              <div
                key={character.id}
                className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${
                  isCollected 
                    ? "bg-card border-2 border-border hover:border-primary/50 hover:scale-105" 
                    : "bg-secondary/50 border-2 border-border/50"
                }`}
              >
                {/* Character Image */}
                <div className="aspect-square p-2 relative">
                  <img
                    src={character.image}
                    alt={character.name}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      isCollected ? "" : "grayscale brightness-[0.3] contrast-50"
                    }`}
                  />
                  
                  {/* Quantity Badge */}
                  {isCollected && quantity > 1 && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {quantity}
                    </div>
                  )}
                  
                  {/* Collected Checkmark */}
                  {isCollected && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  
                  {/* Lock Overlay for uncollected */}
                  {!isCollected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl opacity-30">?</span>
                    </div>
                  )}
                </div>

                {/* Character Info */}
                <div className={`p-2 text-center border-t ${isCollected ? "border-border" : "border-border/30"}`}>
                  <p className={`text-xs font-medium truncate ${
                    isCollected ? "text-foreground" : "text-muted-foreground/50"
                  }`}>
                    {isCollected ? character.name : "???"}
                  </p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-1 ${
                    isCollected 
                      ? `bg-gradient-to-r ${config.color} text-white` 
                      : "bg-secondary text-muted-foreground/50"
                  }`}>
                    {isCollected ? config.label : "?????"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats by Rarity */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
          {(["starter", "common", "rare", "epic", "legendary"] as const).map((rarity) => {
            const config = rarityConfig[rarity];
            const totalOfRarity = allCharacters.filter(c => c.rarity === rarity).length;
            const collectedOfRarity = allCharacters.filter(c => c.rarity === rarity && collectedIds.has(c.id)).length;
            
            return (
              <div key={rarity} className="bg-card border border-border rounded-lg p-3 text-center">
                <span className={`inline-block text-xs px-2 py-1 rounded-full bg-gradient-to-r ${config.color} text-white font-semibold mb-2`}>
                  {config.label}
                </span>
                <p className="text-lg font-bold">
                  {collectedOfRarity} / {totalOfRarity}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
