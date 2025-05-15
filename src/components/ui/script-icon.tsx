
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Define common script icons - in a real app, these would be actual image files
// For simplicity, we're using data URIs
const SCRIPT_ICONS = {
  'google-analytics': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234285F4'%3E%3Cpath d='M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 2c5.535 0 10 4.465 10 10s-4.465 10-10 10S2 17.535 2 12 6.465 2 12 2zm-1 6v8h2V8h-2zm-4 4v4h2v-4H7zm8-2v6h2v-6h-2z'/%3E%3C/svg%3E",
  'facebook-pixel': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231877F2'%3E%3Cpath d='M24 12.073c0-5.8-4.703-10.503-10.503-10.503S2.994 6.273 2.994 12.073c0 5.242 3.84 9.59 8.852 10.378v-7.342h-2.663v-3.036h2.663V9.87c0-2.631 1.566-4.085 3.968-4.085 1.15 0 2.352.205 2.352.205v2.585h-1.324c-1.304 0-1.712.812-1.712 1.644v1.975h2.912l-.466 3.036h-2.446v7.342c5.012-.788 8.852-5.136 8.852-10.378'/%3E%3C/svg%3E",
  'twitter-pixel': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231DA1F2'%3E%3Cpath d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/%3E%3C/svg%3E",
  'hotjar': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF3C00'%3E%3Cpath d='M13.55 10.78c.57.25 1.94-.05 3.06-.77a7.53 7.53 0 0 0 2.73-3.58c.96-2.77-.1-5.16-.86-7.26C22.76 5.88 24 13.62 24 16.8c0 5.44-3.6 7.2-6 7.2s-6-1.76-6-7.2c0-4 1.55-5.25 1.55-6.02'/%3E%3Cpath d='M9.98 11.47c.4-.05.77.15 1.03.37.26.22.46.35.82.5.35.15 1.43-.08 1.96-.8.52-.74 1.23-1.66 1.52-2.16.3-.5.15-.74-.12-.95-.28-.22-.57-.66-.26-1.88.3-1.22 1.32-2.37 2.32-2.95 1-.57 2.85-.52 3.9.05 1.04.57 1.38 1.15 1.38 2.02 0 .87-.6 1.58-1 1.4-.41-.17-.19-.58-.75-.85-.57-.28-1.37.52-1.63 1.49-.26.97-.2 1.54.15 1.85.35.3.7.7.7 1.45 0 .75-.35 1.8-.86 2.67-.5.87-1.43 1.32-2.2 1.32-.78 0-1.73-.35-2.25-1.05-.53-.7-.73-.92-1.05-1.07-.33-.15-.58-.05-.75-.35-.18-.3-.39-.6-.4-1.7 0-1.12 0-1.23.53-1.92.52-.68.45-.4.36-.53-.1-.13-.45-.42-.94-.32'/%3E%3Cpath d='M6.03 10.33c.62.33.9.34 1.23.7.34.37.2.87.75 1.54.55.67 1.94 1.02 3.28.2 1.34-.82 1.86-1.55 2.2-2.5.35-.94-.05-1.64-.45-2.1-.4-.45-.2-.75.25-1.32.45-.57 1.62-.77 2.22-.32.6.45.75 1.8.07 2.29-.67.5-1.14.34-1.12.78.03.44.5.72.95 1.28.45.55.75 1.3.66 2.06-.1.77-.67 1.64-1.49 2.06-.82.42-1.65.37-2.35 0-.7-.37-1.12-.77-1.34-1.04-.22-.28-.47-.32-.82-.32s-.43.48-.72 1.07c-.3.58-.4.77-1.24 1.22-.85.45-2.4.44-3.1-.05-.7-.48-1.22-1.4-1.26-2.65-.05-1.25.2-2.44.22-3.24.03-.8.14-1.52.57-1.85.42-.33 1.48-.5 2.3.2'/%3E%3C/svg%3E",
  'default': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 3H5a2 2 0 0 0-2 2v4'%3E%3C/path%3E%3Cpath d='M9 21H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpath d='M19 3h4a2 2 0 0 1 2 2v4'%3E%3C/path%3E%3Cpath d='M19 21h4a2 2 0 0 0 2-2v-4'%3E%3C/path%3E%3Cpath d='M10 4 8 6l2 2'%3E%3C/path%3E%3Cpath d='m14 4 2 2-2 2'%3E%3C/path%3E%3Cpath d='m10 18-2 2 2 2'%3E%3C/path%3E%3Cpath d='m14 18 2 2-2 2'%3E%3C/path%3E%3C/svg%3E"
};

interface ScriptIconProps {
  scriptId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ScriptIcon({ scriptId, size = 'md', className = '' }: ScriptIconProps) {
  const iconSrc = SCRIPT_ICONS[scriptId] || SCRIPT_ICONS.default;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gray-100 rounded-md overflow-hidden flex items-center justify-center ${className}`}>
      <AspectRatio ratio={1/1}>
        <img 
          src={iconSrc}
          alt={`${scriptId} icon`}
          className="object-contain"
        />
      </AspectRatio>
    </div>
  );
}
