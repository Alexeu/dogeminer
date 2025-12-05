import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Plus, ExternalLink, Coins, Timer, CheckCircle, Loader2 } from "lucide-react";

const COST_PER_VIEW = 0.003575; // 55 BONK * 0.000065 DOGE
const REWARD_PER_VIEW = 0.0013; // 20 BONK * 0.000065 DOGE
const MIN_VIEWS = 1000;

interface Ad {
  id: string;
  user_id: string;
  title: string;
  description: string;
  url: string;
  total_views: number;
  remaining_views: number;
  is_active: boolean;
}

interface AdViewResponse {
  success: boolean;
  error?: string;
  new_balance?: number;
  reward?: number;
}

export default function PTCSection() {
  const { user } = useAuth();
  const { balance, subtractBalance, refreshBalance } = useDogeBalance();
  const [ads, setAds] = useState<Ad[]>([]);
  const [viewedAds, setViewedAds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewingAd, setViewingAd] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [views, setViews] = useState(MIN_VIEWS);

  const totalCost = views * COST_PER_VIEW;

  useEffect(() => {
    if (user) {
      fetchAds();
      fetchViewedAds();
    }
  }, [user]);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .gt("remaining_views", 0)
        .neq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewedAds = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("ad_views")
        .select("ad_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setViewedAds(new Set(data?.map(v => v.ad_id) || []));
    } catch (error) {
      console.error("Error fetching viewed ads:", error);
    }
  };

  const handleViewAd = async (ad: Ad) => {
    if (!user || viewedAds.has(ad.id)) return;

    setViewingAd(ad.id);
    setCountdown(10);

    // Open the ad URL in a new tab
    window.open(ad.url, "_blank");

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeView(ad);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeView = async (ad: Ad) => {
    if (!user) return;

    try {
      // Use secure RPC to claim ad view reward
      const { data, error } = await supabase.rpc('claim_ad_view_reward', {
        p_ad_id: ad.id
      });

      if (error) throw error;

      const result = data as unknown as AdViewResponse;
      if (result?.success) {
        // Update local state
        setViewedAds(new Set([...viewedAds, ad.id]));
        setAds(ads.map(a => 
          a.id === ad.id 
            ? { ...a, remaining_views: a.remaining_views - 1 }
            : a
        ).filter(a => a.remaining_views > 0));
        
        await refreshBalance();
        toast.success(`¡Ganaste ${(result.reward || REWARD_PER_VIEW).toFixed(4)} DOGE!`);
      } else {
        if (result?.error === 'Already viewed this ad') {
          toast.error("Ya has visto este anuncio");
          setViewedAds(new Set([...viewedAds, ad.id]));
        } else {
          toast.error(result?.error || "Error al procesar la visualización");
        }
      }
    } catch (error: any) {
      console.error("Error completing view:", error);
      toast.error("Error al procesar la visualización");
    } finally {
      setViewingAd(null);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (views < MIN_VIEWS) {
      toast.error(`El mínimo de visualizaciones es ${MIN_VIEWS}`);
      return;
    }

    if (balance < totalCost) {
      toast.error(`Necesitas ${totalCost.toFixed(4)} DOGE para crear este anuncio`);
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error("URL inválida");
      return;
    }

    setCreating(true);

    try {
      // Subtract balance first (database-backed)
      const success = await subtractBalance(totalCost);
      if (!success) {
        toast.error("Balance insuficiente");
        setCreating(false);
        return;
      }

      // Create the ad
      const { error } = await supabase
        .from("ads")
        .insert({
          user_id: user.id,
          title,
          description,
          url,
          total_views: views,
          remaining_views: views,
          cost_per_view: COST_PER_VIEW,
          reward_per_view: REWARD_PER_VIEW,
        });

      if (error) {
        // Note: Balance was already deducted via subtract_balance RPC
        // In a production app, you'd want a transaction here
        throw error;
      }

      toast.success("¡Anuncio creado exitosamente!");
      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      setUrl("");
      setViews(MIN_VIEWS);
      fetchAds();
    } catch (error) {
      console.error("Error creating ad:", error);
      toast.error("Error al crear el anuncio");
    } finally {
      setCreating(false);
    }
  };

  const availableAds = ads.filter(ad => !viewedAds.has(ad.id));

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">PTC</span> - Paid to Click
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gana <span className="text-primary font-bold">{REWARD_PER_VIEW.toFixed(4)} DOGE</span> por cada anuncio que veas, 
            o crea tu propio anuncio por <span className="text-amber-500 font-bold">{COST_PER_VIEW.toFixed(4)} DOGE</span> por visualización
          </p>
        </div>

        {/* Stats and Create Button */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
            <Eye className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">{availableAds.length} anuncios disponibles</span>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90">
                <Plus className="w-5 h-5 mr-2" />
                Crear Anuncio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Anuncio</DialogTitle>
                <DialogDescription>
                  Costo: {COST_PER_VIEW.toFixed(4)} DOGE por visualización (mín. {MIN_VIEWS} visualizaciones)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título del anuncio"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tu anuncio..."
                    maxLength={500}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="views">Número de visualizaciones</Label>
                  <Input
                    id="views"
                    type="number"
                    min={MIN_VIEWS}
                    step={100}
                    value={views}
                    onChange={(e) => setViews(Math.max(MIN_VIEWS, parseInt(e.target.value) || MIN_VIEWS))}
                    required
                  />
                </div>
                
                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Visualizaciones:</span>
                    <span className="font-medium">{views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Costo por vista:</span>
                    <span className="font-medium">{COST_PER_VIEW.toFixed(4)} DOGE</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">{totalCost.toFixed(4)} DOGE</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={creating || balance < totalCost}
                >
                  {creating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : balance < totalCost ? (
                    `Necesitas ${(totalCost - balance).toFixed(4)} DOGE más`
                  ) : (
                    "Crear Anuncio"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ads Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : availableAds.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl">
            <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No hay anuncios disponibles</h3>
            <p className="text-muted-foreground">Vuelve más tarde o crea tu propio anuncio</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAds.map((ad) => (
              <div
                key={ad.id}
                className="glass rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold line-clamp-1">{ad.title}</h3>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    <Coins className="w-3 h-3" />
                    <span>{REWARD_PER_VIEW.toFixed(4)}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {ad.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Eye className="w-4 h-4" />
                  <span>{ad.remaining_views} visualizaciones restantes</span>
                </div>

                {viewingAd === ad.id ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/20 text-amber-500">
                    <Timer className="w-5 h-5 animate-pulse" />
                    <span className="font-bold">{countdown}s</span>
                  </div>
                ) : viewedAds.has(ad.id) ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 text-emerald-500">
                    <CheckCircle className="w-5 h-5" />
                    <span>Ya visto</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleViewAd(ad)}
                    className="w-full bg-gradient-to-r from-primary to-amber-500"
                    disabled={viewingAd !== null}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver y Ganar {REWARD_PER_VIEW.toFixed(4)} DOGE
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
