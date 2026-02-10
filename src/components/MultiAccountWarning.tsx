import { AlertTriangle } from "lucide-react";

const MultiAccountWarning = () => {
  return (
    <div className="px-4 pt-3 max-w-5xl mx-auto">
      <div className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/20 p-4">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <p className="text-sm text-foreground font-medium">
          ⚠️ <strong>Advertencia:</strong> El uso de múltiples cuentas está estrictamente prohibido. 
          Las cuentas detectadas con multicuenta serán <strong>baneadas permanentemente</strong> y 
          sus fondos serán confiscados. Monitoreamos IPs, dispositivos y huellas digitales.
        </p>
      </div>
    </div>
  );
};

export default MultiAccountWarning;
