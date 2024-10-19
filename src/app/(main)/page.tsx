import { redirect } from "next/navigation";

import { getUserData } from "@/actions/get-user-data";
import { cookies } from "next/headers";

export default async function Home() {
  cookies(); // To make sure nextJS doesn't compile this statically
  const userData = await getUserData();

  if (!userData) return redirect("/auth");

  const userWorkspaceId = userData.workspaces?.[0];

  if (!userWorkspaceId) return redirect("/create-workspace");

  if (userWorkspaceId) return redirect(`/workspace/${userWorkspaceId}`);
}
