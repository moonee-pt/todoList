import { useEffect, useState, useCallback } from "react";
import { DEFAULT_PRIORITIES, Priority, Task } from "@/lib/todo-types";

const KEY_TASKS = "todo.tasks.v1";
const KEY_PRIOS = "todo.priorities.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useTodoStore() {
  const [priorities, setPriorities] = useState<Priority[]>(() =>
    load<Priority[]>(KEY_PRIOS, DEFAULT_PRIORITIES)
  );
  const [tasks, setTasks] = useState<Task[]>(() => load<Task[]>(KEY_TASKS, []));

  useEffect(() => {
    localStorage.setItem(KEY_PRIOS, JSON.stringify(priorities));
  }, [priorities]);

  useEffect(() => {
    localStorage.setItem(KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((text: string, priorityId: string) => {
    if (!text.trim()) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), text: text.trim(), priorityId, done: false, createdAt: Date.now() },
      ...prev,
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const editTask = useCallback((id: string, text: string) => {
    const v = text.trim();
    if (!v) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: v } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const reorderTasks = useCallback((doneScope: boolean, fromId: string, toId: string) => {
    setTasks((prev) => {
      const scope = prev.filter((t) => t.done === doneScope);
      const others = prev.filter((t) => t.done !== doneScope);
      const fromIdx = scope.findIndex((t) => t.id === fromId);
      const toIdx = scope.findIndex((t) => t.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...scope];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      
      const result: Task[] = [];
      let scopePtr = 0;
      for (const t of prev) {
        if (t.done === doneScope) {
          result.push(next[scopePtr++]);
        } else {
          result.push(t);
        }
      }
      return result;
    });
  }, []);

  const reorderPriorities = useCallback((fromId: string, toId: string) => {
    setPriorities((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === fromId);
      const toIdx = prev.findIndex((p) => p.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const upsertPriority = useCallback((p: Priority) => {
    setPriorities((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx < 0) return [...prev, p];
      const next = [...prev];
      next[idx] = p;
      return next;
    });
  }, []);

  const removePriority = useCallback((id: string) => {
    setPriorities((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
    
    setTasks((prev) => {
      const remaining = priorities.filter((p) => p.id !== id);
      const fallback = remaining[0]?.id;
      if (!fallback) return prev;
      return prev.map((t) => (t.priorityId === id ? { ...t, priorityId: fallback } : t));
    });
  }, [priorities]);

  return {
    priorities,
    tasks,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    reorderTasks,
    upsertPriority,
    removePriority,
    reorderPriorities,
    setPriorities,
  };
}
