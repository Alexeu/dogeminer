import { useState, useEffect } from "react";
import { useBonkBalance } from "@/contexts/BonkBalanceContext";
import { Button } from "@/components/ui/button";
import { Copy, Users, Gift, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ReferralSection = () => {
  const { referralCode, totalEarned, applyReferralCode } = useBonkBalance();
  const { user } = useAuth();
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasAppliedCode, setHasAppliedCode] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  // Check if user has already applied a referral code
  useEffect(() => {
    const checkReferralStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', user.id)
        .maybeSingle();
      
      setHasAppliedCode(!!data?.referred_by);
    };
    
    checkReferralStatus();
  }, [user]);

  // Get referral count
  useEffect(() => {
    const fetchReferralCount = async () => {
      if (!referralCode) return;
      
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', referralCode);
      
      setReferralCount(count || 0);
    };
    
    fetchReferralCount();
  }, [referralCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Código copiado al portapapeles!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) {
      toast.error("Ingresa un código de referido");
      return;
    }
    if (inputCode.toUpperCase() === referralCode) {
      toast.error("No puedes usar tu propio código");
      return;
    }
    if (hasAppliedCode) {
      toast.error("Ya has aplicado un código de referido");
      return;
    }
    
    setIsApplying(true);
    const success = await applyReferralCode(inputCode.toUpperCase());
    setIsApplying(false);
    
    if (success) {
      setHasAppliedCode(true);
      setInputCode("");
      toast.success("¡Código aplicado! Recibirás 500 BONK de bienvenida");
    } else {
      toast.error("Código de referido inválido");
    }
  };

  const formatNumber = (num: number) => num.toLocaleString("en-US");

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Programa de Referidos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Invita Amigos, <span className="text-gradient">Gana BONK</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gana el <span className="text-primary font-bold">5%</span> de todo el BONK que tus referidos generen por minado pasivo. ¡Sin límites!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Your referral code */}
          <div className="glass rounded-3xl p-6 space-y-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Tu Código de Referido</h3>
                <p className="text-sm text-muted-foreground">Compártelo con amigos</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-background/50 rounded-xl px-4 py-3 font-mono text-lg font-bold text-center border border-border">
                {referralCode || "Cargando..."}
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="px-4"
                disabled={!referralCode}
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-background/50 rounded-xl p-4 text-center border border-border">
                <div className="text-2xl font-bold text-primary">{referralCount}</div>
                <div className="text-sm text-muted-foreground">Referidos</div>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-border">
                <div className="text-2xl font-bold text-gradient">{formatNumber(Math.floor(totalEarned))}</div>
                <div className="text-sm text-muted-foreground">BONK Totales</div>
              </div>
            </div>
          </div>

          {/* Apply referral code */}
          <div className="glass rounded-3xl p-6 space-y-4 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">¿Tienes un Código?</h3>
                <p className="text-sm text-muted-foreground">Aplícalo y recibe 500 BONK</p>
              </div>
            </div>

            {hasAppliedCode ? (
              <div className="bg-green-100 text-green-700 rounded-xl p-4 text-center">
                <Check className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">¡Ya tienes un código aplicado!</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Ingresa el código"
                  className="w-full bg-background/50 rounded-xl px-4 py-3 font-mono text-lg text-center border border-border focus:border-primary focus:outline-none transition-colors"
                  maxLength={8}
                />
                <Button
                  onClick={handleApplyCode}
                  disabled={isApplying}
                  className="w-full gradient-primary hover:opacity-90 text-white font-bold py-3"
                >
                  {isApplying ? "Aplicando..." : "Aplicar Código"}
                </Button>
              </>
            )}

            {/* How it works */}
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cómo funciona:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tu referidor gana 5% de tu minado</li>
                <li>• Tú recibes 500 BONK de bienvenida</li>
                <li>• ¡Las ganancias son permanentes!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;
