
import React from 'react';
import { Website } from '@/hooks/useWebsites';

interface WebsiteInfoProps {
  website: Website | undefined;
}

const WebsiteInfo: React.FC<WebsiteInfoProps> = ({ website }) => {
  if (!website) return null;

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-md">
      <p className="font-medium">{website.name}</p>
      <p className="text-sm text-muted-foreground">{website.domain}</p>
    </div>
  );
};

export default WebsiteInfo;
