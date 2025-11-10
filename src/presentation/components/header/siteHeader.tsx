import { Home, HelpCircle } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href={"/"}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Home className="h-5 w-5 text-primary" />
            </div>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-none">
              Calendario Laboral
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 ">
          <Link href="/help">
            <Button variant="ghost" size="icon" aria-label="Ayuda">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
