import { useState, useEffect } from "react";
import { Ticket, Trophy, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { characters, rarityConfig, DogeCharacter } from "@/data/dogeData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LotteryPool {
  id: string;
  character_id: string;
  character_name: string;
  character_rarity: string;
  ticket_price: number;
  total_tickets: number;
  sold_tickets: number;
  status: string;
  winner_user_id: string | null;
}

interface UserTickets {
  pool_id: string;
  ticket_count: number;
}

const LotterySection = () => {
  const { user } = useAuth();
  const [pools, setPools] = useState<LotteryPool[]>([]);
  const [userTickets, setUserTickets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [buyingTickets, setBuyingTickets] = useState<string | null>(null);
  const [ticketAmounts, setTicketAmounts] = useState<Record<string, number>>({});

  // Get rare and epic characters for lottery
  const rareCharacters = characters.filter(c => c.rarity === "rare");
  const epicCharacters = characters.filter(c => c.rarity === "epic");

  useEffect(() => {
    fetchPools();
    if (user) {
      fetchUserTickets();
    }
  }, [user]);

  const fetchPools = async () => {
    const { data, error } = await supabase
      .from("lottery_pools")
      .select("*")
      .in("status", ["active", "completed"]);

    if (error) {
      console.error("Error fetching pools:", error);
    } else {
      setPools(data || []);
    }
    setLoading(false);
  };

  const fetchUserTickets = async () => {
    const { data, error } = await supabase
      .from("lottery_tickets")
      .select("pool_id, ticket_count");

    if (error) {
      console.error("Error fetching tickets:", error);
    } else {
      const ticketMap: Record<string, number> = {};
      data?.forEach((t: UserTickets) => {
        ticketMap[t.pool_id] = t.ticket_count;
      });
      setUserTickets(ticketMap);
    }
  };

  const buyTickets = async (poolId: string, amount: number) => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return;
    }

    setBuyingTickets(poolId);

    const { data, error } = await supabase.rpc("buy_lottery_tickets", {
      p_pool_id: poolId,
      p_ticket_count: amount,
    });

    setBuyingTickets(null);

    if (error) {
      toast.error("Error al comprar tickets");
      console.error(error);
      return;
    }

    const result = data as { success: boolean; error?: string; tickets_bought?: number };

    if (!result.success) {
      toast.error(result.error || "Error al comprar tickets");
      return;
    }

    toast.success(`¡Compraste ${amount} tickets!`);
    fetchPools();
    fetchUserTickets();
    setTicketAmounts({ ...ticketAmounts, [poolId]: 1 });
  };

  const getCharacterImage = (characterId: string): string => {
    const character = characters.find(c => c.id === characterId);
    return character?.image || "";
  };

  const getCharacterByPool = (pool: LotteryPool): DogeCharacter | undefined => {
    return characters.find(c => c.id === pool.character_id);
  };

  // Filter to show active pools
  const activePools = pools.filter(p => p.status === "active");
  const completedPools = pools.filter(p => p.status === "completed").slice(0, 3);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="lottery" className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Ticket className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Lotería DOGE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¡Gana Personajes en la Lotería!
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compra tickets para participar en sorteos de personajes raros y épicos. 
            Cuando se vendan los 5000 tickets, ¡un ganador será elegido al azar!
          </p>
        </div>

        {/* Pricing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarityConfig.rare.color} flex items-center justify-center`}>
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-400">Personajes Raros</p>
                <p className="text-muted-foreground">0.0065 DOGE / ticket</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarityConfig.epic.color} flex items-center justify-center`}>
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-purple-400">Personajes Épicos</p>
                <p className="text-muted-foreground">0.013 DOGE / ticket</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Lotteries */}
        {activePools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activePools.map((pool) => {
              const character = getCharacterByPool(pool);
              const rarity = pool.character_rarity as keyof typeof rarityConfig;
              const config = rarityConfig[rarity] || rarityConfig.rare;
              const progress = (pool.sold_tickets / pool.total_tickets) * 100;
              const myTickets = userTickets[pool.id] || 0;
              const ticketAmount = ticketAmounts[pool.id] || 1;

              return (
                <Card 
                  key={pool.id} 
                  className={`relative overflow-hidden border-2 ${
                    rarity === "epic" ? "border-purple-500/30" : "border-blue-500/30"
                  }`}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5`} />
                  
                  <CardContent className="relative p-6">
                    {/* Character Image */}
                    <div className="flex justify-center mb-4">
                      <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${config.color} p-1`}>
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                          <img 
                            src={getCharacterImage(pool.character_id)} 
                            alt={pool.character_name}
                            className="w-20 h-20 object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Character Info */}
                    <div className="text-center mb-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${config.bgColor} ${config.textColor} mb-2`}>
                        {config.label}
                      </span>
                      <h3 className="font-bold text-lg text-foreground">{pool.character_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {character?.miningRate} DOGE/hora
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Tickets vendidos</span>
                        <span className="font-bold text-foreground">
                          {pool.sold_tickets.toLocaleString()} / {pool.total_tickets.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    {/* My Tickets */}
                    {myTickets > 0 && (
                      <div className="bg-primary/10 rounded-lg p-3 mb-4 text-center">
                        <p className="text-sm text-muted-foreground">Tus tickets</p>
                        <p className="text-xl font-bold text-primary">{myTickets}</p>
                        <p className="text-xs text-muted-foreground">
                          {((myTickets / pool.total_tickets) * 100).toFixed(2)}% probabilidad
                        </p>
                      </div>
                    )}

                    {/* Buy Tickets */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketAmounts({ 
                            ...ticketAmounts, 
                            [pool.id]: Math.max(1, ticketAmount - 1) 
                          })}
                          disabled={ticketAmount <= 1}
                        >
                          -
                        </Button>
                        <input
                          type="number"
                          value={ticketAmount}
                          onChange={(e) => setTicketAmounts({ 
                            ...ticketAmounts, 
                            [pool.id]: Math.max(1, parseInt(e.target.value) || 1) 
                          })}
                          className="w-20 text-center bg-muted rounded px-2 py-1 text-foreground"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketAmounts({ 
                            ...ticketAmounts, 
                            [pool.id]: ticketAmount + 1 
                          })}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90`}
                        onClick={() => buyTickets(pool.id, ticketAmount)}
                        disabled={buyingTickets === pool.id}
                      >
                        {buyingTickets === pool.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Ticket className="w-4 h-4 mr-2" />
                        )}
                        Comprar ({(pool.ticket_price * ticketAmount).toFixed(4)} DOGE)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mb-12 bg-muted/30">
            <CardContent className="p-12 text-center">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No hay loterías activas</h3>
              <p className="text-muted-foreground">
                Las nuevas loterías se abrirán pronto. ¡Vuelve a consultar!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Winners */}
        {completedPools.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Ganadores Recientes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedPools.map((pool) => {
                const config = rarityConfig[pool.character_rarity as keyof typeof rarityConfig] || rarityConfig.rare;
                return (
                  <Card key={pool.id} className="bg-muted/30">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} p-0.5`}>
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                          <img 
                            src={getCharacterImage(pool.character_id)} 
                            alt={pool.character_name}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{pool.character_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          5000 participantes
                        </p>
                      </div>
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LotterySection;
