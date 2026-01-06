import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ExternalLink, Gift, Clock, Zap } from "lucide-react";

interface Offerwall {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  minReward: number;
  maxReward: number;
  color: string;
}

const OfferwallsSection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loadingWall, setLoadingWall] = useState<string | null>(null);

  const offerwalls: Offerwall[] = [
    {
      id: "timewall",
      name: "Timewall",
      description: t("offerwalls.timewallDesc"),
      icon: "⏰",
      url: `https://timewall.io/offerwall/${user?.id || ""}`,
      minReward: 10,
      maxReward: 5000,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "bitcotask",
      name: "Bitcotask",
      description: t("offerwalls.bitcotaskDesc"),
      icon: "₿",
      url: `https://bitcotask.com/offerwall?uid=${user?.id || ""}`,
      minReward: 5,
      maxReward: 10000,
      color: "from-orange-500 to-yellow-500",
    },
  ];

  const handleOpenOfferwall = (wall: Offerwall) => {
    setLoadingWall(wall.id);
    window.open(wall.url, "_blank", "noopener,noreferrer");
    setTimeout(() => setLoadingWall(null), 1000);
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              {t("offerwalls.title")}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("offerwalls.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {offerwalls.map((wall) => (
            <Card
              key={wall.id}
              className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <CardHeader className={`bg-gradient-to-r ${wall.color} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{wall.icon}</span>
                    <CardTitle className="text-2xl">{wall.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    {t("offerwalls.hot")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">{wall.description}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t("offerwalls.instant")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium">
                      {wall.minReward} - {wall.maxReward} DOGE
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenOfferwall(wall)}
                  disabled={loadingWall === wall.id}
                  className="w-full gap-2"
                  size="lg"
                >
                  {loadingWall === wall.id ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  {t("offerwalls.openButton")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            {t("offerwalls.tipsTitle")}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t("offerwalls.tip1")}</li>
            <li>• {t("offerwalls.tip2")}</li>
            <li>• {t("offerwalls.tip3")}</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default OfferwallsSection;
