export type NewsletterRbacPort = {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
};

export type NewsletterMailerPort = {
  send(input: {
    to: string;
    subject: string;
    template: string;
    data?: Record<string, unknown>;
    priority?: number;
  }): Promise<void>;
};

export type NewsletterQueuePort = {
  enqueueFanout(campaignId: string): Promise<void>;
};
