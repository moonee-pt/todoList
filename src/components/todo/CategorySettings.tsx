import { COLOR_OPTIONS, Category, CategoryColor, colorVar } from "@/lib/todo-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { Plus, Trash2, GripVertical, FolderPlus, ChevronRight, ChevronDown } from "lucide-react";
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
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  onUpsert: (p: Category) => void;
  onRemove: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onAddSubCategory?: (parentId: string) => void;
}

const Row = ({
  c,
  canRemove,
  depth,
  expanded,
  onToggleExpand,
  onUpsert,
  onRemove,
  onAddSubCategory,
  hasChildren,
}: {
  c: Category;
  canRemove: boolean;
  depth: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpsert: (p: Category) => void;
  onRemove: (id: string) => void;
  onAddSubCategory?: (parentId: string) => void;
  hasChildren: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: c.id,
  });
  const style: React.CSSProperties = {
    transform: isDragging ? CSS.Transform.toString(transform) : undefined,
    transition: isDragging ? transition : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border bg-card rounded-2xl p-3 flex flex-col gap-3 shadow-soft"
    >
      <div className="flex items-center gap-1" style={{ marginLeft: `${depth * 16}px` }}>
        {hasChildren && (
          <button
            onClick={onToggleExpand}
            className="text-muted-foreground/60 hover:text-foreground p-0.5 transition-transform -m-0.5"
            style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
        {depth > 0 && !hasChildren && <div className="w-4" />}
        <button
          {...attributes}
          {...listeners}
          className="touch-none text-muted-foreground/60 hover:text-foreground p-1 cursor-grab active:cursor-grabbing"
          aria-label="拖拽排序"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: depth > 0 ? "hsl(220 12% 48%)" : colorVar(c.color) }}
        />
        <input
          value={c.name}
          onChange={(e) => onUpsert({ ...c, name: e.target.value })}
          className="flex-1 bg-transparent border-b border-transparent focus:border-primary text-sm py-1 focus:outline-none transition-colors"
          placeholder={depth > 0 ? "子文件夹名称" : "分类名称"}
        />
        {depth === 0 && onAddSubCategory && (
          <button
            onClick={() => onAddSubCategory(c.id)}
            className="text-muted-foreground/60 hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition"
            aria-label="添加子文件夹"
            title="添加子文件夹"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        )}
        {canRemove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition"
                aria-label="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[280px] rounded-xl p-4 !top-[30%]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-base">确定删除？</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
                <AlertDialogCancel className="flex-1 h-9 rounded-lg border-none bg-secondary hover:bg-secondary/80 mt-0">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(c.id)}
                  className="flex-1 h-9 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {depth === 0 && (
        <div className="flex items-center gap-2 pl-7" style={{ marginLeft: `${depth * 16 + 28}px` }}>
          {COLOR_OPTIONS.map((color) => {
            const active = c.color === color.key;
            return (
              <button
                key={color.key}
                onClick={() => onUpsert({ ...c, color: color.key as CategoryColor })}
                className="h-8 w-8 rounded-full transition-all relative active:scale-90"
                style={{
                  backgroundColor: colorVar(color.key),
                  boxShadow: active
                    ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${colorVar(color.key)}`
                    : "none",
                }}
                aria-label={color.label}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CategorySettings = ({
  open,
  onOpenChange,
  categories,
  onUpsert,
  onRemove,
  onReorder,
  onAddSubCategory,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 10 } })
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const withChildren = categories.filter((c) =>
      categories.some((sub) => sub.parentId === c.id)
    );
    return new Set(withChildren.map((c) => c.id));
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addNew = () => {
    onUpsert({
      id: crypto.randomUUID(),
      name: "新分类",
      color: "blue",
      parentId: null,
    });
  };

  const handleAddSubCategory = (parentId: string) => {
    setExpandedIds((prev) => new Set([...prev, parentId]));
    onAddSubCategory?.(parentId);
  };

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  const renderCategoryTree = (parentId: string | null, depth: number = 0): JSX.Element[] => {
    const children = categories.filter((c) => c.parentId === parentId);
    return children.flatMap((c) => {
      const hasChildren = categories.some((sub) => sub.parentId === c.id);
      const isExpanded = expandedIds.has(c.id) || !hasChildren;
      const elements: JSX.Element[] = [
        <Row
          key={c.id}
          c={c}
          canRemove={categories.length > 1}
          depth={depth}
          expanded={expandedIds.has(c.id)}
          onToggleExpand={() => toggleExpand(c.id)}
          onUpsert={onUpsert}
          onRemove={onRemove}
          onAddSubCategory={handleAddSubCategory}
          hasChildren={hasChildren}
        />,
      ];
      if (isExpanded) {
        elements.push(...renderCategoryTree(c.id, depth + 1));
      }
      return elements;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[88vh] overflow-y-auto border-border">
        <SheetHeader>
          <SheetTitle className="text-left">管理分类</SheetTitle>
          <p className="text-xs text-muted-foreground text-left">点击箭头展开/收起子文件夹，拖动手柄调整顺序。</p>
        </SheetHeader>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
          <SortableContext items={categories.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3 mt-4 pb-6">
              {renderCategoryTree(null)}
              <button
                onClick={addNew}
                className="flex items-center justify-center gap-2 text-sm text-primary border border-dashed border-primary/40 hover:bg-primary/5 rounded-2xl py-3 transition"
              >
                <Plus className="h-4 w-4" /> 添加分类
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </SheetContent>
    </Sheet>
  );
};
