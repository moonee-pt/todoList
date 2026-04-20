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
import { Task, Priority } from "@/lib/todo-types";
import { TaskItem } from "./TaskItem";

interface Props {
  tasks: Task[];
  priorities: Priority[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  emptyText: string;
}

export const TaskList = ({ tasks, priorities, onToggle, onDelete, onReorder, emptyText }: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } })
  );

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  if (tasks.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-sm text-muted-foreground">{emptyText}</div>
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
