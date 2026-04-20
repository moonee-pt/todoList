import { useState } from "react";
import { Priority, colorVar } from "@/lib/todo-types";
import { Plus } from "lucide-react";

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
    <div className="px-3 py-2 bg-background border-t border-border">
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl pl-2 pr-1 py-1 shadow-sm">
        <select
          value={currentPid}
          onChange={(e) => setPid(e.target.value)}
          className="text-xs font-medium bg-transparent border-0 focus:outline-none rounded-full px-2 py-1"
          style={{
            backgroundColor: current ? colorVar(current.color) : undefined,
            color: "white",
          }}
        >
          {priorities.map((p) => (
            <option key={p.id} value={p.id} className="text-foreground bg-background">
              {p.name}
            </option>
          ))}
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="添加新任务…"
          className="flex-1 bg-transparent text-sm focus:outline-none py-2"
        />
        <button
          onClick={submit}
          className="h-9 w-9 grid place-items-center rounded-full bg-foreground text-background"
          aria-label="添加"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
