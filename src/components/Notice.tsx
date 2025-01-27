import { Info, CheckCircle2, TriangleAlert, CircleX } from "lucide-react";
import React from "react";

export type NoticeProps = {
  type: "error" | "info" | "success" | "warning";
  message: string;
  className?: string;
};

export default function Notice(props: NoticeProps) {
  const colors = {
    error:
      "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-800 text-red-600 dark:text-red-200",
    success:
      "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-800 text-green-600 dark:text-green-200",
    info: "border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-200",
    warning:
      "border-orange-500 dark:border-orange-500 bg-orange-50 dark:bg-orange-800 text-orange-600 dark:text-orange-200",
  };
  return (
    <div
      className={`flex border ${colors[props.type]} p-3 my-4 rounded-md w-full max-w-xs ${
        props.className ?? ""
      }`}
    >
      {props.type === "success" && (<CheckCircle2 className="size-5 stroke-current" />)}
      {props.type === "error" && <CircleX className="size-5 stroke-current" />}
      {props.type === "info" && <Info className="size-5 stroke-current" />}
      {props.type === "warning" && (<TriangleAlert className="size-5 stroke-current" />)}
      <span className="ml-2 text-sm">{props.message}</span>
    </div>
  );
}
