import type { AuditPort } from '@/shared/infrastructure/audit';

import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import { TestimonialInvalidProjectError } from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { CreateTestimonialDto } from '../dto/testimonial.dto';
import type { ProjectTestimonialLinkPort } from '../services/project-testimonial-link.port';
import { syncProjectTestimonialMirror } from '../services/sync-project-testimonial';

export type CreateTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  projectLink?: ProjectTestimonialLinkPort;
  audit?: AuditPort;
};

/**
 * Admin-created testimonial (source=admin).
 * If created already approved/published with a projectId, mirrors onto Project.testimonial.
 */
export class CreateTestimonialCommand {
  constructor(private readonly deps: CreateTestimonialCommandDeps) {}

  async execute(input: CreateTestimonialDto): Promise<TestimonialEntity> {
    const projectId =
      input.projectId === undefined
        ? null
        : input.projectId === null
          ? null
          : input.projectId.trim() || null;

    if (projectId) {
      const ok = await this.deps.projectLink?.isLinkable(projectId, {
        requirePublished: false,
      });
      if (ok !== true) {
        throw new TestimonialInvalidProjectError();
      }
    }

    const created = await this.deps.testimonialRepository.create({
      rating: input.rating,
      textFr: input.textFr.trim(),
      textEn: input.textEn.trim(),
      nameFr: input.nameFr.trim(),
      nameEn: input.nameEn.trim(),
      roleFr: input.roleFr.trim(),
      roleEn: input.roleEn.trim(),
      company: input.company?.trim() || null,
      email: input.email?.trim() || null,
      isPublished: input.isPublished ?? false,
      status: input.status ?? 'pending',
      source: input.source ?? 'admin',
      sortOrder: input.sortOrder ?? 0,
      projectId,
      ownerId: input.ownerId ?? input.actorId ?? null,
    });

    await syncProjectTestimonialMirror(this.deps.projectLink, null, created);

    if (input.actorId) {
      await this.deps.audit?.record({
        actorId: input.actorId,
        action: 'testimonial.create',
        resource: 'testimonial',
        resourceId: created.id,
      });
    }

    return created;
  }
}
