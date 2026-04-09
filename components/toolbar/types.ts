import { ReactNode } from "react";

export interface ToolbarToggleItem {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

export interface ToolbarProps {
  toggles?: ToolbarToggleItem[];
  actions?: ToolbarAction[];
  className?: string;
}
