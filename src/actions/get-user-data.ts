import { createClient } from "@/supabase/supabaseServer";
import supabaseServerClientPages from "@/supabase/supabaseServerPages";
import { User } from "@/types/app";
import { NextApiRequest, NextApiResponse } from "next";
import { getCookieData, getCookieDataPages } from "@/lib/get-cookie-data";

type userPayloadType = {
  id: string;
  email: string;
  name: string;
};

export const getUserData = async (): Promise<User | null> => {
  // Get the user info from the verified JWT
  const userPayload = await getCookieData();

  if (!userPayload) {
    console.log("No valid JWT found");
    return null;
  }

  const user = userPayload.user as userPayloadType;
  const supabase = createClient();

  // Assuming userPayload contains the user ID
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

  const userPayload = await getCookieDataPages(req);

  if (!userPayload) {
    console.log("No valid JWT found");
    return null;
  }

  const user = userPayload.user as userPayloadType;

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
