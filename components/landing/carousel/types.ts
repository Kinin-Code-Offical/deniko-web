import type { ReactNode } from "react";

export interface CardItem {
  id: number;
  title: string;
  component: ReactNode;
}

export enum CardPosition {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
  HIDDEN = "hidden",
}
