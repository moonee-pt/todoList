import { useEffect, useState, useCallback, useRef } from "react";
import { DEFAULT_CATEGORIES, Category, Task } from "@/lib/todo-types";

const KEY_TASKS = "todo.tasks.v1";
const KEY_CATEGORIES = "todo.categories.v1";
const KEY_OLD_PRIORITIES = "todo.priorities.v1";

export function useTodoStore() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const firstLoadDone = useRef(false);

  useEffect(() => {
    if (firstLoadDone.current) return;

    const logs: string[] = [];
    const log = (msg: string) => {
      console.log("[INIT]", msg);
      logs.push(msg);
    };

    let finalCategories = DEFAULT_CATEGORIES;
    let finalTasks: Task[] = [];

    try {
      const catRaw = localStorage.getItem(KEY_CATEGORIES);
      const taskRaw = localStorage.getItem(KEY_TASKS);

      if (catRaw) {
        finalCategories = JSON.parse(catRaw);
        log(`✓ 加载分类: ${finalCategories.length} 个`);
      }

      if (taskRaw) {
        const rawTasks = JSON.parse(taskRaw);
        if (rawTasks.length > 0) {
          finalTasks = rawTasks.map((t: any) => ({
            ...t,
            categoryId: t.categoryId || t.priorityId,
          }));
          log(`✓ 加载任务: ${finalTasks.length} 个`);
        }
      }

      if (finalTasks.length === 0) {
        const oldPrioRaw = localStorage.getItem(KEY_OLD_PRIORITIES);
        if (oldPrioRaw && taskRaw) {
          finalTasks = JSON.parse(taskRaw).map((t: any) => ({
            ...t,
            categoryId: t.categoryId || t.priorityId,
          }));
          log(`✓ 从旧版迁移: ${finalTasks.length} 个任务`);
        }
      }
    } catch (e) {
      log(`✗ 加载错误: ${e}`);
    }

    log(`=== 最终状态 ===`);
    log(`分类: ${finalCategories.length} 个`);
    log(`任务: ${finalTasks.length} 个`);

    firstLoadDone.current = true;
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(finalCategories));
    localStorage.setItem(KEY_TASKS, JSON.stringify(finalTasks));

    setDebugInfo(logs.join("\n"));
    setCategories(finalCategories);
    setTasks(finalTasks);
  }, []);

  useEffect(() => {
    if (!firstLoadDone.current) return;
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (!firstLoadDone.current) return;
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
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: text.trim() } : t)));
  }, []);

  const reorderTasks = useCallback((isDone: boolean, from: number, to: number) => {
    setTasks((prev) => {
      const filtered = prev.filter((t) => t.done === isDone);
      const rest = prev.filter((t) => t.done !== isDone);
      const [item] = filtered.splice(from, 1);
      filtered.splice(to, 0, item);
      return [...filtered, ...rest];
    });
  }, []);

  const addCategory = useCallback((name: string, color: string, parentId: string | null = null) => {
    setCategories((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, color: parentId ? "gray" : color, parentId },
    ]);
  }, []);

  const updateCategory = useCallback((id: string, name: string, color?: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, color: color ?? c.color } : c))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
  }, []);

  const reorderCategories = useCallback((from: number, to: number) => {
    setCategories((prev) => {
      const roots = prev.filter((c) => !c.parentId);
      const subs = prev.filter((c) => c.parentId);
      const [item] = roots.splice(from, 1);
      roots.splice(to, 0, item);
      return [...roots, ...subs];
    });
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
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    importData,
    debugInfo,
    showDebug,
    setShowDebug,
  };
}
