import type { ReactNode } from "react";
import { currentAccount } from "@/shared/lib/localAuth/session";
import { ConvexClientProviderClient } from "./ConvexClientProviderClient";

export async function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const account = await currentAccount();
  const initialAuth = account ? { id: account.id, email: account.email,
    firstName: account.first_name, lastName: account.last_name, profilePictureUrl: null } : null;

  return (
    <ConvexClientProviderClient initialAuth={initialAuth}>
      {children}
    </ConvexClientProviderClient>
  );
}
