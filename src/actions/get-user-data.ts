import { NextApiRequest, NextApiResponse } from "next";

import { User } from "@/types/app";
import supabaseServerClientPages from "@/supabase/supabaseServerPages";
import { createClient } from "@/supabase/supabaseServer";

export const getUserData = async (): Promise<User | null> => {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getSession();

  const user = userData.session?.user;
  if (!user) {
    console.log("NO USER", user);
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id);

  if (error) {
    console.log(error);
    return null;
  }

  return data ? data[0] : null;
};

export const getUserDataPages = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> => {
  const supabase = supabaseServerClientPages(req, res);

  const { data: userData } = await supabase.auth.getSession();

  const user = userData.session?.user;

  if (!userData) {
    console.log("NO USER", user);
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id);

  if (error) {
    console.log(error);
    return null;
  }

  return data ? data[0] : null;
};
