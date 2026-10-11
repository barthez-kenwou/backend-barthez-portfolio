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
    /**
     * Send via SMTP in-process instead of BullMQ.
     * Use for transactional mail that must not be marked sent before delivery
     * (welcome). Campaign fan-out stays queued.
     */
    immediate?: boolean;
  }): Promise<void>;
};

export type NewsletterQueuePort = {
  enqueueFanout(campaignId: string): Promise<void>;
};
