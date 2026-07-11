"use server";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "No authenticated user found" };
    }

    const { id, firstName, lastName, imageUrl, emailAddresses } = user;

    const newUser = await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0].emailAddress || "",
      },
      create: {
        clerkId: id,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0].emailAddress || "",
      },
    });
    
    return newUser;
  } catch (error) {
    console.error("Error in onBoardUser:", error);
    return { success: false, error: "Failed to onboard user" };
  }
};

export const currentUserRole = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    const { id } = user;

    const userRole = await prisma.user.findUnique({
      where: { clerkId: id },
      select: { role: true },
    });

    return userRole?.role || null;
  } catch (error) {
    console.error("Error in currentUserRole:", error);
    return null;
  }
};

export const getCurrentUserData = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return {success: false, error: "No authenticated user found"}  
    }

    const data = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    return data
  } catch (error) {
    console.error("Error in getCurrentUserData:", error);
    return {success: false, error: "Failed to fetch user data"}
  }
};

