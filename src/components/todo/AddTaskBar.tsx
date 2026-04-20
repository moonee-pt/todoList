import { useState } from "react";
import { Priority, colorVar } from "@/lib/todo-types";
import { Plus, ChevronUp, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  priorities: Priority[];
  defaultPriorityId?: string;
  onAdd: (text: string, priorityId: string) => void;
}

export const AddTaskBar = ({ priorities, defaultPriorityId, onAdd }: Props) => {
  const [text, setText] = useState("");
  const [pid, setPid] = useState(defaultPriorityId ?? priorities[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  const currentPid = priorities.find((p) => p.id === pid) ? pid : priorities[0]?.id ?? "";
  const current = priorities.find((p) => p.id === currentPid);

  const submit = () => {
    if (!text.trim() || !currentPid) return;
    onAdd(text, currentPid);
    setText("");
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
            className="w-36 p-1 rounded-xl"
            sideOffset={8}
          >
            <div className="flex flex-col gap-0.5">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPid(p.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-accent transition-colors ${
                    pid === p.id ? "bg-accent" : ""
                  }`}
                  style={{ color: colorVar(p.color) }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: colorVar(p.color) }}
                  />
                  {p.name}
                  {pid === p.id && <Check className="h-3 w-3 ml-auto" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="添加新任务…"
          className="flex-1 bg-transparent text-sm focus:outline-none py-1.5 placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="h-9 w-9 grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm disabled:opacity-40 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
          aria-label="添加"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
