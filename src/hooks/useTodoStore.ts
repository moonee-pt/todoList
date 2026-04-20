import { useEffect, useState, useCallback } from "react";
import { DEFAULT_CATEGORIES, Category, Task } from "@/lib/todo-types";

const KEY_TASKS = "todo.tasks.v1";
const KEY_CATEGORIES = "todo.categories.v1";
const KEY_OLD_PRIORITIES = "todo.priorities.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function migrateData(): {
  categories: Category[];
  tasks: Task[];
} {
  const oldPriorities = localStorage.getItem(KEY_OLD_PRIORITIES);
  const oldTasks = localStorage.getItem(KEY_TASKS);
  const hasNewCategories = localStorage.getItem(KEY_CATEGORIES);

  if (hasNewCategories) {
    return {
      categories: load<Category[]>(KEY_CATEGORIES, DEFAULT_CATEGORIES),
      tasks: load<Task[]>(KEY_TASKS, []),
    };
  }

  let categories: Category[] = DEFAULT_CATEGORIES;
  let tasks: Task[] = [];

  if (oldPriorities) {
    try {
      const priorities = JSON.parse(oldPriorities) as any[];
      categories = priorities.map((p) => ({
        ...p,
        parentId: null,
      }));
    } catch {}
  }

  if (oldTasks) {
    try {
      tasks = JSON.parse(oldTasks).map((t: any) => {
        if (t.priorityId && !t.categoryId) {
          return { ...t, categoryId: t.priorityId };
        }
        return t;
      });
    } catch {}
  }

  return { categories, tasks };
}

export function useTodoStore() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const data = migrateData();
    const hasNewCategories = localStorage.getItem(KEY_CATEGORIES);
    if (!hasNewCategories) {
      localStorage.setItem(KEY_CATEGORIES, JSON.stringify(data.categories));
    }

    const storedTasks = localStorage.getItem(KEY_TASKS);
    let finalTasks = data.tasks;
    if (storedTasks && data.tasks.length === 0) {
      try {
        finalTasks = JSON.parse(storedTasks);
      } catch {}
    }

    setCategories(data.categories);
    setTasks(finalTasks);
    setInitialized(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((text: string, categoryId: string) => {
    if (!text.trim()) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), text: text.trim(), categoryId, done: false, createdAt: Date.now() },
      ...prev,
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTask = useCallback((id: string, text: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
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

  const reorderCategories = useCallback((fromId: string, toId: string) => {
    setCategories((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === fromId);
      const toIdx = prev.findIndex((p) => p.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const upsertCategory = useCallback((p: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx < 0) return [...prev, p];
      const next = [...prev];
      next[idx] = p;
      return next;
    });
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
    
    setTasks((prev) => {
      const remaining = categories.filter((p) => p.id !== id);
      const fallback = remaining[0]?.id;
      if (!fallback) return prev;
      return prev.map((t) => (t.categoryId === id ? { ...t, categoryId: fallback } : t));
    });
  }, [categories]);

  const addSubCategory = useCallback((parentId: string) => {
    setCategories((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "子文件夹",
        color: "gray",
        parentId,
      },
    ]);
  }, []);

  const importData = useCallback((newCategories: Category[], newTasks: Task[]) => {
    setCategories(newCategories);
    setTasks(newTasks);
  }, []);

  return {
    categories,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    reorderTasks,
    upsertCategory,
    removeCategory,
    reorderCategories,
    setCategories,
    addSubCategory,
    importData,
  };
}
