import { Mail, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const SupportSection = () => {
  const { t } = useLanguage();
  const supportEmail = "rpgdoge30@gmail.com";

  const handleEmailClick = () => {
    window.location.href = `mailto:${supportEmail}?subject=Soporte DOGEMiner`;
  };

  return (
    <section id="support" className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('support.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('support.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('support.subtitle')}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          
          <h3 className="text-xl font-bold mb-4">{t('support.contactUs')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('support.description')}
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/50 border border-border">
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm">{supportEmail}</span>
            </div>
            
            <Button 
              onClick={handleEmailClick}
              className="gap-2"
              size="lg"
            >
              <Mail className="w-4 h-4" />
              {t('support.sendEmail')}
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {t('support.responseTime')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
