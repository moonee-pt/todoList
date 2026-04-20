import { COLOR_OPTIONS, Priority, PriorityColor, colorVar } from "@/lib/todo-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  priorities: Priority[];
  onUpsert: (p: Priority) => void;
  onRemove: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
}

const Row = ({
  p,
  canRemove,
  onUpsert,
  onRemove,
}: {
  p: Priority;
  canRemove: boolean;
  onUpsert: (p: Priority) => void;
  onRemove: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: p.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border bg-card rounded-2xl p-3 flex flex-col gap-3 shadow-soft"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="touch-none text-muted-foreground/60 hover:text-foreground p-1 -ml-1 cursor-grab active:cursor-grabbing"
          aria-label="拖拽排序"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: colorVar(p.color) }}
        />
        <input
          value={p.name}
          onChange={(e) => onUpsert({ ...p, name: e.target.value })}
          className="flex-1 bg-transparent border-b border-transparent focus:border-primary text-sm py-1 focus:outline-none transition-colors"
          placeholder="优先级名称"
        />
        {canRemove && (
          <button
            onClick={() => onRemove(p.id)}
            className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition"
            aria-label="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 pl-7">
        {COLOR_OPTIONS.map((c) => {
          const active = p.color === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onUpsert({ ...p, color: c.key as PriorityColor })}
              className="h-8 w-8 rounded-full transition-all relative active:scale-90"
              style={{
                backgroundColor: colorVar(c.key),
                boxShadow: active
                  ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${colorVar(c.key)}`
                  : "none",
              }}
              aria-label={c.label}
            />
          );
        })}
      </div>
    </div>
  );
};

export const PrioritySettings = ({
  open,
  onOpenChange,
  priorities,
  onUpsert,
  onRemove,
  onReorder,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  const addNew = () => {
    onUpsert({
      id: crypto.randomUUID(),
      name: "新优先级",
      color: "blue",
    });
  };

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[88vh] overflow-y-auto border-border">
        <SheetHeader>
          <SheetTitle className="text-left">管理优先级</SheetTitle>
          <p className="text-xs text-muted-foreground text-left">拖动手柄可调整顺序，影响「全部」视图分组顺序。</p>
        </SheetHeader>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
          <SortableContext items={priorities.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3 mt-4 pb-6">
              {priorities.map((p) => (
                <Row
                  key={p.id}
                  p={p}
                  canRemove={priorities.length > 1}
                  onUpsert={onUpsert}
                  onRemove={onRemove}
                />
              ))}
              <button
                onClick={addNew}
                className="flex items-center justify-center gap-2 text-sm text-primary border border-dashed border-primary/40 hover:bg-primary/5 rounded-2xl py-3 transition"
              >
                <Plus className="h-4 w-4" /> 添加优先级
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </SheetContent>
    </Sheet>
  );
};
