import type { Tweet } from "@/features/threads/types";

/** The private application does not serve marketing testimonials. */
export async function getPublicTestimonials(_limit = 4): Promise<Tweet[]> {
  return [];
}
