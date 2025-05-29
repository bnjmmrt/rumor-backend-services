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

interface BranchData {
  // Marketing
  $marketing_title?: string;

  // URL Parameters
  $fallback_url: string;
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

  // Web Behavior
  $web_only?: boolean;
  $desktop_web_only?: boolean;
  $mobile_web_only?: boolean;
  $after_click_url?: string;
  $afterclick_desktop_url?: boolean;

  // Deep Link Parameters
  $canonical_url?: string;
  $deeplink_path?: string;

  // Open Graph Parameters
  $og_title?: string;
  $og_description?: string;
  $og_image_url?: string;

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
    data: {
      $web_only: false,
      $fallback_url: webUrl,
      ...data,
    },
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
