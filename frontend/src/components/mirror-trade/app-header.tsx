
"use client";

import { AppLogo } from "@/components/mirror-trade/app-logo";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/hooks/use-app-store";
import { DollarSign, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function AppHeader() {
  const { setTheme, theme } = useTheme();
  const accountBalance = useAppStore(state => state.accountBalance);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <AppLogo size={28}/>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm font-medium">
            <DollarSign size={16} className="text-primary"/>
            <span>Balance: ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
      </div>
    </header>
  );
}
