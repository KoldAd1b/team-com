import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose"; // Using jose for JWT handling

export const USER_COOKIE_NAME = "sb-access-token";
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET!
); // Secret key for signing

// Utility to create a new JWT
async function createJWT(
  user: { id?: string; name: string; email?: string },
  accessToken: string | undefined
) {
  const expirationTime = "30m"; // JWT expires in 30 minutes

  const jwt = await new SignJWT({
    user: { id: user.id, name: user.name, email: user.email },
    accessToken, // Store accessToken in the payload
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET_KEY);

  return jwt;
}

// Utility to verify the JWT
async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload;
  } catch (error) {
    console.log("JWT verification failed", error);
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get JWT from cookies
  const jwtToken = request.cookies.get(USER_COOKIE_NAME)?.value;

  let user = null;
  let accessToken = null;

  if (jwtToken) {
    // Try to verify the JWT and get the user info and access token
    const decodedToken = await verifyJWT(jwtToken);

    if (decodedToken) {
      user = decodedToken.user;
      accessToken = decodedToken.accessToken;
    }
  }

  // If no valid JWT or user, refresh the session using Supabase's refreshSession()
  if (!user || !accessToken) {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data) {
      // Redirect to the login page if session refresh fails
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      return NextResponse.redirect(url);
    }

    // Extract the new access token and user data
    accessToken = data.session?.access_token;
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser(accessToken);

    // Recreate the JWT with the new session info
    const newJWT = await createJWT(
      {
        email: supabaseUser?.email,
        id: supabaseUser?.id,
        name: supabaseUser?.user_metadata.name,
      },
      accessToken
    );
    supabaseResponse.cookies.set(USER_COOKIE_NAME, newJWT, {
      path: "/",
      httpOnly: true,
      secure: true,
      maxAge: 60 * 30, // 30 minutes
    });

    user = supabaseUser;
  }

  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    // No user, redirect to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Return the response with updated cookies
  return supabaseResponse;
}
