/**
 * Links a moderated Testimonial to Project.testimonial (frontend case-study tab).
 * Embedded shape matches seed / frontend ProjectTestimonialSection.
 */
export type ProjectEmbeddedTestimonial = {
  quoteFr: string;
  quoteEn: string;
  author: string;
  roleFr?: string;
  roleEn?: string;
  company?: string | null;
  rating?: number;
  /** Used to clear safely when this testimonial is rejected/deleted/unlinked. */
  testimonialId: string;
};

export type ProjectTestimonialLinkPort = {
  /**
   * Whether the project can be linked.
   * @param requirePublished — public form must target a published project.
   */
  isLinkable(projectId: string, opts: { requirePublished: boolean }): Promise<boolean>;

  setEmbedded(projectId: string, value: ProjectEmbeddedTestimonial): Promise<void>;

  /** Clears Project.testimonial only if it was synced from this testimonial. */
  clearEmbeddedIfOwnedBy(projectId: string, testimonialId: string): Promise<void>;
};
