const issuer = process.env.AUTH_ISSUER_URL?.replace(/\/$/, "");
if (!issuer) throw new Error("AUTH_ISSUER_URL is required for local authentication.");

const authConfig = {
  providers: [
    {
      type: "customJwt",
      issuer,
      algorithm: "RS256",
      applicationID: "reacher-x",
      jwks: `${issuer}/auth/jwks`,
    },
  ],
};

export default authConfig;
