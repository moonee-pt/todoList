import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Task, Category, colorVar } from "@/lib/todo-types";
import { TaskItem } from "./TaskItem";

interface Props {
  tasks: Task[];
  categories: Category[];
  groupByCategory: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onStartEdit: (task: { id: string; text: string; categoryId: string }) => void;
  onReorder: (fromId: string, toId: string) => void;
  emptyText: string;
}

export const TaskList = ({
  tasks,
  categories,
  groupByCategory = false,
  onToggle,
  onDelete,
  onEdit,
  onStartEdit,
  onReorder,
  emptyText,
}: Props) => {
  const [activePriorityId, setActivePriorityId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubCategories, setExpandedSubCategories] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 15,
      },
    })
  );

  const handleStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    if (task) {
      setActivePriorityId(task.categoryId);
    }
  };

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActivePriorityId(null);
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);

    if (!activeTask || !overTask) return;

    if (groupByCategory) {
      if (activeTask.categoryId === overTask.categoryId) {
        onReorder(String(active.id), String(over.id));
      }
    } else {
      onReorder(String(active.id), String(over.id));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="px-6 py-20 text-center text-sm text-muted-foreground">{emptyText}</div>
    );
  }

  if (groupByCategory) {
    const rootCategories = categories.filter((c) => !c.parentId);
    const groups = rootCategories
      .map((p) => {
        const subIds = categories.filter((c) => c.parentId === p.id).map((c) => c.id);
        return {
          category: p,
          items: tasks.filter((t) => t.categoryId === p.id),
          hasSubTasks: tasks.some((t) => subIds.includes(t.categoryId)),
        };
      })
      .filter((g) => g.items.length > 0 || g.hasSubTasks);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleStart}
        onDragEnd={handleEnd}
      >
        <div className="flex flex-col gap-5 px-3 py-3">
          {groups.map(({ category, items }) => {
            const subCategories = categories.filter((c) => c.parentId === category.id);
            const subGroups = subCategories
              .map((sc) => ({ subCategory: sc, items: tasks.filter((t) => t.categoryId === sc.id) }))
              .filter((g) => g.items.length > 0);
            const hasSubGroups = subGroups.length > 0;
            const expanded = expandedCategories[category.id] ?? true;

            return (
              <section key={category.id} className="flex flex-col gap-2">
                <header
                  className="flex items-center gap-2 px-1 py-0.5 cursor-pointer select-none"
                  onClick={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !(prev[category.id] ?? true) }))}
                >
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 transition-transform"
                    style={{
                      color: colorVar(category.color),
                      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: colorVar(category.color) }}
                  />
                  <h2
                    className="text-xs font-medium uppercase tracking-wider pr-1.5"
                    style={{ color: colorVar(category.color) }}
                  >
                    {category.name}
                  </h2>
                  <span className="text-[11px] text-muted-foreground/50 font-normal shrink-0">
                    {items.length + subGroups.reduce((sum, g) => sum + g.items.length, 0)}
                  </span>
                </header>

                {expanded && (
                  <>
                    <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2">
                        {items.map((t) => (
                          <TaskItem
                            key={t.id}
                            task={t}
                            category={category}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onStartEdit={onStartEdit}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    {subGroups.map(({ subCategory, items: subItems }) => {
                      const subExpanded = expandedSubCategories[subCategory.id] ?? true;
                      return (
                        <div key={subCategory.id} className="flex flex-col gap-2 ml-2">
                          <header
                            className="flex items-center gap-1.5 px-1 py-0.5 cursor-pointer select-none"
                            onClick={() => setExpandedSubCategories(prev => ({
                              ...prev,
                              [subCategory.id]: !(prev[subCategory.id] ?? true)
                            }))}
                          >
                            <ChevronRight
                              className="h-2.5 w-2.5 shrink-0 transition-transform"
                              style={{
                                color: "hsl(220 12% 58%)",
                                transform: subExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              }}
                            />
                            <span
                              className="h-1 w-1 rounded-full shrink-0"
                              style={{ backgroundColor: "hsl(220 12% 58%)" }}
                            />
                            <h3
                                className="text-[11px] font-medium uppercase tracking-wider pr-1"
                                style={{ color: "hsl(220 12% 52%)" }}
                              >
                                {subCategory.name}
                              </h3>
                              <span className="text-[10px] text-muted-foreground/35 font-normal shrink-0">
                                {subItems.length}
                              </span>
                          </header>
                      {subExpanded && (
                          <SortableContext items={subItems.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-2 ml-2">
                            {subItems.map((t) => (
                              <TaskItem
                                key={t.id}
                                task={t}
                                category={subCategory}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                onStartEdit={onStartEdit}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </div>
                  );
                })}
                  </>
                )}
              </section>
            );
          })}
        </div>
      </DndContext>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 px-3 py-3">
          {tasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              category={categories.find((p) => p.id === t.categoryId)}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onStartEdit={onStartEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
