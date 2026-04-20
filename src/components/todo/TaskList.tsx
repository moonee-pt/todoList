import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, Priority, colorVar } from "@/lib/todo-types";
import { TaskItem } from "./TaskItem";

interface Props {
  tasks: Task[];
  priorities: Priority[];
  groupByPriority?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  emptyText: string;
}

export const TaskList = ({
  tasks,
  priorities,
  groupByPriority = false,
  onToggle,
  onDelete,
  onReorder,
  emptyText,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } })
  );

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  if (tasks.length === 0) {
    return (
      <div className="px-6 py-20 text-center text-sm text-muted-foreground">{emptyText}</div>
    );
  }

  if (groupByPriority) {
    const groups = priorities
      .map((p) => ({ priority: p, items: tasks.filter((t) => t.priorityId === p.id) }))
      .filter((g) => g.items.length > 0);

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-5 px-3 py-3">
            {groups.map(({ priority, items }) => (
              <section key={priority.id} className="flex flex-col gap-2">
                <header className="flex items-center gap-2 px-1">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorVar(priority.color) }}
                  />
                  <h2
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colorVar(priority.color) }}
                  >
                    {priority.name}
                  </h2>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </header>
                <div className="flex flex-col gap-2">
                  {items.map((t) => (
                    <TaskItem
                      key={t.id}
                      task={t}
                      priority={priority}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 px-3 py-3">
          {tasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              priority={priorities.find((p) => p.id === t.priorityId)}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
