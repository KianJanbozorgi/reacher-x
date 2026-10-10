import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("local login initializes onboarding and sets a server session", () => {
  const authHandler = readFileSync("shared/lib/localAuth/http.ts", "utf8");
  assert.match(authHandler, /createSession\(accountId\)/);
  assert.match(authHandler, /bootstrapPostAuthSetup/);
  assert.match(authHandler, /sessionCookieOptions\(\)/);
});

test("local auth receives server-hydrated session behind a Suspense boundary", () => {
  const serverProvider = readFileSync("app/ConvexClientProvider.tsx", "utf8");
  const clientProvider = readFileSync(
    "app/ConvexClientProviderClient.tsx",
    "utf8"
  );
  const rootLayout = readFileSync("app/layout.tsx", "utf8");

  assert.match(serverProvider, /await currentAccount\(\)/);
  assert.match(clientProvider, /<LocalAuthProvider user=\{initialAuth\}>/);
  assert.match(
    rootLayout,
    /<Suspense fallback=\{null\}>\s*<ConvexClientProvider>/
  );
  assert.ok(
    rootLayout.indexOf("<ThemeProvider") <
      rootLayout.indexOf("<Suspense fallback={null}>")
  );
});

test("next-themes only renders its initialization script on the server", () => {
  const workspaceConfig = readFileSync("pnpm-workspace.yaml", "utf8");
  const nextThemesPatch = readFileSync(
    "patches/next-themes@0.4.6.patch",
    "utf8"
  );

  assert.match(
    workspaceConfig,
    /next-themes@0\.4\.6: patches\/next-themes@0\.4\.6\.patch/
  );
  assert.match(nextThemesPatch, /diff --git a\/dist\/index\.mjs/);
  assert.match(nextThemesPatch, /diff --git a\/dist\/index\.js/);
  assert.equal(
    nextThemesPatch.match(/if\(typeof window!="undefined"\)return null/g)
      ?.length,
    2
  );
});
