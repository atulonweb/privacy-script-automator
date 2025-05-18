
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserProfileHeaderProps {
  fullName: string | null;
  email: string;
  role: string;
  createdAt: string;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  fullName,
  email,
  role,
  createdAt
}) => {
  const getUserInitials = () => {
    if (!fullName) return '?';
    
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return fullName[0]?.toUpperCase() || '?';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-16 w-16">
        <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      <div>
        <CardTitle className="text-2xl">{fullName || 'No name provided'}</CardTitle>
        <CardDescription className="text-lg">{email}</CardDescription>
        <div className="mt-2">
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-800'
              }`}
          >
            {role || 'user'}
          </span>
          <span className="text-xs text-gray-500 ml-4">
            Joined: {formatDate(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
