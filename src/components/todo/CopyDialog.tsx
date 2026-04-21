import { Copy, Check, ClipboardPaste, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Task, Category, DEFAULT_COLORS } from "@/lib/todo-types";
import { useState, useMemo } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  tasks: Task[];
  onImport: (categories: Category[], tasks: Task[]) => void;
}

export const CopyDialog = ({ open, onOpenChange, categories, tasks, onImport }: Props) => {
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<"overwrite" | "append">("overwrite");

  const parseIndent = (line: string): number => {
    let count = 0;
    for (const c of line) {
      if (c === " ") count++;
      else break;
    }
    return count;
  };

  const warnings = useMemo(() => {
    const result: string[] = [];
    if (!pasteText.trim()) return result;

    const lines = pasteText.split("\n").filter((l) => l.trim());

    let maxLevel = 0;
    let hasContent = false;
    let lastIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const text = line.trim();
      if (!text || text === "待办" || text === "已完成" || text.startsWith("———")) continue;

      hasContent = true;
      const indent = parseIndent(line);

      if (indent > lastIndent + 3 && lastIndent > 0) {
        result.push(`第 ${i + 1} 行：缩进可能跳得太大了`);
      }
      lastIndent = indent;
      maxLevel = Math.max(maxLevel, indent);
    }

    if (!hasContent) {
      result.push("没有识别到有效内容");
    } else if (maxLevel < 2) {
      result.push("⚠️ 注意：大分类名称前面需要有 2 个空格缩进");
    }

    return result.slice(0, 3);
  }, [pasteText]);

  const generateText = (): string => {
    const lines: string[] = [];
    const rootCategories = categories.filter((c) => !c.parentId);

    const hasTodo = rootCategories.some((cat) => {
      const catTasks = tasks.filter((t) => t.categoryId === cat.id && !t.done);
      const subCategories = categories.filter((c) => c.parentId === cat.id);
      return catTasks.length > 0 || subCategories.some((sc) => tasks.some((t) => t.categoryId === sc.id && !t.done));
    });

    if (hasTodo) {
      lines.push("待办");
      lines.push("");
    }

    rootCategories.forEach((cat) => {
      const catTasks = tasks.filter((t) => t.categoryId === cat.id && !t.done);
      const subCategories = categories.filter((c) => c.parentId === cat.id);

      if (catTasks.length > 0 || subCategories.some((sc) => tasks.some((t) => t.categoryId === sc.id && !t.done))) {
        lines.push(`  ${cat.name}`);

        catTasks.forEach((t) => {
          lines.push(`    ${t.text}`);
        });

        subCategories.forEach((sc) => {
          const subTasks = tasks.filter((t) => t.categoryId === sc.id && !t.done);
          if (subTasks.length > 0) {
            lines.push(`    ${sc.name}`);
            subTasks.forEach((t) => {
              lines.push(`      ${t.text}`);
            });
          }
        });

        lines.push("");
      }
    });

    const doneTasks = tasks.filter((t) => t.done);
    if (doneTasks.length > 0) {
      lines.push("");
      lines.push("——————————");
      lines.push("已完成");
      lines.push("");

      rootCategories.forEach((cat) => {
        const catTasks = doneTasks.filter((t) => t.categoryId === cat.id);
        const subCategories = categories.filter((c) => c.parentId === cat.id);

        if (catTasks.length > 0 || subCategories.some((sc) => doneTasks.some((t) => t.categoryId === sc.id))) {
          lines.push(`  ${cat.name}`);

          catTasks.forEach((t) => {
            lines.push(`    ${t.text}`);
          });

          subCategories.forEach((sc) => {
            const subTasks = doneTasks.filter((t) => t.categoryId === sc.id);
            if (subTasks.length > 0) {
              lines.push(`    ${sc.name}`);
              subTasks.forEach((t) => {
                lines.push(`      ${t.text}`);
              });
            }
          });

          lines.push("");
        }
      });
    }

    return lines.join("\n").trim();
  };

  const handleImport = () => {
    if (!pasteText.trim()) return;
    setImporting(true);

    const allLines = pasteText.split("\n").map((l) => l.trimEnd());
    const newCategories: Category[] = importMode === "append" ? [...categories] : [];
    const newTasks: Task[] = importMode === "append" ? [...tasks] : [];
    let colorIndex = 0;

    const findCategory = (name: string, parentId: string | null): Category | undefined => {
      return newCategories.find((c) => c.name === name && c.parentId === parentId);
    };

    const getNextColor = (): string => {
      const color = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
      colorIndex++;
      return color;
    };

    const getNextLineIndent = (idx: number): number | null => {
      for (let i = idx + 1; i < allLines.length; i++) {
        const line = allLines[i];
        if (!line.trim()) continue;
        return parseIndent(line);
      }
      return null;
    };

    let currentParent: Category | null = null;
    let currentSub: Category | null = null;
    let isDoneSection = false;

    for (let i = 0; i < allLines.length; i++) {
      const rawLine = allLines[i];
      const indent = parseIndent(rawLine);
      const text = rawLine.trim();

      if (!text || text === "待办" || text.startsWith("———")) {
        if (text === "已完成") isDoneSection = true;
        continue;
      }

      const nextIndent = getNextLineIndent(i);
      const level = indent <= 3 ? 0 : indent <= 5 ? 1 : 2;
      const nextLevel = nextIndent === null ? null : nextIndent <= 3 ? 0 : nextIndent <= 5 ? 1 : 2;

      if (level === 0) {
        let cat = findCategory(text, null);
        if (!cat) {
          cat = {
            id: crypto.randomUUID(),
            name: text,
            color: getNextColor(),
            parentId: null,
          };
          newCategories.push(cat);
        }
        currentParent = cat;
        currentSub = null;
      } else if (level === 1) {
        if (!currentParent) continue;

        if (nextLevel !== null && nextLevel > level) {
          let cat = findCategory(text, currentParent.id);
          if (!cat) {
            cat = {
              id: crypto.randomUUID(),
              name: text,
              color: "gray",
              parentId: currentParent.id,
            };
            newCategories.push(cat);
          }
          currentSub = cat;
        } else {
          newTasks.push({
            id: crypto.randomUUID(),
            text,
            categoryId: currentParent.id,
            done: isDoneSection,
            createdAt: Date.now(),
          });
        }
      } else if (level >= 2) {
        const category = currentSub || currentParent;
        if (!category) continue;
        newTasks.push({
          id: crypto.randomUUID(),
          text,
          categoryId: category.id,
          done: isDoneSection,
          createdAt: Date.now(),
        });
      }
    }

    onImport(newCategories, newTasks);
    setPasteText("");
    setImporting(false);
    onOpenChange(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] rounded-2xl flex flex-col gap-3 p-4 min-h-0 overflow-hidden">
          <Tabs defaultValue="copy" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-left text-base">备份 & 恢复</DialogTitle>
            <TabsList className="h-8 grid grid-cols-2">
              <TabsTrigger value="copy" className="text-xs h-7 px-3">
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                复制
              </TabsTrigger>
              <TabsTrigger value="paste" className="text-xs h-7 px-3">
                <ClipboardPaste className="h-3.5 w-3.5 mr-1.5" />
                粘贴导入
              </TabsTrigger>
            </TabsList>
          </DialogHeader>

          <TabsContent value="copy" className="flex-1 flex flex-col gap-0 mt-0 overflow-hidden min-h-0">
            <div className="flex-1 overflow-auto p-3 bg-secondary/40 rounded-xl border-2 border-transparent mb-3">
              <pre className="text-sm leading-snug whitespace-pre-wrap select-all m-0 font-mono">
                {generateText()}
              </pre>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                size="sm"
                onClick={handleCopy}
                className="h-8 rounded-lg gap-1.5 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "已复制" : "一键复制"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="flex-1 flex flex-col gap-0 mt-0 overflow-hidden min-h-0">
            <div className="flex-1 overflow-auto p-3 bg-secondary/40 rounded-xl border-2 border-dashed border-border/60 mb-3">
              <Textarea
                className="h-full resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                onKeyDown={(e) => {
                  const textarea = e.currentTarget;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const lines = pasteText.split("\n");

                  let lineIdx = 0;
                  let pos = 0;
                  for (let i = 0; i < lines.length; i++) {
                    if (pos + lines[i].length + 1 > start) {
                      lineIdx = i;
                      break;
                    }
                    pos += lines[i].length + 1;
                  }

                  if (e.key === "Tab") {
                    e.preventDefault();
                    const line = lines[lineIdx];
                    const indent = parseIndent(line);

                    if (e.shiftKey) {
                      const newIndent = Math.max(0, indent - 2);
                      const spaces = " ".repeat(newIndent);
                      lines[lineIdx] = spaces + line.trim();
                      setPasteText(lines.join("\n"));
                    } else {
                      const newIndent = Math.min(6, indent + 2);
                      const spaces = " ".repeat(newIndent);
                      lines[lineIdx] = spaces + line.trim();
                      setPasteText(lines.join("\n"));
                    }
                  }

                  if (e.key === "Enter") {
                    e.preventDefault();
                    const indent = parseIndent(lines[lineIdx]);
                    lines.splice(lineIdx + 1, 0, " ".repeat(indent));
                    setPasteText(lines.join("\n"));
                    setTimeout(() => {
                      const newPos = pos + lines[lineIdx].length + 1 + indent;
                      textarea.setSelectionRange(newPos, newPos);
                    }, 0);
                  }
                }}
                placeholder="在此处粘贴编辑，Tab 调缩进，Enter 换行继承..."
                className="w-full h-full min-h-[240px] resize-none text-sm leading-snug bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground/40 font-mono"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60 px-1 mb-4 mt-1">
              💡 Tab 右移 · Shift+Tab 左移 · Enter 自动对齐上一行
            </p>

            <RadioGroup
              value={importMode}
              onValueChange={(v) => setImportMode(v as "overwrite" | "append")}
              className="flex items-center gap-4 mb-4 mt-2 px-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="overwrite" id="overwrite" className="h-4 w-4" />
                <Label htmlFor="overwrite" className="text-xs cursor-pointer">覆盖替换</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="append" id="append" className="h-4 w-4" />
                <Label htmlFor="append" className="text-xs cursor-pointer">追加合并</Label>
              </div>
            </RadioGroup>

            {warnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-2.5 mb-2 shrink-0">
                {warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    {w}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                size="sm"
                onClick={handleImport}
                disabled={!pasteText.trim() || importing}
                className="h-8 rounded-lg gap-1.5 text-xs"
              >
                {importing ? (
                  <span className="animate-pulse">导入中...</span>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    开始导入
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
