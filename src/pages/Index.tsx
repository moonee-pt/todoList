import { useMemo, useState } from "react";
import { useTodoStore } from "@/hooks/useTodoStore";
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
    reorderTasks,
    upsertPriority,
    removePriority,
  } = useTodoStore();

  const [tab, setTab] = useState<Tab>("todo");
  const [filter, setFilter] = useState<string | "all">("all");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const visible = useMemo(() => {
    return tasks.filter((t) => {
      if (tab === "todo" && t.done) return false;
      if (tab === "done" && !t.done) return false;
      if (filter !== "all" && t.priorityId !== filter) return false;
      return true;
    });
  }, [tasks, tab, filter]);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <FilterBar
        priorities={priorities}
        selected={filter}
        onSelect={setFilter}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 pb-40">
        <TaskList
          tasks={visible}
          priorities={priorities}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onReorder={(from, to) => reorderTasks(tab === "done", from, to)}
          emptyText={tab === "todo" ? "暂无待办任务" : "暂无已完成任务"}
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <AddTaskBar priorities={priorities} onAdd={addTask} />
        <nav className="grid grid-cols-2 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setTab("todo")}
            className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
              tab === "todo" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <ListTodo className="h-5 w-5" />
            待办
          </button>
          <button
            onClick={() => setTab("done")}
            className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
              tab === "done" ? "text-foreground" : "text-muted-foreground"
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
      />
    </div>
  );
};

export default Index;
