import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SubmitContactResponseCommand } from '@/modules/contact-responses/application/commands/submit-contact-response.command';
import type { ContactResponseRepositoryPort } from '@/modules/contact-responses/domain/repositories/contact-response.repository';

describe('SubmitContactResponseCommand', () => {
  let contactResponseRepository: ContactResponseRepositoryPort;
  let command: SubmitContactResponseCommand;

  beforeEach(() => {
    contactResponseRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        status: input.status ?? 'new',
        notes: input.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };

    command = new SubmitContactResponseCommand({ contactResponseRepository });
  });

  it('creates a public contact message with status=new', async () => {
    const item = await command.execute({
      name: '  Jane  ',
      email: 'Jane@Example.COM',
      subject: ' Hello ',
      message: ' Message body ',
    });

    expect(contactResponseRepository.create).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Hello',
      message: 'Message body',
      status: 'new',
      notes: null,
    });
    expect(item.status).toBe('new');
    expect(item.email).toBe('jane@example.com');
  });
});
