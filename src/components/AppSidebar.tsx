import { useState } from "react";
import { 
  Package, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Users, 
  Play,
  Menu,
  X,
  Home,
  Ticket,
  Trophy,
  Pickaxe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: string;
}

const menuItems: MenuItem[] = [
  { id: "hero", label: "Inicio", icon: Home, section: "hero" },
  { id: "mystery-boxes", label: "Cajas Misteriosas", icon: Package, section: "mystery-boxes" },
  { id: "inventory", label: "Inventario", icon: Pickaxe, section: "inventory" },
  { id: "collection", label: "Colección", icon: Trophy, section: "collection" },
  { id: "lottery", label: "Lotería", icon: Ticket, section: "lottery" },
  { id: "ptc", label: "Ver Anuncios (PTC)", icon: Play, section: "ptc" },
  { id: "faucetpay", label: "Depósito / Retiro", icon: Wallet, section: "faucetpay" },
  { id: "referral", label: "Referidos", icon: Users, section: "referral" },
];

interface AppSidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const AppSidebar = ({ activeSection, onNavigate }: AppSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false); // Close mobile menu after navigation
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
          // Mobile styles
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Width
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
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive && "text-primary"
                      )} />
                      {!isCollapsed && (
                        <span className="text-sm truncate">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
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
