export type EmailCategory =
  | "transactional"
  | "security"
  | "operational"
  | "marketing";

export type EmailDeliveryStatus =
  | "queued"
  | "processing"
  | "sent"
  | "retrying"
  | "failed"
  | "suppressed"
  | "cancelled"
  | "dead_letter"
  | "skipped";

export type EmailErrorCategory =
  | "temporary"
  | "permanent"
  | "configuration"
  | "validation"
  | "suppressed"
  | "unknown";

export type SenderKey = "noReply" | "vikash" | "hello" | "admin" | "support";

export type EmailResponse = {
  success: boolean;
  message: string;
  status: EmailDeliveryStatus;
  messageId?: string;
  outboxId?: string;
  skipped?: boolean;
  fallbackUsed?: boolean;
};

export type EmailAttachment = {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
};
