import axios from 'axios';
import config from '../config';

interface BranchLinkData {
  path: string;
  data?: BranchData;
  channel?: string;
  feature?: string;
  campaign?: string;
  stage?: string;
  tags?: string[];
  type?: number;
  alias?: string;
  duration?: number;
}

interface BranchResponse {
  url: string;
  [key: string]: unknown;
}

export interface BranchData {
  // Marketing Parameters
  $marketing_title?: string;

  // URL Redirect Parameters
  $fallback_url?: string;
  $fallback_url_xx?: string;
  $desktop_url?: string;
  $ios_url?: string;
  $ios_url_xx?: string;
  $ipad_url?: string;
  $android_url?: string;
  $android_url_xx?: string;
  $samsung_url?: string;
  $huawei_url?: string;
  $windows_phone_url?: string;
  $blackberry_url?: string;
  $fire_url?: string;
  $ios_wechat_url?: string;
  $android_wechat_url?: string;

  // Web Behavior Parameters
  $web_only?: boolean;
  $desktop_web_only?: boolean;
  $mobile_web_only?: boolean;
  $after_click_url?: string;
  $afterclick_desktop_url?: boolean;

  // Deep Link and URI Parameters
  $canonical_url?: string;
  $deeplink_path?: string;
  $uri_redirect_mode?: number;
  $ios_uri_redirect_mode?: number;
  $android_uri_redirect_mode?: number;
  $always_deeplink?: boolean;
  $deeplink_no_attribution?: boolean;

  // Attribution Window Parameters (in days)
  $click_install_window_days?: number;
  $click_session_start_window_days?: number;
  $click_conversion_window_days?: number;
  $impression_install_window_days?: number;
  $impression_session_start_window_days?: number;
  $impression_conversion_window_days?: number;

  // Timeout and Control Parameters
  $match_duration?: number;
  $ios_redirect_timeout?: number;
  $android_redirect_timeout?: number;
  $do_not_process?: boolean;
  $exp_date?: number;

  // Content Parameters
  $publicly_indexable?: boolean;
  $canonical_identifier?: string;
  $content_type?: string;

  // Open Graph Parameters
  $og_title?: string;
  $og_description?: string;
  $og_image_url?: string;
  $og_image_width?: number;
  $og_image_height?: number;
  $og_video?: string;
  $og_url?: string;
  $og_type?: string;
  $og_site_name?: string;
  $og_locale?: string;
  $og_redirect?: string;

  // Twitter Card Parameters
  $twitter_card?: string;
  $twitter_site?: string;
  $twitter_app_country?: string;
  $twitter_player?: string;
  $twitter_player_width?: number;
  $twitter_player_height?: number;

  // Deepview Parameters
  $ios_passive_deepview?: string;
  $android_passive_deepview?: string;

  // NativeLink Parameters (iOS 15+ & Private Relay)
  $ios_nativelink?: boolean;

  // Custom Meta Tags
  $custom_meta_tags?: string; // JSON string of custom meta tags

  // Custom Data
  event_id?: string;
  [key: string]: string | number | boolean | undefined;
}

interface BranchRequest {
  branch_key: string;
  channel?: string;
  feature?: string;
  campaign?: string;
  stage?: string;
  tags?: string[];
  type?: number;
  data: BranchData;
  alias?: string;
  duration?: number;
}

/**
 * Generates a Branch.io deep link with fallback to web URL
 * @param linkData The path and optional data for the deep link
 * @returns Promise<string> The generated Branch.io link
 */
export const generateBranchLink = async (linkData: BranchLinkData): Promise<string> => {
  const { path, data = {}, channel, feature, campaign, stage, tags, type, duration } = linkData;

  const webUrl = `${config.get('RUMOR_WEBSITE_HOST')}${path}`;

  const branchEndpoint = 'https://api2.branch.io/v1/url';
  const branchKey = config.get('BRANCH_API_KEY');

  const branchData: BranchRequest = {
    branch_key: branchKey,
    data: data,
    channel,
    feature,
    campaign,
    stage,
    tags,
    type,
    duration,
  };

  const response = await axios.post<BranchResponse>(branchEndpoint, branchData);

  if (response.data && response.data.url) {
    return response.data.url;
  }

  return webUrl;
};
