import type { Request, Response } from 'express';

import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { DeleteContactInfoCommand } from '../../application/commands/delete-contact-info.command';
import type { UpsertContactInfoCommand } from '../../application/commands/upsert-contact-info.command';
import type { GetContactInfoQuery } from '../../application/queries/get-contact-info.query';
import { ContactInfoSerializer } from '../serializers/contact-info.serializer';

type AuthRequest = Request & { user?: { id: string } };

export type ContactInfoControllerDeps = {
  upsertContactInfo: UpsertContactInfoCommand;
  deleteContactInfo: DeleteContactInfoCommand;
  getContactInfo: GetContactInfoQuery;
};

/**
 * Thin Express handlers — singleton contact profile (no ownership checks).
 */
export function createContactInfoController(deps: ContactInfoControllerDeps) {
  const get = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getContactInfo.execute({
      singletonKey: req.query.key ? String(req.query.key) : undefined,
    });
    return response.ok(req, res, ContactInfoSerializer.one(item), 'Contact Info retrieved');
  });

  const upsert = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await deps.upsertContactInfo.execute({
      ...req.body,
      actorId: req.user!.id,
      singletonKey: req.body.singletonKey ?? (req.query.key ? String(req.query.key) : undefined),
    });
    return response.ok(req, res, ContactInfoSerializer.one(item), 'Contact Info saved');
  });

  const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    await deps.deleteContactInfo.execute({
      singletonKey: req.query.key ? String(req.query.key) : undefined,
      actorId: req.user!.id,
    });
    return response.ok(req, res, null, 'Contact Info deleted');
  });

  return { get, upsert, remove };
}

export type ContactInfoController = ReturnType<typeof createContactInfoController>;
