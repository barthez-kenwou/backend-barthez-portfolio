import type { AuditPort } from '@/shared/infrastructure/audit';

import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import { TestimonialNotFoundError } from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { ModerateTestimonialDto } from '../dto/testimonial.dto';

export type RejectTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  audit?: AuditPort;
};

export class RejectTestimonialCommand {
  constructor(private readonly deps: RejectTestimonialCommandDeps) {}

  async execute(input: ModerateTestimonialDto): Promise<TestimonialEntity> {
    const existing = await this.deps.testimonialRepository.findById(input.id);
    if (!existing) {
      throw new TestimonialNotFoundError();
    }

    const updated = await this.deps.testimonialRepository.update(input.id, {
      status: 'rejected',
      isPublished: false,
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'testimonial.reject',
      resource: 'testimonial',
      resourceId: input.id,
    });

    return updated;
  }
}
