import { useState, useEffect } from "react";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Copy, Users, Gift, Check, Link } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ReferralSection = () => {
  const { referralCode, totalEarned, applyReferralCode } = useDogeBalance();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [hasAppliedCode, setHasAppliedCode] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [appliedReferrer, setAppliedReferrer] = useState<string | null>(null);

  // Generate referral link
  const referralLink = referralCode 
    ? `${window.location.origin}/?ref=${referralCode}` 
    : "";

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
      setAppliedReferrer(data?.referred_by || null);
    };
    
    checkReferralStatus();
  }, [user]);

  // Handle referral from URL parameter
  useEffect(() => {
    const handleRefParam = async () => {
      if (!user || hasAppliedCode) return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      if (refCode && refCode !== referralCode) {
        const success = await applyReferralCode(refCode.toUpperCase());
        if (success) {
          setHasAppliedCode(true);
          setAppliedReferrer(refCode.toUpperCase());
          toast.success(t('referral.codeApplied'));
          // Clean the URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };
    
    handleRefParam();
  }, [user, referralCode, hasAppliedCode, applyReferralCode, t]);

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
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t('referral.linkCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number) => num.toFixed(4);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{t('referral.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('referral.title')}<span className="text-gradient">{t('referral.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('referral.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Your referral link */}
          <div className="glass rounded-3xl p-6 space-y-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Link className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('referral.yourLink')}</h3>
                <p className="text-sm text-muted-foreground">{t('referral.shareWithFriends')}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-background/50 rounded-xl px-3 py-3 text-sm font-medium text-center border border-border overflow-hidden">
                <span className="block truncate">
                  {referralLink || t('common.loading')}
                </span>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="px-4 shrink-0"
                disabled={!referralCode}
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-background/50 rounded-xl p-4 text-center border border-border">
                <div className="text-2xl font-bold text-primary">{referralCount}</div>
                <div className="text-sm text-muted-foreground">{t('referral.referrals')}</div>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center border border-border">
                <div className="text-2xl font-bold text-gradient">{formatNumber(totalEarned)}</div>
                <div className="text-sm text-muted-foreground">{t('referral.totalDoge')}</div>
              </div>
            </div>
          </div>

          {/* Referral status */}
          <div className="glass rounded-3xl p-6 space-y-4 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <Gift className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('referral.status')}</h3>
                <p className="text-sm text-muted-foreground">{t('referral.yourLink2')}</p>
              </div>
            </div>

            {hasAppliedCode ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl p-4 text-center">
                <Check className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">{t('referral.linkedToReferrer')}</p>
                {appliedReferrer && (
                  <p className="text-sm mt-1 opacity-80">{t('auth.code')}: {appliedReferrer}</p>
                )}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium text-muted-foreground">{t('referral.noReferrer')}</p>
                <p className="text-sm mt-1 text-muted-foreground">
                  {t('referral.noReferrerDesc')}
                </p>
              </div>
            )}

            {/* How it works */}
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t('referral.howItWorks')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('referral.step1')}</li>
                <li>• {t('referral.step2')}</li>
                <li>• {t('referral.step3')}</li>
                <li>• {t('referral.step4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;
