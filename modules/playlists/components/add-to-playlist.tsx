"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AddToPlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  problemId: string | null;
};

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  onSubmit,
  problemId,
}: AddToPlaylistModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add To Playlist</DialogTitle>
          <DialogDescription>
            Save this problem once playlist storage is connected.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!problemId}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
