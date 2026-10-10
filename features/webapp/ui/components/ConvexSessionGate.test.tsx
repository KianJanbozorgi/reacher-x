import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { ConvexSessionGate } from "./ConvexSessionGate";

const auth = vi.hoisted(() => ({ authenticated: false, loading: true }));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: auth.authenticated, isLoading: auth.loading }),
}));
vi.mock("@/shared/lib/localAuth/client", () => ({
  useAuth: () => ({ user: { email: "person@example.test" } }),
}));

test("protected content waits for Convex authentication", () => {
  auth.authenticated = false;
  auth.loading = true;
  expect(renderToStaticMarkup(<ConvexSessionGate><p>protected query</p></ConvexSessionGate>))
    .not.toContain("protected query");
  auth.loading = false;
  expect(renderToStaticMarkup(<ConvexSessionGate><p>protected query</p></ConvexSessionGate>))
    .toContain("سرور داده هویت شما را نپذیرفت");
  auth.authenticated = true;
  expect(renderToStaticMarkup(<ConvexSessionGate><p>protected query</p></ConvexSessionGate>))
    .toContain("protected query");
});
