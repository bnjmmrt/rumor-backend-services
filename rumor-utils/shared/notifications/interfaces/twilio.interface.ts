export interface MessageInstance {
  account_sid: string | null;
  api_version: string | null;
  body: string | null;
  date_created: string | null;
  date_sent: string | null;
  date_updated: string | null;
  direction: string | null;
  error_code: number | null;
  error_message: string | null;
  from: string | null;
  num_media: string | null;
  num_segments: string | null;
  price: number | null;
  price_unit: string | null;
  messaging_service_sid: string | null;
  sid: string | null;
  status: string | null;
  subresource_uris: SubresourceUris;
  to: string | null;
  uri: string | null;
}

export interface SubresourceUris {
  media: string | null;
}
