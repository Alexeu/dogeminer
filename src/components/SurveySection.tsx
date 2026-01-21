import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Check, Loader2 } from "lucide-react";

const SurveySection = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [otherCoin, setOtherCoin] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [existingResponse, setExistingResponse] = useState<{
    response_type: string;
    other_coin?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      checkExistingResponse();
    }
  }, [user]);

  const checkExistingResponse = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("survey_responses")
      .select("response_type, other_coin")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) {
      setHasResponded(true);
      setExistingResponse(data);
      setSelectedOption(data.response_type);
      if (data.other_coin) {
        setOtherCoin(data.other_coin);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedOption) return;
    
    if (selectedOption === "yes_other" && !otherCoin.trim()) {
      toast({
        title: t("survey.errorTitle"),
        description: t("survey.errorCoin"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (hasResponded) {
        const { error } = await supabase
          .from("survey_responses")
          .update({
            response_type: selectedOption,
            other_coin: selectedOption === "yes_other" ? otherCoin.trim() : null,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("survey_responses")
          .insert({
            user_id: user.id,
            response_type: selectedOption,
            other_coin: selectedOption === "yes_other" ? otherCoin.trim() : null,
          });

        if (error) throw error;
      }

      setHasResponded(true);
      setExistingResponse({
        response_type: selectedOption,
        other_coin: selectedOption === "yes_other" ? otherCoin.trim() : undefined,
      });
      
      toast({
        title: t("survey.successTitle"),
        description: t("survey.successMessage"),
      });
    } catch (error: any) {
      toast({
        title: t("survey.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="glass border-primary/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {t("survey.title")}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {t("survey.subtitle")}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer">
                  <RadioGroupItem value="yes_pepe" id="yes_pepe" />
                  <Label htmlFor="yes_pepe" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t("survey.optionA")}</span>
                    <p className="text-sm text-muted-foreground">{t("survey.optionADesc")}</p>
                  </Label>
                  <span className="text-2xl">🐸</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer">
                    <RadioGroupItem value="yes_other" id="yes_other" />
                    <Label htmlFor="yes_other" className="flex-1 cursor-pointer">
                      <span className="font-medium">{t("survey.optionB")}</span>
                      <p className="text-sm text-muted-foreground">{t("survey.optionBDesc")}</p>
                    </Label>
                    <span className="text-2xl">💰</span>
                  </div>
                  {selectedOption === "yes_other" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="ml-10"
                    >
                      <Input
                        placeholder={t("survey.coinPlaceholder")}
                        value={otherCoin}
                        onChange={(e) => setOtherCoin(e.target.value)}
                        className="max-w-xs"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t("survey.optionC")}</span>
                    <p className="text-sm text-muted-foreground">{t("survey.optionCDesc")}</p>
                  </Label>
                  <span className="text-2xl">🐕</span>
                </div>
              </RadioGroup>

              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : hasResponded ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : null}
                {hasResponded ? t("survey.updateButton") : t("survey.submitButton")}
              </Button>

              {hasResponded && (
                <p className="text-center text-sm text-muted-foreground">
                  ✅ {t("survey.alreadyResponded")}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default SurveySection;
