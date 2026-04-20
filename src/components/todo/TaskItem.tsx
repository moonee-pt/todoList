import { useEffect, useRef, useState } from "react";
import { Task, Priority, colorVar } from "@/lib/todo-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Trash2 } from "lucide-react";

interface Props {
  task: Task;
  priority?: Priority;
  animateExit?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

const SWIPE_REVEAL = 72;
const SWIPE_TRIGGER = 40;

export const TaskItem = ({
  task,
  priority,
  animateExit = true,
  onToggle,
  onDelete,
  onEdit,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const [leaving, setLeaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // swipe state
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const swiping = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  const color = priority?.color ?? "blue";

  const handleToggle = () => {
    if (leaving) return;
    if (animateExit) {
      setLeaving(true);
      window.setTimeout(() => onToggle(task.id), 320);
    } else {
      onToggle(task.id);
    }
  };

  const commitEdit = () => {
    const v = draft.trim();
    if (v && v !== task.text) onEdit(task.id, v);
    else setDraft(task.text);
    setEditing(false);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (editing) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    swiping.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null || startY.current === null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!swiping.current) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        swiping.current = true;
      } else if (Math.abs(dy) > 8) {
        startX.current = null;
        return;
      }
    }
    if (swiping.current) {
      e.preventDefault();
      setOffset(Math.max(-100, Math.min(0, dx)));
    }
  };
  const onPointerUp = () => {
    if (swiping.current) {
      setOffset(offset < -SWIPE_TRIGGER ? -SWIPE_REVEAL : 0);
    }
    startX.current = null;
    startY.current = null;
    swiping.current = false;
  };

  return (
    <div
      className={`relative ${leaving ? "animate-task-out" : "animate-task-in"}`}
    >
      {/* Delete background */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={() => onDelete(task.id)}
          className="h-full w-[72px] grid place-items-center bg-destructive text-destructive-foreground rounded-2xl"
          aria-label="删除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        style={{ ...style, transform: `${style.transform ?? ""} translateX(${offset}px)`.trim() }}
        {...attributes}
        {...listeners}
        onPointerDown={(e) => {
          (listeners as any)?.onPointerDown?.(e);
          onPointerDown(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="group relative flex items-center gap-2.5 bg-card border border-border/70 rounded-2xl px-3 py-2 shadow-soft hover:shadow-pop transition-shadow touch-pan-y select-none"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="h-5 w-5 rounded-full border-2 grid place-items-center shrink-0 transition-all active:scale-90"
          style={{
            borderColor: colorVar(color),
            backgroundColor: task.done ? colorVar(color) : "transparent",
          }}
          aria-label="切换完成"
        >
          {task.done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0" onPointerDown={(e) => e.stopPropagation()}>
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") {
                  setDraft(task.text);
                  setEditing(false);
                }
              }}
              className="w-full bg-transparent text-sm focus:outline-none border-b border-border py-0.5"
            />
          ) : (
            <p
              onDoubleClick={() => !task.done && setEditing(true)}
              onClick={() => {
                if (offset !== 0) setOffset(0);
                else if (!task.done) setEditing(true);
              }}
              className={`text-sm leading-snug break-words transition-colors cursor-text ${
                task.done ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
