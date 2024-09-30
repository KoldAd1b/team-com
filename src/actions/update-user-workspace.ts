"use server";

import { createClient } from "@/supabase/supabaseServer";

export const updateUserWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const supabase = createClient();

  // Update the user record
  const { data: updateWorkspaceData, error: updateWorkspaceError } =
    await supabase.rpc("add_workspace", {
      user_id: userId,
      new_workspace: workspaceId,
    });

  return [updateWorkspaceData, updateWorkspaceError];
};
