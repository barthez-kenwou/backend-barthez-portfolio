import type {
  ContactResponseEntity,
  ContactResponseListResult,
} from '../../domain/entities/contact-response.entity';

/**
 * Maps domain Contact Responses to the public API response shape.
 */
export const ContactResponseSerializer = {
  one(item: ContactResponseEntity) {
    return {
      id: item.id,
      name: item.name,
      email: item.email,
      subject: item.subject,
      message: item.message,
      status: item.status,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  /** Public create response — omit admin-only notes. */
  publicSubmit(item: ContactResponseEntity) {
    return {
      id: item.id,
      name: item.name,
      email: item.email,
      subject: item.subject,
      message: item.message,
      status: item.status,
      createdAt: item.createdAt,
    };
  },

  list(result: ContactResponseListResult) {
    return {
      items: result.items.map(ContactResponseSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
