import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, Lock, Loader2, Shield, AlertTriangle } from "lucide-react";
import dogeLogo from "@/assets/doge-logo.png";
import { useFingerprint } from "@/hooks/useFingerprint";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");

// Minimum time in ms a human would take to fill the form
const MIN_FORM_TIME_MS = 3000;
// Max attempts before temporary lockout
const MAX_ATTEMPTS = 5;
// Lockout duration in ms (2 minutes)
const LOCKOUT_DURATION_MS = 120000;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // Antibot: Honeypot field (bots will fill this)
  const [honeypot, setHoneypot] = useState("");
  // Antibot: Track form load time
  const formLoadTime = useRef<number>(Date.now());
  // Antibot: Track failed attempts
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  
  // Fingerprint validation
  const { fingerprintData, loading: fingerprintLoading } = useFingerprint();
  const [fingerprintBlocked, setFingerprintBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>("");
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Reset form load time when switching between login/signup
  useEffect(() => {
    formLoadTime.current = Date.now();
  }, [isLogin]);

  // Check lockout from localStorage on mount
  useEffect(() => {
    const storedLockout = localStorage.getItem("auth_lockout");
    const storedAttempts = localStorage.getItem("auth_attempts");
    
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (Date.now() < lockoutTime) {
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem("auth_lockout");
        localStorage.removeItem("auth_attempts");
      }
    }
    
    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts, 10));
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Countdown for lockout
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemaining(0);
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, lockoutUntil - Date.now());
      setLockoutRemaining(remaining);
      
      if (remaining === 0) {
        setLockoutUntil(null);
        setAttempts(0);
        localStorage.removeItem("auth_lockout");
        localStorage.removeItem("auth_attempts");
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAntibot = (): boolean => {
    // Check if locked out
    if (lockoutUntil && Date.now() < lockoutUntil) {
      toast.error(`Demasiados intentos. Espera ${Math.ceil(lockoutRemaining / 1000)} segundos.`);
      return false;
    }
    
    // Honeypot check - if filled, it's likely a bot
    if (honeypot) {
      // Silently fail for bots
      return false;
    }
    
    // Time check - form filled too fast
    const timeSpent = Date.now() - formLoadTime.current;
    if (timeSpent < MIN_FORM_TIME_MS) {
      toast.error("Por favor, tómate tu tiempo para completar el formulario.");
      return false;
    }
    
    return true;
  };

  const recordFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem("auth_attempts", newAttempts.toString());
    
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockout = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(lockout);
      localStorage.setItem("auth_lockout", lockout.toString());
      toast.error("Demasiados intentos fallidos. Bloqueado por 2 minutos.");
    }
  };

  // Validate fingerprint after successful auth
  const validateAndRegisterFingerprint = async () => {
    if (!fingerprintData) return { success: true };
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { success: true };

      // Check if fingerprint is banned
      const { data: checkResult, error: checkError } = await supabase.functions.invoke('validate-fingerprint', {
        body: {
          action: 'check',
          fingerprint: fingerprintData.fingerprint,
          userAgent: fingerprintData.components.userAgent,
        },
      });

      if (checkError) {
        console.error('Fingerprint check error:', checkError);
        return { success: true }; // Allow login on error to not block legitimate users
      }

      if (checkResult?.banned) {
        return { success: false, reason: 'banned' };
      }

      if (checkResult?.tooManyAccounts) {
        return { success: false, reason: 'too_many_accounts' };
      }

      // Register fingerprint
      await supabase.functions.invoke('validate-fingerprint', {
        body: {
          action: 'register',
          fingerprint: fingerprintData.fingerprint,
          userAgent: fingerprintData.components.userAgent,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Fingerprint validation error:', error);
      return { success: true }; // Allow login on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAntibot()) return;
    if (!validateForm()) return;
    if (fingerprintBlocked) {
      toast.error("Acceso denegado desde este dispositivo.");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          recordFailedAttempt();
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Credenciales inválidas. Verifica tu email y contraseña.");
          } else {
            toast.error(error.message);
          }
        } else {
          // Validate fingerprint after successful login
          const fpResult = await validateAndRegisterFingerprint();
          if (!fpResult.success) {
            await supabase.auth.signOut();
            setFingerprintBlocked(true);
            setBlockReason(fpResult.reason === 'banned' 
              ? 'Este dispositivo está asociado a una cuenta baneada.' 
              : 'Demasiadas cuentas desde esta IP.');
            toast.error("Acceso denegado.");
            return;
          }
          
          setAttempts(0);
          localStorage.removeItem("auth_attempts");
          toast.success("¡Bienvenido de vuelta!");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          recordFailedAttempt();
          if (error.message.includes("User already registered")) {
            toast.error("Este email ya está registrado. Intenta iniciar sesión.");
          } else {
            toast.error(error.message);
          }
        } else {
          // Validate fingerprint after successful signup
          const fpResult = await validateAndRegisterFingerprint();
          if (!fpResult.success) {
            await supabase.auth.signOut();
            setFingerprintBlocked(true);
            setBlockReason(fpResult.reason === 'banned' 
              ? 'Este dispositivo está asociado a una cuenta baneada.' 
              : 'Demasiadas cuentas desde esta IP.');
            toast.error("Acceso denegado.");
            return;
          }
          
          setAttempts(0);
          localStorage.removeItem("auth_attempts");
          toast.success("¡Cuenta creada! Ya puedes empezar a jugar.");
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;
  const isDisabled = isLocked || fingerprintBlocked || fingerprintLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="w-full max-w-md relative">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <img src={dogeLogo} alt="DOGE Logo" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg shadow-primary/30" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              DOGE Miner
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Inicia sesión para continuar" : "Crea tu cuenta y empieza a minar"}
            </p>
          </div>

          {fingerprintBlocked && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Acceso denegado</p>
                <p className="text-xs text-muted-foreground">{blockReason}</p>
              </div>
            </div>
          )}

          {isLocked && !fingerprintBlocked && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
              <Shield className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Cuenta bloqueada temporalmente</p>
                <p className="text-xs text-muted-foreground">
                  Espera {Math.ceil(lockoutRemaining / 1000)} segundos
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot field - hidden from humans, visible to bots */}
            <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  disabled={isDisabled}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  disabled={isDisabled}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || isDisabled}
              className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground font-semibold py-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : fingerprintBlocked ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Bloqueado
                </span>
              ) : isLocked ? (
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Bloqueado
                </span>
              ) : fingerprintLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Iniciar Sesión"
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={isDisabled}
            >
              {isLogin ? (
                <>¿No tienes cuenta? <span className="text-primary font-medium">Regístrate</span></>
              ) : (
                <>¿Ya tienes cuenta? <span className="text-primary font-medium">Inicia sesión</span></>
              )}
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Protegido con fingerprinting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
