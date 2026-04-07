"use server";

import { signIn, signOut } from "@/lib/auth";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function loginWithCredentials(contact: string, password: string) {
  await signIn("credentials", { contact, password, redirectTo: "/dashboard" });
}
