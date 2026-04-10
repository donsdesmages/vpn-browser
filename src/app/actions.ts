"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function loginWithCredentials(
  contact: string,
  password: string
): Promise<{ error: string } | void> {
  try {
    await signIn("credentials", { contact, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "invalid_credentials" };
      }
      return { error: "auth_error" };
    }
    throw error; // re-throw NEXT_REDIRECT чтобы редирект сработал
  }
}
