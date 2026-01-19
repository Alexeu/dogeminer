import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "manualReviewAlertDismissed";

const ManualReviewAlert = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Alert className="relative mx-4 mt-4 border-amber-500 bg-amber-900/90 text-white">
      <AlertTriangle className="h-5 w-5 text-amber-300" />
      <AlertDescription className="pr-8 text-white font-medium">
        {t('header.manualReviewAlert')}
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white hover:text-amber-200 hover:bg-amber-700"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};

export default ManualReviewAlert;
