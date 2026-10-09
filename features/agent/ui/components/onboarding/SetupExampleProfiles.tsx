import type { Doc } from "@/convex/_generated/dataModel";
import type { WorkspaceUseCaseKey } from "@/shared/lib/workspaceUseCases";
export function SetupExampleProfiles({ profiles }: {
  profiles: NonNullable<Doc<"workspaces">["icps"]>;
  useCaseKey: WorkspaceUseCaseKey;
}) {
  return <section className="space-y-4 px-4 py-4">
    <p className="text-muted-foreground text-sm">Review who to find on Twitter. Discovery will use these criteria to find real posts.</p>
    {profiles.map(profile => <article key={profile.title} className="rounded-lg border p-4">
      <h3 className="font-medium">{profile.title}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{profile.description}</p>
    </article>)}
  </section>;
}
