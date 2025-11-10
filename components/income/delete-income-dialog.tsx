"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteIncomeDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteIncomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this income?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2 sm:space-x-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-20"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            variant="destructive"
            className="w-20"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

