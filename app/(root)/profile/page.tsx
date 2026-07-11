import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getCurrentUserData } from '@/modules/auth/actions';
import UserInfoCard from '@/modules/profile/components/user-info-card';
import ProfileStats from '@/modules/profile/components/profile-stats';
import SolvedProblems from '@/modules/profile/components/solved-problems';
import PlaylistsSection from '@/modules/profile/components/playlist-section';

export const metadata = {
  title: 'Profile | CodeArena',
  description: 'Your CodeArena Profile',
};

const ProfilePage = async () => {
  const user = await getCurrentUserData();

  if (!user || "error" in user) {
    redirect('/');
  }

  const [submissions, solvedProblems, playlists] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: user.id },
      select: { status: true },
    }),
    prisma.problemSolved.findMany({
      where: { userId: user.id },
      include: {
        problem: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.playlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const userData = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    imageUrl: user.imageUrl || undefined,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  const formattedSolvedProblems = solvedProblems.map(sp => ({
    id: sp.id,
    problemId: sp.problemId,
    problem: sp.problem,
    createdAt: sp.createdAt.toISOString(),
  }));

  const formattedPlaylists = playlists.map(pl => ({
    id: pl.id,
    name: pl.name,
    description: pl.description || '',
    createdAt: pl.createdAt.toISOString(),
    updatedAt: pl.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 mt-20">
        <UserInfoCard userData={userData} />
        
        <ProfileStats 
          submissions={submissions}
          solvedCount={solvedProblems.length}
          playlistCount={playlists.length}
        />
        
        <SolvedProblems solvedProblems={formattedSolvedProblems} />
        
        <PlaylistsSection playlists={formattedPlaylists} />
      </div>
    </div>
  );
};

export default ProfilePage;
