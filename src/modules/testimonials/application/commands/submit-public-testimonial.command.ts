import type { AuditPort } from '@/shared/infrastructure/audit';

import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import { TestimonialInvalidProjectError } from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { SubmitPublicTestimonialDto } from '../dto/testimonial.dto';
import type { ProjectTestimonialLinkPort } from '../services/project-testimonial-link.port';

export type SubmitPublicTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  projectLink?: ProjectTestimonialLinkPort;
  audit?: AuditPort;
};

/**
 * Unauthenticated public feedback form → pending moderation.
 * Optional projectId must reference a published project; mirror happens on approve.
 */
export class SubmitPublicTestimonialCommand {
  constructor(private readonly deps: SubmitPublicTestimonialCommandDeps) {}

  async execute(input: SubmitPublicTestimonialDto): Promise<TestimonialEntity> {
    const projectId = input.projectId?.trim() || null;
    if (projectId) {
      const ok = await this.deps.projectLink?.isLinkable(projectId, {
        requirePublished: true,
      });
      if (ok !== true) {
        throw new TestimonialInvalidProjectError();
      }
    }

    return this.deps.testimonialRepository.create({
      rating: input.rating,
      textFr: input.textFr.trim(),
      textEn: input.textEn.trim(),
      nameFr: input.nameFr.trim(),
      nameEn: input.nameEn.trim(),
      roleFr: input.roleFr.trim(),
      roleEn: input.roleEn.trim(),
      company: input.company?.trim() || null,
      email: input.email?.trim() || null,
      isPublished: false,
      status: 'pending',
      source: 'public_form',
      sortOrder: 0,
      projectId,
      ownerId: null,
    });
  }
}
