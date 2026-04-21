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
      console.log("[DATA_RESCUE]", msg);
      logs.push(msg);
    };

    log("=== 开始数据恢复 ===");
    log("LocalStorage 条目总数: " + localStorage.length);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const raw = localStorage.getItem(key);
        const len = raw ? raw.length : 0;
        log(`找到 Key: ${key} (长度: ${len})`);
      }
    }

    const catRaw = localStorage.getItem(KEY_CATEGORIES);
    const taskRaw = localStorage.getItem(KEY_TASKS);
    const oldPrioRaw = localStorage.getItem(KEY_OLD_PRIORITIES);

    log("");
    log(`KEY_CATEGORIES 存在: ${!!catRaw}`);
    log(`KEY_TASKS 存在: ${!!taskRaw}, 内容长度: ${taskRaw?.length || 0}`);
    log(`KEY_OLD_PRIORITIES 存在: ${!!oldPrioRaw}`);

    let finalCategories: Category[] = DEFAULT_CATEGORIES;
    let finalTasks: Task[] = [];

    if (catRaw) {
      try {
        finalCategories = JSON.parse(catRaw);
        log(`加载分类成功: ${finalCategories.length} 个`);
      } catch (e) {
        log(`解析分类失败: ${e}`);
      }
    }

    let allTaskArrays: { key: string; tasks: Task[] }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text) {
          const mapped = parsed.map((t: any) => ({
            ...t,
            categoryId: t.categoryId || t.priorityId,
          }));
          allTaskArrays.push({ key, tasks: mapped });
          log(`找到任务数组: ${key} => ${mapped.length} 个任务`);
        }
      } catch {}
    }

    if (allTaskArrays.length > 0) {
      allTaskArrays.sort((a, b) => b.tasks.length - a.tasks.length);
      const best = allTaskArrays[0];
      log(`选择任务最多的: ${best.key} => ${best.tasks.length} 个任务`);
      finalTasks = best.tasks;
    }

    if (finalTasks.length === 0 && oldPrioRaw && taskRaw) {
      log("旧优先级数据存在，重新迁移任务...");
      try {
        finalTasks = JSON.parse(taskRaw).map((t: any) => ({
          ...t,
          categoryId: t.categoryId || t.priorityId,
        }));
        log(`从原始数据迁移成功: ${finalTasks.length} 个任务`);
      } catch {}
    }

    log("");
    log(`=== 最终结果 ===`);
    log(`分类: ${finalCategories.length} 个`);
    log(`任务: ${finalTasks.length} 个`);

    setDebugInfo(logs.join("\n"));
    setCategories(finalCategories);
    setTasks(finalTasks);
    firstLoadDone.current = true;

    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(finalCategories));
    localStorage.setItem(KEY_TASKS, JSON.stringify(finalTasks));

    log("数据已写回 localStorage，修复完成！");
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
