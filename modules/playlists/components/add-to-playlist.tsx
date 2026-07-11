"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Playlist } from "@/modules/playlists/hooks/use-playlist-action";

type AddToPlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playlistId: string) => void;
  problemId: string | null;
  playlists: Playlist[];
  isLoadingPlaylists?: boolean;
};

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  onSubmit,
  problemId,
  playlists,
  isLoadingPlaylists,
}: AddToPlaylistModalProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );

  // Reset the selection each time the modal is opened for a (possibly
  // different) problem, so a stale choice from a previous open isn't reused.
  useEffect(() => {
    if (isOpen) {
      setSelectedPlaylistId(null);
    }
  }, [isOpen, problemId]);

  const handleSave = () => {
    if (!selectedPlaylistId) return;
    onSubmit(selectedPlaylistId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add To Playlist</DialogTitle>
          <DialogDescription>
            Choose a playlist to save this problem to.
          </DialogDescription>
        </DialogHeader>

        <Select
          value={selectedPlaylistId ?? undefined}
          onValueChange={setSelectedPlaylistId}
          disabled={isLoadingPlaylists || playlists.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                isLoadingPlaylists
                  ? "Loading playlists..."
                  : playlists.length === 0
                    ? "No playlists yet"
                    : "Select a playlist"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {playlists.map((playlist) => (
              <SelectItem key={playlist.id} value={playlist.id}>
                {playlist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!problemId || !selectedPlaylistId}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
