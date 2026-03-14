import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Menu,
  GraduationCap
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alumni", label: "Kelola Alumni", icon: Users },
  { href: "/tracking", label: "Hasil Tracking", icon: Search },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = () => (
    <div className="flex flex-col gap-2 w-full">
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
            <div className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium
              ${isActive 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"}
            `}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card shadow-sm z-10 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">SPAT</span>
        </div>
        <div className="p-4 flex-1">
          <div className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Menu</div>
          <NavLinks />
        </div>
        <div className="p-6 border-t border-border/50">
          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
            <h4 className="text-sm font-bold">Office of Alumni</h4>
            <p className="text-xs text-muted-foreground mt-1">Sistem Pelacakan Terintegrasi v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg">SPAT</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card p-0">
              <div className="p-6 flex items-center gap-3 border-b border-border">
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="font-display font-bold text-2xl">SPAT</span>
              </div>
              <div className="p-4">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
