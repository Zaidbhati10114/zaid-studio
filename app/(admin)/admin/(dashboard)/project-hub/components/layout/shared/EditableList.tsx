"use client";

import { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";

interface EditableListProps {
  items?: string[];

  renderItem: (value: string, index: number) => ReactNode;

  addLabel: string;

  onAdd: () => void;

  onRemove: (index: number) => void;

  emptyMessage?: string;
}

export function EditableList({
  items,
  renderItem,
  addLabel,
  onAdd,
  onRemove,
  emptyMessage = "No items yet.",
}: EditableListProps) {
  const values = items ?? [];
  return (
    <div className="space-y-4">
      {values.length === 0 ? (
        <EmptyState title={emptyMessage} />
      ) : (
        <div className="space-y-3">
          {values.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">{renderItem(item, index)}</div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onAdd}
      >
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
