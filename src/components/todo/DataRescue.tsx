import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download, Check } from "lucide-react";

export const DataRescue = () => {
  const [found, setFound] = useState<any[]>([]);
  const [rescued, setRescued] = useState(false);

  useEffect(() => {
    const results: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            results.push({ key, data });
          } catch {
            results.push({ key, raw: raw.slice(0, 100) });
          }
        }
      }
    }
    setFound(results);
  }, []);

  const doRescue = () => {
    let maxTasks: any[] = [];
    let maxKey = "";

    found.forEach((f) => {
      if (Array.isArray(f.data) && f.data.length > 0 && f.data[0].text) {
        if (f.data.length > maxTasks.length) {
          maxTasks = f.data;
          maxKey = f.key;
        }
      }
    });

    if (maxTasks.length > 0) {
      const fixed = maxTasks.map((t: any) => {
        if (t.priorityId && !t.categoryId) {
          return { ...t, categoryId: t.priorityId };
        }
        return t;
      });
      localStorage.setItem("todo.tasks.v1", JSON.stringify(fixed));
      setRescued(true);
      alert(`已从 ${maxKey} 恢复 ${fixed.length} 条任务！\n刷新页面即可看到！`);
    } else {
      alert("没找到可以恢复的任务数据 :(");
    }
  };

  const exportAll = () => {
    const all: Record<string, any> = {};
    found.forEach((f) => {
      all[f.key] = f.data || f.raw;
    });
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todo-backup.json";
    a.click();
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl p-4 mx-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">数据急救箱</span>
      </div>

      <div className="text-xs text-amber-700 dark:text-amber-400 mb-3 space-y-1">
        <p>🔍 扫描到 localStorage 中有 {found.length} 条数据</p>
        {found.map((f, i) => (
          <p key={i} className="pl-2">
            {f.key}: {Array.isArray(f.data) ? `${f.data.length} 条记录` : typeof f.data === "object" ? "对象" : f.raw}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={doRescue} className="text-xs h-7" disabled={rescued}>
          {rescued ? <Check className="h-3.5 w-3.5 mr-1" /> : null}
          {rescued ? "已恢复" : "一键恢复数据"}
        </Button>
        <Button size="sm" variant="ghost" onClick={exportAll} className="text-xs h-7">
          <Download className="h-3.5 w-3.5 mr-1" />
          导出备份
        </Button>
      </div>
    </div>
  );
};
