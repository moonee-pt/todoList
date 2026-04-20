import { useState } from "react";
import { Priority, colorVar } from "@/lib/todo-types";
import { Plus, ChevronDown } from "lucide-react";

interface Props {
  priorities: Priority[];
  defaultPriorityId?: string;
  onAdd: (text: string, priorityId: string) => void;
}

export const AddTaskBar = ({ priorities, defaultPriorityId, onAdd }: Props) => {
  const [text, setText] = useState("");
  const [pid, setPid] = useState(defaultPriorityId ?? priorities[0]?.id ?? "");

  const currentPid = priorities.find((p) => p.id === pid) ? pid : priorities[0]?.id ?? "";
  const current = priorities.find((p) => p.id === currentPid);

  const submit = () => {
    if (!text.trim() || !currentPid) return;
    onAdd(text, currentPid);
    setText("");
  };

  return (
    <div className="px-3 pt-3 pb-2 bg-gradient-to-t from-background via-background to-background/0">
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl pl-2 pr-1.5 py-1.5 shadow-soft">
        <div className="relative">
          <select
            value={currentPid}
            onChange={(e) => setPid(e.target.value)}
            className="appearance-none text-xs font-semibold border-0 focus:outline-none rounded-full pl-3 pr-7 py-1.5 cursor-pointer"
            style={{
              backgroundColor: current ? `hsl(var(--prio-${current.color}) / 0.15)` : undefined,
              color: current ? colorVar(current.color) : undefined,
            }}
          >
            {priorities.map((p) => (
              <option key={p.id} value={p.id} className="text-foreground bg-background">
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: current ? colorVar(current.color) : undefined }}
          />
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="添加新任务…"
          className="flex-1 bg-transparent text-sm focus:outline-none py-2 placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="h-9 w-9 grid place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-pop disabled:opacity-40 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
          aria-label="添加"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
