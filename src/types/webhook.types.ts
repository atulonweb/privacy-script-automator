
// Webhook-related types
export type Webhook = {
  id: string;
  user_id: string;
  website_id: string;
  url: string;
  secret: string | null;
  enabled: boolean;
  retry_count: number;
  created_at: string;
  updated_at: string;
};

export type WebhookLog = {
  id: string;
  webhook_id: string;
  status: 'success' | 'error' | 'pending';
  status_code: number | null;
  attempt: number;
  is_test: boolean;
  error_message: string | null;
  request_payload: any;
  response_body: string | null;
  created_at: string;
};
