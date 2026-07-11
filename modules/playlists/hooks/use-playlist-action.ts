"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

type CreatePlaylistInput = {
  name: string;
  description?: string;
};

export type Playlist = {
  id: string;
  name: string;
  description?: string | null;
};

export function usePlaylistActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] =
    useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null,
  );
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const fetchPlaylists = async () => {
    setIsLoadingPlaylists(true);
    try {
      const response = await axios.get("/api/playlist");
      if (response.data.success) {
        setPlaylists(response.data.data ?? []);
      }
    } catch (error) {
      toast.error("Failed to load playlists.");
      console.error(error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const openAddToPlaylist = (problemId: string) => {
    setSelectedProblemId(problemId);
    setIsAddToPlaylistModalOpen(true);
    fetchPlaylists();
  };

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setSelectedProblemId(null);
  };

  const handleCreatePlaylist = async ({ name, description }: CreatePlaylistInput) => {
    try {
      const response = await axios.post("/api/playlist", { name, description });
      if (response.data.success) {
        toast.success(`Playlist "${name}" created successfully.`);
        closeCreateModal();
        fetchPlaylists();
      }
    } catch (error) {
      toast.error("Failed to create playlist.");
      console.error(error);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedProblemId) return;
    try {
      const response = await axios.post("/api/playlist/add-problem", { 
        problemId: selectedProblemId,
        playlistId
      });
      if (response.data.success) {
        toast.success("Problem added to playlist.");
        closeAddToPlaylistModal();
      }
    } catch (error) {
      toast.error("Failed to add problem to playlist.");
      console.error(error);
    }
  };

  return {
    isCreateModalOpen,
    isAddToPlaylistModalOpen,
    selectedProblemId,
    playlists,
    isLoadingPlaylists,
    openCreateModal,
    closeCreateModal,
    openAddToPlaylist,
    closeAddToPlaylistModal,
    handleCreatePlaylist,
    handleAddToPlaylist,
  };
}