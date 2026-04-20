import { useState } from "react";
import { Task, Priority, colorVar, colorVarSoft } from "@/lib/todo-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Trash2 } from "lucide-react";

interface Props {
  task: Task;
  priority?: Priority;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = ({ task, priority, onToggle, onDelete }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const [leaving, setLeaving] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  const color = priority?.color ?? "blue";

  const handleToggle = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onToggle(task.id), 320);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center gap-3 bg-card border border-border/70 rounded-2xl px-4 py-3 shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all touch-none ${
        leaving ? "animate-task-out" : "animate-task-in"
      }`}
    >
      <span
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: colorVar(color) }}
        aria-hidden
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="h-6 w-6 rounded-full border-2 grid place-items-center shrink-0 transition-all active:scale-90"
        style={{
          borderColor: colorVar(color),
          backgroundColor: task.done ? colorVar(color) : "transparent",
        }}
        aria-label="切换完成"
      >
        {task.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug break-words transition-colors ${
            task.done ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {task.text}
        </p>
        {priority && (
          <span
            className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: colorVarSoft(color), color: colorVar(color) }}
          >
            {priority.name}
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-muted-foreground/50 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition"
        aria-label="删除"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
