import { Priority, colorVar } from "@/lib/todo-types";
import { Settings2, Moon, Sun } from "lucide-react";

interface Props {
  priorities: Priority[];
  selected: string | "all";
  onSelect: (id: string | "all") => void;
  onOpenSettings: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const FilterBar = ({
  priorities,
  selected,
  onSelect,
  onOpenSettings,
  theme,
  onToggleTheme,
}: Props) => {
  return (
    <div className="sticky top-0 z-20 bg-background/75 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center gap-2 px-3 pt-3">
        <h1 className="text-lg font-semibold tracking-tight flex-1">任务清单</h1>
        <button
          onClick={onToggleTheme}
          className="h-9 w-9 grid place-items-center rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition"
          aria-label="切换主题"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          onClick={onOpenSettings}
          className="h-9 w-9 grid place-items-center rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition"
          aria-label="管理优先级"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 py-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelect("all")}
          className={`shrink-0 px-4 h-9 rounded-full text-sm font-medium transition-all ${
            selected === "all"
              ? "bg-gradient-primary text-primary-foreground shadow-pop"
              : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          全部
        </button>
        {priorities.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="shrink-0 px-3.5 h-9 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? colorVar(p.color) : `hsl(var(--prio-${p.color}) / 0.12)`,
                color: active ? "white" : colorVar(p.color),
                boxShadow: active ? `0 6px 18px hsl(var(--prio-${p.color}) / 0.4)` : "none",
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
