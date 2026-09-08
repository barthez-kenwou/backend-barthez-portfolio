import type { AuditPort } from '@/shared/infrastructure/audit';

import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { CreateTestimonialDto } from '../dto/testimonial.dto';

export type CreateTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  audit?: AuditPort;
};

/**
 * Admin-created testimonial (source=admin).
 */
export class CreateTestimonialCommand {
  constructor(private readonly deps: CreateTestimonialCommandDeps) {}

  async execute(input: CreateTestimonialDto): Promise<TestimonialEntity> {
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
      ownerId: input.ownerId ?? input.actorId ?? null,
    });

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
