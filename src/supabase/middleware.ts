import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import jwt from "jsonwebtoken"; // JWT library to create and verify tokens

const USER_COOKIE_NAME = "sb-jwt"; // Name of the cookie that will hold the JWT
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!; // Secret key for JWT

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const jwtToken = request.cookies.get(USER_COOKIE_NAME)?.value;
  let user = null;
  let accessToken = null;

  // 1. Check if JWT is present
  if (jwtToken) {
    try {
      // 2. Verify JWT
      const decodedToken = jwt.verify(jwtToken, JWT_SECRET) as any;
      user = decodedToken.user;
      accessToken = decodedToken.accessToken;

      // 3. Check token expiration (this assumes the JWT payload includes `exp`)
      const isTokenExpired = Date.now() >= decodedToken.exp * 1000;
      if (!isTokenExpired) {
        // Token is still valid, return the current response
        return supabaseResponse;
      }
    } catch (error) {
      console.error("JWT validation error:", error);
    }
  }

  // 4. If JWT is missing/expired, refresh the session
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error("Session refresh error:", error);
    // Redirect to login if refreshing fails
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth";
    return NextResponse.redirect(loginUrl);
  }

  // 5. Get the new access token and user details
  accessToken = data?.session?.access_token;
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error("User fetch error:", userError);
    // Redirect to login if user fetch fails
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth";
    return NextResponse.redirect(loginUrl);
  }

  user = userData.user;

  // 6. Sign a new JWT with the access token and user data
  const newJwt = jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
    },
    JWT_SECRET,
    { expiresIn: "30m" }
  );

  // 7. Set the new JWT in the response cookie
  supabaseResponse.cookies.set(USER_COOKIE_NAME, newJwt, {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 30 * 60, // 30 minutes
  });

  // Return the response
  return supabaseResponse;
}
