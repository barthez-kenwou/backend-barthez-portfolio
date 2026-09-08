import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import { TestimonialNotFoundError } from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { GetTestimonialDto } from '../dto/testimonial.dto';

export type GetTestimonialQueryDeps = {
  testimonialRepository: TestimonialRepositoryPort;
};

export class GetTestimonialQuery {
  constructor(private readonly deps: GetTestimonialQueryDeps) {}

  async execute(input: GetTestimonialDto): Promise<TestimonialEntity> {
    const item = await this.deps.testimonialRepository.findById(input.id);
    if (!item) {
      throw new TestimonialNotFoundError();
    }

    if (input.publicOnly) {
      const visible =
        item.status !== 'pending' &&
        item.status !== 'rejected' &&
        (item.isPublished || item.status === 'approved');
      if (!visible) {
        throw new TestimonialNotFoundError();
      }
    }

    return item;
  }
}
