import { Task, Priority, colorVar, colorVarSoft } from "@/lib/todo-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Trash2 } from "lucide-react";

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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const color = priority?.color ?? "blue";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-3 shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-muted-foreground/60 -ml-1 p-1"
        aria-label="拖拽排序"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <button
        onClick={() => onToggle(task.id)}
        className="h-6 w-6 rounded-full border-2 grid place-items-center shrink-0 transition"
        style={{
          borderColor: colorVar(color),
          backgroundColor: task.done ? colorVar(color) : "transparent",
        }}
        aria-label="切换完成"
      >
        {task.done && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug break-words ${
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
        onClick={() => onDelete(task.id)}
        className="text-muted-foreground/60 p-1"
        aria-label="删除"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
