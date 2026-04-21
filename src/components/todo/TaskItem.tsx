import { useState } from "react";
import { Task, Category, colorVar } from "@/lib/todo-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Trash2, Edit2, GripVertical } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onStartEdit: (task: { id: string; text: string; categoryId: string }) => void;
}

export const TaskItem = ({ task, category, onToggle, onDelete, onEdit, onStartEdit }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    },
  });

  const [isLeaving, setIsLeaving] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const color = category?.color ?? "blue";

  const handleToggle = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onToggle(task.id);
    }, 300);
  };

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isLeaving ? "opacity-0 translate-x-full scale-95" : ""
      }`}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`relative flex items-center bg-card border border-border/70 rounded-2xl pr-3 py-3 transition-all duration-200 ${
          isDragging ? "shadow-xl scale-[1.02]" : "shadow-soft"
        }`}
      >
        <button
          {...listeners}
          className="touch-none text-muted-foreground/40 hover:text-foreground p-1 ml-1 cursor-grab active:cursor-grabbing"
          aria-label="拖拽排序"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="h-6 w-6 rounded-full border-2 grid place-items-center shrink-0 transition-all active:scale-90 duration-200"
          style={{
            borderColor: colorVar(color),
            backgroundColor: task.done ? colorVar(color) : "transparent",
          }}
          aria-label="切换完成"
        >
          {task.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0 ml-2">
          <p
            className={`text-sm leading-relaxed break-words whitespace-pre-wrap transition-all duration-300 ${
              task.done ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.text}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit({
                id: task.id,
                text: task.text,
                categoryId: task.categoryId,
              });
            }}
            className="text-muted-foreground/50 hover:text-primary p-1 rounded-lg hover:bg-primary/10 transition duration-200"
            aria-label="编辑"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground/50 hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
                aria-label="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[280px] rounded-xl p-4 !top-[45%]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-base">确定删除？</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
                <AlertDialogCancel className="flex-1 h-9 rounded-lg border-none bg-secondary hover:bg-secondary/80 mt-0">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(task.id)}
                  className="flex-1 h-9 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
