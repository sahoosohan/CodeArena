"use client";

import { useState } from "react";
import { toast } from "sonner";

type CreatePlaylistInput = {
  name: string;
  description?: string;
};

export function usePlaylistActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] =
    useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null,
  );

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openAddToPlaylist = (problemId: string) => {
    setSelectedProblemId(problemId);
    setIsAddToPlaylistModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setSelectedProblemId(null);
  };

  const handleCreatePlaylist = ({ name }: CreatePlaylistInput) => {
    toast.info(`Playlist "${name}" is ready to wire up.`);
    closeCreateModal();
  };

  const handleAddToPlaylist = () => {
    toast.info("Playlist saving is ready to wire up.");
    closeAddToPlaylistModal();
  };

  return {
    isCreateModalOpen,
    isAddToPlaylistModalOpen,
    selectedProblemId,
    openCreateModal,
    closeCreateModal,
    openAddToPlaylist,
    closeAddToPlaylistModal,
    handleCreatePlaylist,
    handleAddToPlaylist,
  };
}
