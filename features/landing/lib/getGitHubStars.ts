/** Private deployments do not render the public landing page or its star count. */
export async function getGitHubStarsCount(): Promise<number> {
  return 0;
}
