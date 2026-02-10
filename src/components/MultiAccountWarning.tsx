import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MultiAccountWarning = () => {
  return (
    <div className="px-4 pt-3 max-w-5xl mx-auto">
      <Alert className="border-red-500/50 bg-red-500/10 text-red-200">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <AlertDescription className="text-red-200 font-medium">
          ⚠️ <strong>Advertencia:</strong> El uso de múltiples cuentas está estrictamente prohibido. 
          Las cuentas detectadas con multicuenta serán <strong>baneadas permanentemente</strong> y 
          sus fondos serán confiscados. Monitoreamos IPs, dispositivos y huellas digitales.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MultiAccountWarning;
