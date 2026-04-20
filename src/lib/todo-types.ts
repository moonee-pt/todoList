export type CategoryColor = "red" | "orange" | "blue" | "yellow" | "green" | "gray";

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
  parentId: string | null;
}

export interface Task {
  id: string;
  text: string;
  categoryId: string;
  done: boolean;
  createdAt: number;
}

export const COLOR_OPTIONS: { key: CategoryColor; label: string; varName: string }[] = [
  { key: "red", label: "红", varName: "--prio-red" },
  { key: "orange", label: "橙", varName: "--prio-orange" },
  { key: "blue", label: "蓝", varName: "--prio-blue" },
  { key: "yellow", label: "黄", varName: "--prio-yellow" },
  { key: "green", label: "绿", varName: "--prio-green" },
];

export const DEFAULT_COLORS: CategoryColor[] = ["red", "orange", "blue", "yellow", "green"];

export const colorVar = (c: CategoryColor) => `hsl(var(--prio-${c}))`;
export const colorVarSoft = (c: CategoryColor) => `hsl(var(--prio-${c}) / 0.15)`;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "p1", name: "工作", color: "red", parentId: null },
  { id: "p2", name: "学习", color: "orange", parentId: null },
  { id: "p3", name: "生活", color: "blue", parentId: null },
  { id: "p4", name: "健康", color: "yellow", parentId: null },
  { id: "p5", name: "其他", color: "green", parentId: null },
];
