import type { TestimonialListResult } from '../../domain/entities/testimonial.entity';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { ListTestimonialsDto } from '../dto/testimonial.dto';

export type ListTestimonialsQueryDeps = {
  testimonialRepository: TestimonialRepositoryPort;
};

export class ListTestimonialsQuery {
  constructor(private readonly deps: ListTestimonialsQueryDeps) {}

  async execute(input: ListTestimonialsDto): Promise<TestimonialListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.testimonialRepository.list({
      page,
      limit,
      publicOnly: input.publicOnly,
      status: input.status,
      isPublished: input.isPublished,
      projectId: input.projectId,
    });
  }
}
