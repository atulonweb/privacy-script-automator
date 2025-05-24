
import { PresetScript } from "@/types/scripts-config.types";

// Default icon for scripts without specific icons
export const DEFAULT_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 3H5a2 2 0 0 0-2 2v4'%3E%3C/path%3E%3Cpath d='M9 21H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpath d='M19 3h4a2 2 0 0 1 2 2v4'%3E%3C/path%3E%3Cpath d='M19 21h4a2 2 0 0 0 2-2v-4'%3E%3C/path%3E%3Cpath d='M10 4 8 6l2 2'%3E%3C/path%3E%3Cpath d='m14 4 2 2-2 2'%3E%3C/path%3E%3Cpath d='m10 18-2 2 2 2'%3E%3C/path%3E%3Cpath d='m14 18 2 2-2 2'%3E%3C/path%3E%3C/svg%3E";

// Preset library data with enhanced documentation
export const PRESET_SCRIPTS: PresetScript[] = [
  // Analytics scripts
  {
    name: 'Google Analytics 4',
    id: 'google-analytics-4',
    src: 'https://www.googletagmanager.com/gtag/js?id=REPLACE_WITH_YOUR_GA4_MEASUREMENT_ID',
    category: 'analytics',
    async: true,
    icon: '/google-analytics-icon.png',
    description: 'Google Analytics 4 property for website tracking and analysis',
    docUrl: 'https://support.google.com/analytics/answer/9539598?hl=en',
    helpText: 'Get your GA4 Measurement ID from Admin > Data Streams > Web.'
  },
  {
    name: 'Google Universal Analytics',
    id: 'google-universal-analytics',
    src: 'https://www.googletagmanager.com/gtag/js?id=REPLACE_WITH_YOUR_UA_TRACKING_ID',
    category: 'analytics',
    async: true,
    icon: '/google-analytics-icon.png',
    description: 'Legacy Universal Analytics tracking',
    docUrl: 'https://support.google.com/analytics/answer/1008080?hl=en',
    helpText: 'Get your UA Tracking ID from Admin > Property Settings.'
  },
  {
    name: 'Matomo (Piwik)',
    id: 'matomo',
    src: 'https://YOUR_MATOMO_URL/matomo.js',
    category: 'analytics',
    async: true,
    description: 'Open source website analytics platform',
    docUrl: 'https://matomo.org/faq/general/faq_192/',
    helpText: 'Find your Site ID in Admin > Websites > Manage.'
  },
  {
    name: 'Hotjar',
    id: 'hotjar',
    src: 'https://static.hotjar.com/c/hotjar-YOUR_HOTJAR_ID.js',
    category: 'analytics',
    async: true,
    description: 'Behavior analytics and user feedback data',
    docUrl: 'https://help.hotjar.com/hc/en-us/articles/115011639927-What-is-the-Hotjar-Tracking-Code',
    helpText: 'Locate Site ID in Hotjar > Sites & Organizations.'
  },

  // Advertising scripts
  {
    name: 'Facebook Pixel',
    id: 'facebook-pixel',
    src: 'https://connect.facebook.net/en_US/fbevents.js',
    category: 'advertising',
    async: true,
    icon: '/facebook-icon.png',
    description: 'Track conversions from Facebook ads and build audiences',
    docUrl: 'https://www.facebook.com/business/help/952192354843755',
    helpText: 'Find Pixel ID in Events Manager > Data Sources.'
  },
  {
    name: 'LinkedIn Insight Tag',
    id: 'linkedin-insight',
    src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
    category: 'advertising',
    async: true,
    description: 'LinkedIn conversion tracking and retargeting',
    docUrl: 'https://www.linkedin.com/help/lms/answer/a418880',
    helpText: 'Get Partner ID from Insight Tag setup in Campaign Manager.'
  },
  {
    name: 'Google Ads Conversion',
    id: 'google-ads',
    src: 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX',
    category: 'advertising',
    async: true,
    description: 'Track ad conversions and remarketing for Google Ads',
    docUrl: 'https://support.google.com/google-ads/answer/6095821?hl=en',
    helpText: 'Find Conversion ID and Label in Tools > Conversions.'
  },
  {
    name: 'Twitter Pixel',
    id: 'twitter-pixel',
    src: 'https://static.ads-twitter.com/uwt.js',
    category: 'advertising',
    async: true,
    description: 'Track website activity for Twitter ad campaigns',
    docUrl: 'https://business.twitter.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites.html',
    helpText: 'Find Website Tag ID in Twitter Ads > Tools > Conversion Tracking.'
  },

  // Functional scripts
  {
    name: 'Zendesk Chat',
    id: 'zendesk-chat',
    src: 'https://static.zdassets.com/ekr/snippet.js?key=XXXXXXXXXX',
    category: 'functional',
    async: true,
    description: 'Live chat widget for customer support',
    docUrl: 'https://support.zendesk.com/hc/en-us/articles/360022367393-Getting-started-with-Zendesk-Chat',
    helpText: 'Find Account Key in Settings > Widget > Getting Started.'
  },
  {
    name: 'Intercom',
    id: 'intercom',
    src: 'https://widget.intercom.io/widget/XXXXXXXXXX',
    category: 'functional',
    async: true,
    description: 'Customer messaging platform',
    docUrl: 'https://www.intercom.com/help/en/articles/3539-installing-the-intercom-messenger-on-your-website',
    helpText: 'Find App ID in Settings > Installation.'
  },
  {
    name: 'Crisp Chat',
    id: 'crisp',
    src: 'https://client.crisp.chat/l.js',
    category: 'functional',
    async: true,
    description: 'Live chat and customer messaging widget',
    docUrl: 'https://help.crisp.chat/en/article/how-do-i-add-a-live-chat-to-my-website-10wcj3l/',
    helpText: 'Find Website ID in Crisp > Website Settings > Setup Instructions.'
  },
  {
    name: 'Google reCAPTCHA',
    id: 'recaptcha',
    src: 'https://www.google.com/recaptcha/api.js',
    category: 'functional',
    async: true,
    description: 'Bot protection for website forms',
    docUrl: 'https://developers.google.com/recaptcha/intro',
    helpText: 'Get Site Key and Secret from the reCAPTCHA Admin Console.'
  },

  // Social scripts
  {
    name: 'Instagram Embed',
    id: 'instagram-embed',
    src: 'https://www.instagram.com/embed.js',
    category: 'social',
    async: true,
    description: 'Embed Instagram posts on your website',
    docUrl: 'https://help.instagram.com/620154495870484',
    helpText: 'Click on the three dots on a post > Embed > Copy Code.'
  },
  {
    name: 'Twitter Widgets',
    id: 'twitter-widgets',
    src: 'https://platform.twitter.com/widgets.js',
    category: 'social',
    async: true,
    description: 'Embed Twitter content on your website',
    docUrl: 'https://help.twitter.com/en/using-twitter/twitter-embed',
    helpText: 'Generate embed code from publish.twitter.com.'
  },
  {
    name: 'Facebook SDK',
    id: 'facebook-sdk',
    src: 'https://connect.facebook.net/en_US/sdk.js',
    category: 'social',
    async: true,
    description: 'Enable Facebook sharing and social features',
    docUrl: 'https://developers.facebook.com/docs/javascript/quickstart/',
    helpText: 'Get your App ID from Facebook Developer Console.'
  },
  {
    name: 'LinkedIn Platform',
    id: 'linkedin-platform',
    src: 'https://platform.linkedin.com/in.js',
    category: 'social',
    async: true,
    description: 'LinkedIn sharing and integration features',
    docUrl: 'https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication',
    helpText: 'Get your API Key from LinkedIn Developer portal.'
  }
];
