export type PriorityColor = "red" | "orange" | "yellow" | "green" | "blue";

export interface Priority {
  id: string;
  name: string;
  color: PriorityColor;
}

export interface Task {
  id: string;
  text: string;
  priorityId: string;
  done: boolean;
  createdAt: number;
}

export const COLOR_OPTIONS: { key: PriorityColor; label: string; varName: string }[] = [
  { key: "red", label: "红", varName: "--prio-red" },
  { key: "orange", label: "橙", varName: "--prio-orange" },
  { key: "yellow", label: "黄", varName: "--prio-yellow" },
  { key: "green", label: "绿", varName: "--prio-green" },
  { key: "blue", label: "蓝", varName: "--prio-blue" },
];

export const colorVar = (c: PriorityColor) => `hsl(var(--prio-${c}))`;
export const colorVarSoft = (c: PriorityColor) => `hsl(var(--prio-${c}) / 0.15)`;

export const DEFAULT_PRIORITIES: Priority[] = [
  { id: "p1", name: "紧急 BUG", color: "red" },
  { id: "p2", name: "需求优化", color: "orange" },
  { id: "p3", name: "长期规划", color: "blue" },
  { id: "p4", name: "细节调整", color: "green" },
  { id: "p5", name: "待讨论", color: "yellow" },
];
