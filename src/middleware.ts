import { type NextRequest } from "next/server";
import { updateSession } from "./supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Excluding the web-socket io to prevent unnecessary auth requests
     */
    "/((?!_next/static|_next/image|favicon.ico|api/web-socket/io|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
