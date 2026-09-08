import type { AuditPort } from '@/shared/infrastructure/audit';

import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import { TestimonialNotFoundError } from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { ModerateTestimonialDto } from '../dto/testimonial.dto';

export type ApproveTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  audit?: AuditPort;
};

export class ApproveTestimonialCommand {
  constructor(private readonly deps: ApproveTestimonialCommandDeps) {}

  async execute(input: ModerateTestimonialDto): Promise<TestimonialEntity> {
    const existing = await this.deps.testimonialRepository.findById(input.id);
    if (!existing) {
      throw new TestimonialNotFoundError();
    }

    const updated = await this.deps.testimonialRepository.update(input.id, {
      status: 'approved',
      isPublished: true,
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'testimonial.approve',
      resource: 'testimonial',
      resourceId: input.id,
    });

    return updated;
  }
}
