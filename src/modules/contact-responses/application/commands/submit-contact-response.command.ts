import type { ContactResponseEntity } from '../../domain/entities/contact-response.entity';
import type { ContactResponseRepositoryPort } from '../../domain/repositories/contact-response.repository';
import type { SubmitContactResponseDto } from '../dto/contact-response.dto';

export type SubmitContactResponseCommandDeps = {
  contactResponseRepository: ContactResponseRepositoryPort;
};

/**
 * Unauthenticated public contact form → status=new.
 */
export class SubmitContactResponseCommand {
  constructor(private readonly deps: SubmitContactResponseCommandDeps) {}

  async execute(input: SubmitContactResponseDto): Promise<ContactResponseEntity> {
    return this.deps.contactResponseRepository.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: 'new',
      notes: null,
    });
  }
}
