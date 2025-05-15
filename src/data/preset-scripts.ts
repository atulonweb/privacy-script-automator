
import { PresetScript } from "@/types/scripts-config.types";

// Default icon for scripts without specific icons
export const DEFAULT_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 3H5a2 2 0 0 0-2 2v4'%3E%3C/path%3E%3Cpath d='M9 21H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpath d='M19 3h4a2 2 0 0 1 2 2v4'%3E%3C/path%3E%3Cpath d='M19 21h4a2 2 0 0 0 2-2v-4'%3E%3C/path%3E%3Cpath d='M10 4 8 6l2 2'%3E%3C/path%3E%3Cpath d='m14 4 2 2-2 2'%3E%3C/path%3E%3Cpath d='m10 18-2 2 2 2'%3E%3C/path%3E%3Cpath d='m14 18 2 2-2 2'%3E%3C/path%3E%3C/svg%3E";

// Preset library data
export const PRESET_SCRIPTS: PresetScript[] = [
  // Analytics scripts
  {
    name: 'Google Analytics 4',
    id: 'ga4',
    src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX',
    category: 'analytics',
    async: true,
    icon: '/google-analytics-icon.png',
    description: 'Google Analytics 4 property for website tracking and analysis'
  },
  {
    name: 'Google Universal Analytics',
    id: 'ga-universal',
    src: 'https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXXXX',
    category: 'analytics',
    async: true,
    icon: '/google-analytics-icon.png',
    description: 'Legacy Universal Analytics tracking'
  },
  {
    name: 'Matomo (Piwik)',
    id: 'matomo',
    src: 'https://your-matomo-url.com/matomo.js',
    category: 'analytics',
    async: true,
    description: 'Open source website analytics platform'
  },
  {
    name: 'Hotjar',
    id: 'hotjar',
    src: 'https://static.hotjar.com/c/hotjar-XXXX.js',
    category: 'analytics',
    async: true,
    description: 'Behavior analytics and user feedback data'
  },

  // Advertising scripts
  {
    name: 'Facebook Pixel',
    id: 'facebook-pixel',
    src: 'https://connect.facebook.net/en_US/fbevents.js',
    category: 'advertising',
    async: true,
    icon: '/facebook-icon.png',
    description: 'Track conversions from Facebook ads and build audiences'
  },
  {
    name: 'LinkedIn Insight Tag',
    id: 'linkedin-insight',
    src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
    category: 'advertising',
    async: true,
    description: 'LinkedIn conversion tracking and retargeting'
  },
  {
    name: 'Google Ads Conversion',
    id: 'google-ads',
    src: 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX',
    category: 'advertising',
    async: true,
    description: 'Track ad conversions and remarketing for Google Ads'
  },
  {
    name: 'Twitter Pixel',
    id: 'twitter-pixel',
    src: 'https://static.ads-twitter.com/uwt.js',
    category: 'advertising',
    async: true,
    description: 'Track website activity for Twitter ad campaigns'
  },

  // Functional scripts
  {
    name: 'Zendesk Chat',
    id: 'zendesk-chat',
    src: 'https://static.zdassets.com/ekr/snippet.js?key=XXXXXXXXXX',
    category: 'functional',
    async: true,
    description: 'Live chat widget for customer support'
  },
  {
    name: 'Intercom',
    id: 'intercom',
    src: 'https://widget.intercom.io/widget/XXXXXXXXXX',
    category: 'functional',
    async: true,
    description: 'Customer messaging platform'
  },
  {
    name: 'Crisp Chat',
    id: 'crisp',
    src: 'https://client.crisp.chat/l.js',
    category: 'functional',
    async: true,
    description: 'Live chat and customer messaging widget'
  },
  {
    name: 'Google reCAPTCHA',
    id: 'recaptcha',
    src: 'https://www.google.com/recaptcha/api.js',
    category: 'functional',
    async: true,
    description: 'Bot protection for website forms'
  },

  // Social scripts
  {
    name: 'Instagram Embed',
    id: 'instagram-embed',
    src: 'https://www.instagram.com/embed.js',
    category: 'social',
    async: true,
    description: 'Embed Instagram posts on your website'
  },
  {
    name: 'Twitter Widgets',
    id: 'twitter-widgets',
    src: 'https://platform.twitter.com/widgets.js',
    category: 'social',
    async: true,
    description: 'Embed Twitter content on your website'
  },
  {
    name: 'Facebook SDK',
    id: 'facebook-sdk',
    src: 'https://connect.facebook.net/en_US/sdk.js',
    category: 'social',
    async: true,
    description: 'Enable Facebook sharing and social features'
  },
  {
    name: 'LinkedIn Platform',
    id: 'linkedin-platform',
    src: 'https://platform.linkedin.com/in.js',
    category: 'social',
    async: true,
    description: 'LinkedIn sharing and integration features'
  }
];
