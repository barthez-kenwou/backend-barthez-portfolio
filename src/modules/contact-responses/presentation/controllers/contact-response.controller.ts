import type { Request, Response } from 'express';

import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { DeleteContactResponseCommand } from '../../application/commands/delete-contact-response.command';
import type { SubmitContactResponseCommand } from '../../application/commands/submit-contact-response.command';
import type { UpdateContactResponseCommand } from '../../application/commands/update-contact-response.command';
import type { GetContactResponseQuery } from '../../application/queries/get-contact-response.query';
import type { ListContactResponsesQuery } from '../../application/queries/list-contact-responses.query';
import type { ContactResponseStatus } from '../../domain/entities/contact-response.entity';
import { ContactResponseSerializer } from '../serializers/contact-response.serializer';

type AuthRequest = Request & { user?: { id: string } };

export type ContactResponseControllerDeps = {
  submitContactResponse: SubmitContactResponseCommand;
  updateContactResponse: UpdateContactResponseCommand;
  deleteContactResponse: DeleteContactResponseCommand;
  getContactResponse: GetContactResponseQuery;
  listContactResponses: ListContactResponsesQuery;
};

/**
 * Thin Express handlers — public submit + admin inbox management.
 */
export function createContactResponseController(deps: ContactResponseControllerDeps) {
  const submit = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.submitContactResponse.execute({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });
    return response.created(req, res, ContactResponseSerializer.publicSubmit(item), 'Message sent');
  });

  const list = asyncHandler(async (req: Request, res: Response) => {
    const result = await deps.listContactResponses.execute({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status ? (String(req.query.status) as ContactResponseStatus) : undefined,
    });
    return response.ok(
      req,
      res,
      ContactResponseSerializer.list(result),
      'Contact Responses retrieved',
    );
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getContactResponse.execute({
      id: req.params.contactResponseId,
      markReadIfNew: true,
    });
    return response.ok(req, res, ContactResponseSerializer.one(item), 'Contact Response retrieved');
  });

  const update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await deps.updateContactResponse.execute({
      id: req.params.contactResponseId,
      actorId: req.user!.id,
      ...req.body,
    });
    return response.ok(req, res, ContactResponseSerializer.one(item), 'Contact Response updated');
  });

  const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    await deps.deleteContactResponse.execute({
      id: req.params.contactResponseId,
      actorId: req.user!.id,
    });
    return response.ok(req, res, null, 'Contact Response deleted');
  });

  return { submit, list, getById, update, remove };
}

export type ContactResponseController = ReturnType<typeof createContactResponseController>;
