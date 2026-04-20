import { useState, useEffect } from "react";
import { Category, colorVar } from "@/lib/todo-types";
import { Plus, ChevronUp, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  categories: Category[];
  defaultCategoryId?: string;
  editingTask?: { id: string; text: string; categoryId: string } | null;
  onAdd: (text: string, categoryId: string) => void;
  onUpdate?: (id: string, text: string, categoryId: string) => void;
  onCancelEdit?: () => void;
}

export const AddTaskBar = ({ categories, defaultCategoryId, editingTask, onAdd, onUpdate, onCancelEdit }: Props) => {
  const [text, setText] = useState("");
  const [pid, setPid] = useState(defaultCategoryId ?? categories[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  const isEditing = !!editingTask;

  useEffect(() => {
    if (editingTask) {
      setText(editingTask.text);
      setPid(editingTask.categoryId);
    }
  }, [editingTask?.id]);

  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
    }
  }, [text]);

  const currentPid = categories.find((p) => p.id === pid) ? pid : categories[0]?.id ?? "";
  const current = categories.find((p) => p.id === currentPid);

  const submit = () => {
    if (!text.trim() || !currentPid) return;
    if (isEditing && onUpdate && editingTask) {
      onUpdate(editingTask.id, text, currentPid);
    } else {
      onAdd(text, currentPid);
    }
    setText("");
    setPid(defaultCategoryId ?? categories[0]?.id ?? "");
  };

  return (
    <div className="px-3 pt-3 pb-2 bg-gradient-to-t from-background via-background to-background/0">
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl pl-3 pr-2 py-2 shadow-sm">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl gap-1.5 pl-3 pr-2 font-medium text-xs"
              style={{
                backgroundColor: current ? `hsl(var(--prio-${current.color}) / 0.12)` : undefined,
                color: current ? colorVar(current.color) : undefined,
              }}
            >
              {current?.name}
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align="start" 
            className="w-44 p-1 rounded-xl"
            sideOffset={8}
          >
            <div className="flex flex-col gap-0.5">
              {(() => {
                const renderTree = (parentId: string | null, depth: number = 0): JSX.Element[] => {
                  const children = categories.filter((c) => c.parentId === parentId);
                  return children.flatMap((c) => [
                    <button
                      key={c.id}
                      onClick={() => {
                        setPid(c.id);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-accent transition-colors ${
                        pid === c.id ? "bg-accent" : ""
                      }`}
                      style={{ 
                        color: colorVar(c.color),
                        paddingLeft: `${10 + depth * 12}px`
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: colorVar(c.color) }}
                      />
                      {c.name}
                      {pid === c.id && <Check className="h-3 w-3 ml-auto" />}
                    </button>,
                    ...renderTree(c.id, depth + 1),
                  ]);
                };
                return renderTree(null);
              })()}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submit())}
            placeholder={isEditing ? "编辑任务…" : "添加新任务…"}
            className="w-full bg-transparent text-sm focus:outline-none py-1.5 placeholder:text-muted-foreground resize-none leading-relaxed max-h-24 overflow-y-auto"
            rows={1}
          />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-9" />
          {isEditing && (
            <button
              onClick={() => {
                onCancelEdit?.();
                setText("");
                setPid(defaultCategoryId ?? categories[0]?.id ?? "");
              }}
              className="h-9 w-9 grid place-items-center rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all -ml-[42px]"
              aria-label="取消"
            >
              <X className="h-4.5 w-4.5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="h-9 w-9 grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm disabled:opacity-40 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
            aria-label={isEditing ? "更新" : "添加"}
          >
            {isEditing ? <Check className="h-[1.35rem] w-[1.35rem]" strokeWidth={2.7} /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
