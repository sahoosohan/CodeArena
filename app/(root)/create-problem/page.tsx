import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/generated/prisma/enums";
import { getCurrentUserData } from "@/modules/auth/actions";
import { CreateProblemForm } from "@/modules/problems/components/create-problem-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const CreateProblemPage = async () => {
  const user = await getCurrentUserData();

  if (!user || "error" in user || user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return (
    <section className="flex flex-col items-center justify-center  mx-4 my-4">
      <div className="flex flex-row justify-between items-center w-full">
        <Link href={"/"}>
          <Button variant={"outline"} size={"icon"}>
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center px-6 py-4 border-b dark:border-zinc-800">
        <h1 className="text-2xl font-bold">Create New Problem</h1>
      </div>
      
      <CreateProblemForm />
    </section>
  );
};

export default CreateProblemPage;
