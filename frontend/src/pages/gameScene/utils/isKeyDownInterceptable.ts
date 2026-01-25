import type Konva from "konva";

export default (e: KeyboardEvent, stage: Konva.Stage) => {
  const target = e.target as HTMLElement | null;
  const tag = (target?.tagName || "").toLowerCase();
  const isEditable = tag === "input" || tag === "textarea" || (target && (target as HTMLElement).isContentEditable);

  // In Konva, there is no built-in isEditing.
  // If we implement a custom text editor (e.g. using a textarea),
  // it would be caught by the isEditable check above.
  return !isEditable;
};
