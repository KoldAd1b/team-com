import { cookies } from "next/headers"; // Use Next.js' cookies API for retrieving cookies
import { jwtVerify } from "jose"; // Import the jose library for JWT verification
import { NextApiRequest } from "next";

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!); // Ensure you have the JWT secret

// Function to verify the JWT and return the payload (user info)
export const getCookieData = async () => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("sb-access-token");

    if (!token?.value) {
      throw new Error("No JWT token found in cookies.");
    }

    // Verify the JWT
    const { payload } = await jwtVerify(token.value, JWT_SECRET);

    // You can access user details from the payload (assuming the payload contains user info)
    const userPayload = payload; // payload will contain user info like id, email, etc.
    return userPayload; // Return the decoded payload
  } catch (error) {
    console.error("Error retrieving or verifying JWT token:", error);
    return null;
  }
};
export async function getCookieDataPages(req: NextApiRequest) {
  try {
    // Get the 'sb-access-token' cookie from the request headers
    const token = req.cookies["sb-access-token"];

    if (!token) {
      throw new Error("No JWT token found in cookies.");
    }

    // Verify the JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Return the decoded payload
    return payload; // Payload will contain user info like id, email, etc.
  } catch (error) {
    console.error("Error retrieving or verifying JWT token:", error);
    return null; // Return null if verification fails
  }
}
