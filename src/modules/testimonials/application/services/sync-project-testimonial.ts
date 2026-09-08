import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import type {
  ProjectEmbeddedTestimonial,
  ProjectTestimonialLinkPort,
} from './project-testimonial-link.port';

export function toProjectEmbeddedTestimonial(
  entity: TestimonialEntity,
): ProjectEmbeddedTestimonial {
  return {
    quoteFr: entity.textFr,
    quoteEn: entity.textEn,
    author: (entity.nameEn || entity.nameFr).trim(),
    roleFr: entity.roleFr,
    roleEn: entity.roleEn,
    company: entity.company,
    rating: entity.rating,
    testimonialId: entity.id,
  };
}

function shouldMirrorOnProject(entity: TestimonialEntity): boolean {
  return (
    !entity.deletedAt &&
    entity.status === 'approved' &&
    entity.isPublished &&
    Boolean(entity.projectId)
  );
}

/**
 * Keep Project.testimonial in sync with the approved Testimonial row.
 * Clears previous project when unlinked, moved, unpublished, or soft-deleted.
 */
export async function syncProjectTestimonialMirror(
  port: ProjectTestimonialLinkPort | undefined,
  previous: Pick<TestimonialEntity, 'id' | 'projectId'> | null,
  current: TestimonialEntity,
): Promise<void> {
  if (!port) return;

  const prevProjectId = previous?.projectId ?? null;
  const nextProjectId = current.projectId ?? null;
  const mirror = shouldMirrorOnProject(current);

  if (prevProjectId && (!mirror || prevProjectId !== nextProjectId)) {
    await port.clearEmbeddedIfOwnedBy(prevProjectId, current.id);
  }

  if (mirror && nextProjectId) {
    await port.setEmbedded(nextProjectId, toProjectEmbeddedTestimonial(current));
  }
}
