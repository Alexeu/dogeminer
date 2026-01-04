import { useState, useEffect, ReactNode } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdBlockDetectorProps {
  children: ReactNode;
}

const AdBlockDetector = ({ children }: AdBlockDetectorProps) => {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Try to fetch a common ad script
        const testAd = document.createElement("div");
        testAd.innerHTML = "&nbsp;";
        testAd.className = "adsbox ad-banner ad-placeholder pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links";
        testAd.style.cssText = "position: absolute; top: -10px; left: -10px; width: 1px; height: 1px;";
        document.body.appendChild(testAd);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const isBlocked = testAd.offsetHeight === 0 || 
                          testAd.offsetParent === null || 
                          getComputedStyle(testAd).display === "none" ||
                          getComputedStyle(testAd).visibility === "hidden";

        document.body.removeChild(testAd);

        // Method 2: Try to load a bait script
        if (!isBlocked) {
          try {
            const response = await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
              method: "HEAD",
              mode: "no-cors",
            });
            setAdBlockDetected(false);
          } catch {
            setAdBlockDetected(true);
          }
        } else {
          setAdBlockDetected(true);
        }
      } catch {
        setAdBlockDetected(true);
      } finally {
        setChecking(false);
      }
    };

    detectAdBlock();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (adBlockDetected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Ad Blocker Detected! 🚫
            </h1>
            <p className="text-muted-foreground">
              Please disable your ad blocker to access RPG Doge. Our free service depends on advertising to keep running.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How to disable:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click on your ad blocker extension icon</li>
                  <li>Disable it for this site</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleRefresh} 
            className="w-full"
            size="lg"
          >
            I've Disabled My Ad Blocker - Refresh
          </Button>

          <p className="text-xs text-muted-foreground">
            Thank you for supporting RPG Doge! 🐕
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdBlockDetector;
