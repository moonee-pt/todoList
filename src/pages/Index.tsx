import { useMemo, useState } from "react";
import { useTodoStore } from "@/hooks/useTodoStore";
import { useTheme } from "@/hooks/useTheme";
import { FilterBar } from "@/components/todo/FilterBar";
import { TaskList } from "@/components/todo/TaskList";
import { AddTaskBar } from "@/components/todo/AddTaskBar";
import { PrioritySettings } from "@/components/todo/PrioritySettings";
import { ListTodo, CheckCircle2 } from "lucide-react";

type Tab = "todo" | "done";

const Index = () => {
  const {
    priorities,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    reorderTasks,
    upsertPriority,
    removePriority,
    reorderPriorities,
  } = useTodoStore();

  const { theme, toggle: toggleTheme } = useTheme();

  const [tab, setTab] = useState<Tab>("todo");
  const [filter, setFilter] = useState<string | "all">("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    text: string;
    priorityId: string;
  } | null>(null);

  const visible = useMemo(() => {
    return tasks.filter((t) => {
      if (tab === "todo" && t.done) return false;
      if (tab === "done" && !t.done) return false;
      if (filter !== "all" && t.priorityId !== filter) return false;
      return true;
    });
  }, [tasks, tab, filter]);

  const groupByPriority = filter === "all";

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative">
      <FilterBar
        priorities={priorities}
        selected={filter}
        onSelect={setFilter}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 pb-44">
        <TaskList
          tasks={visible}
          priorities={priorities}
          groupByPriority={groupByPriority}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onEdit={updateTask}
          onStartEdit={(task) => setEditingTask(task)}
          onReorder={(from, to) => reorderTasks(tab === "done", from, to)}
          emptyText={tab === "todo" ? "暂无待办任务，添加一个开始吧 ✨" : "还没有完成的任务"}
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <AddTaskBar
          priorities={priorities}
          editingTask={editingTask}
          onAdd={addTask}
          onUpdate={(id, text, priorityId) => {
            updateTask(id, text);
            if (priorities.find((p) => p.id === priorityId)) {
              const task = tasks.find((t) => t.id === id);
              if (task && task.priorityId !== priorityId) {
                deleteTask(id);
                addTask(text, priorityId);
              }
            }
            setEditingTask(null);
          }}
          onCancelEdit={() => setEditingTask(null)}
        />
        <nav className="grid grid-cols-2 bg-card/90 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setTab("todo")}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              tab === "todo" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListTodo className="h-5 w-5" />
            待办
          </button>
          <button
            onClick={() => setTab("done")}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              tab === "done" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            已完成
          </button>
        </nav>
      </div>

      <PrioritySettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        priorities={priorities}
        onUpsert={upsertPriority}
        onRemove={removePriority}
        onReorder={reorderPriorities}
      />
    </div>
  );
};

export default Index;
