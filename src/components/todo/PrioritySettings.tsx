import { COLOR_OPTIONS, Priority, PriorityColor, colorVar } from "@/lib/todo-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  priorities: Priority[];
  onUpsert: (p: Priority) => void;
  onRemove: (id: string) => void;
}

export const PrioritySettings = ({ open, onOpenChange, priorities, onUpsert, onRemove }: Props) => {
  const addNew = () => {
    onUpsert({
      id: crypto.randomUUID(),
      name: "新优先级",
      color: "blue",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>管理优先级</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 mt-4 pb-6">
          {priorities.map((p) => (
            <div key={p.id} className="border border-border rounded-xl p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  value={p.name}
                  onChange={(e) => onUpsert({ ...p, name: e.target.value })}
                  className="flex-1 bg-transparent border-b border-border text-sm py-1 focus:outline-none focus:border-foreground"
                  placeholder="优先级名称"
                />
                {priorities.length > 1 && (
                  <button
                    onClick={() => onRemove(p.id)}
                    className="text-muted-foreground p-1"
                    aria-label="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => onUpsert({ ...p, color: c.key as PriorityColor })}
                    className="h-8 w-8 rounded-full border-2 transition"
                    style={{
                      backgroundColor: colorVar(c.key),
                      borderColor: p.color === c.key ? "hsl(var(--foreground))" : "transparent",
                    }}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={addNew}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground border border-dashed border-border rounded-xl py-3"
          >
            <Plus className="h-4 w-4" /> 添加优先级
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
