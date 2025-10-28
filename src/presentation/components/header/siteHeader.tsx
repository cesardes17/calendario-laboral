import { Calendar } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-none">
              Calendario Laboral
            </h1>
            <p className="text-sm text-muted-foreground">
              Configuración de horarios
            </p>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
