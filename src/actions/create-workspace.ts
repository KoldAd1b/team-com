"use server";

import { createClient } from "@/supabase/supabaseServer";
import { getUserData } from "./get-user-data";
import { updateUserWorkspace } from "./update-user-workspace";
import { addMemberToWorkspace } from "./add-member-workspace";

export const createWorkspace = async ({
  imageUrl,
  name,
  slug,
  invite_code,
}: {
  imageUrl?: string;
  name: string;
  slug: string;
  invite_code: string;
}) => {
  const supabase = createClient();
  const userData = await getUserData();

  if (!userData) {
    return { error: "No user data" };
  }

  const { error, data: workspaceRecord } = await supabase
    .from("workspaces")
    .insert({
      image_url: imageUrl,
      name,
      super_admin: userData.id,
      slug,
      invite_code,
    })
    .select("*");

  if (error) {
    return { error };
  }

  const [, updateWorkspaceError] = await updateUserWorkspace(
    userData.id,
    workspaceRecord[0].id
  );

  if (updateWorkspaceError) {
    return { error: updateWorkspaceError };
  }

  //   Add user to workspace members
  const [, addMemberToWorkspaceError] = await addMemberToWorkspace(
    userData.id,
    workspaceRecord[0].id
  );

  if (addMemberToWorkspaceError) {
    return { error: addMemberToWorkspaceError };
  }
};
