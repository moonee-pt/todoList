import { Priority, colorVar } from "@/lib/todo-types";
import { Settings2 } from "lucide-react";

interface Props {
  priorities: Priority[];
  selected: string | "all";
  onSelect: (id: string | "all") => void;
  onOpenSettings: () => void;
}

export const FilterBar = ({ priorities, selected, onSelect, onOpenSettings }: Props) => {
  return (
    <div className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
      <div className="flex items-center gap-2 px-3 py-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelect("all")}
          className={`shrink-0 px-3 h-8 rounded-full text-sm font-medium transition border ${
            selected === "all"
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-foreground border-border"
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
              className="shrink-0 px-3 h-8 rounded-full text-sm font-medium transition border"
              style={{
                backgroundColor: colorVar(p.color),
                color: "white",
                borderColor: colorVar(p.color),
                opacity: active || selected === "all" ? 1 : 0.55,
                boxShadow: active ? `0 4px 14px hsl(var(--prio-${p.color}) / 0.4)` : "none",
              }}
            >
              {p.name}
            </button>
          );
        })}
        <button
          onClick={onOpenSettings}
          className="shrink-0 ml-auto h-8 w-8 grid place-items-center rounded-full border border-border text-muted-foreground"
          aria-label="管理优先级"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
