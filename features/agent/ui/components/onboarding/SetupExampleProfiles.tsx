import type { Doc } from "@/convex/_generated/dataModel";
import type { WorkspaceUseCaseKey } from "@/shared/lib/workspaceUseCases";
export function SetupExampleProfiles({ profiles }: {
  profiles: NonNullable<Doc<"workspaces">["icps"]>;
  useCaseKey: WorkspaceUseCaseKey;
}) {
  return <section className="space-y-4 px-4 py-4">
    <p className="text-muted-foreground text-sm">افرادی را که باید در X/Twitter پیدا شوند بررسی کنید. جستجو با این معیارها پست‌های واقعی را پیدا می‌کند.</p>
    {profiles.map(profile => <article key={profile.title} className="rounded-lg border p-4">
      <h3 className="font-medium">{profile.title}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{profile.description}</p>
    </article>)}
  </section>;
}
