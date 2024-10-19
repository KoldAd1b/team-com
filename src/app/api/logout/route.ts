import { USER_COOKIE_NAME } from "@/supabase/middleware";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the cookies object
    const cookieStore = cookies();

    // Delete the USER_COOKIE_NAME cookie
    cookieStore.set(USER_COOKIE_NAME, "", { path: "/", maxAge: 0 });

    console.log("Cookie deleted successfully");

    // Optionally, redirect the user to the login page after logout
    return NextResponse.redirect(new URL("/auth", request.url));
  } catch (error) {
    console.error("Error deleting cookie:", error);
    return new Response("Failed to log out. Please try again.", {
      status: 500,
    });
  }
}
