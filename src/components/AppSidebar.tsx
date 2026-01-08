import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, 
  Wallet, 
  Users, 
  Play,
  Menu,
  X,
  Home,
  Ticket,
  Trophy,
  Pickaxe,
  Shield,
  Link,
  TrendingUp,
  Cpu,
  HelpCircle,
  Lock,
  Bird,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  section: string;
}

const menuItems: MenuItem[] = [
  { id: "hero", labelKey: "sidebar.home", icon: Home, section: "hero" },
  { id: "social-tasks", labelKey: "sidebar.socialTasks", icon: Gift, section: "social-tasks" },
  { id: "mystery-boxes", labelKey: "sidebar.mysteryBoxes", icon: Package, section: "mystery-boxes" },
  { id: "inventory", labelKey: "sidebar.inventory", icon: Pickaxe, section: "inventory" },
  { id: "collection", labelKey: "sidebar.collection", icon: Trophy, section: "collection" },
  { id: "doge-birds", labelKey: "sidebar.dogeBirds", icon: Bird, section: "doge-birds" },
  { id: "web-mining", labelKey: "sidebar.webMining", icon: Cpu, section: "web-mining" },
  { id: "online-mining", labelKey: "sidebar.onlineMining", icon: TrendingUp, section: "online-mining" },
  { id: "staking", labelKey: "sidebar.staking", icon: Lock, section: "staking" },
  { id: "lottery", labelKey: "sidebar.lottery", icon: Ticket, section: "lottery" },
  { id: "shortlinks", labelKey: "sidebar.shortlinks", icon: Link, section: "shortlinks" },
  { id: "ptc", labelKey: "sidebar.ptc", icon: Play, section: "ptc" },
  { id: "faucetpay", labelKey: "sidebar.faucetpay", icon: Wallet, section: "faucetpay" },
  { id: "referral", labelKey: "sidebar.referral", icon: Trophy, section: "referral" },
  { id: "support", labelKey: "support.title", icon: HelpCircle, section: "support" },
];

interface AppSidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const AppSidebar = ({ activeSection, onNavigate }: AppSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      setIsAdmin(data === true);
    };

    checkAdminRole();
  }, [user]);

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-50 lg:hidden glass shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 transition-all duration-300 ease-in-out",
          "bg-background/95 backdrop-blur-xl border-r border-border/50",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:flex justify-end p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? (
                <Menu className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const label = t(item.labelKey);
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.section)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        "hover:bg-primary/10 hover:text-primary",
                        isActive 
                          ? "bg-primary/20 text-primary font-medium shadow-sm" 
                          : "text-muted-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                      title={isCollapsed ? label : undefined}
                    >
                      <Icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive && "text-primary"
                      )} />
                      {!isCollapsed && (
                        <span className="text-sm truncate">{label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Admin link */}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    "bg-destructive/10 text-destructive hover:bg-destructive/20",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? t('sidebar.admin') : undefined}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{t('sidebar.admin')}</span>
                  )}
                </button>
              </div>
            )}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  DOGEMiner v1.0
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Much wow! 🐕
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
