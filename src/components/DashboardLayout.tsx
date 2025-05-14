
import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Websites', path: '/dashboard/websites' },
    { name: 'Scripts', path: '/dashboard/scripts' },
    { name: 'Analytics', path: '/dashboard/analytics' },
    { name: 'Settings', path: '/dashboard/settings' },
    { name: 'Testing', path: '/dashboard/testing' },
  ];

  // Generate user initials from full name or email
  const getUserInitials = () => {
    if (!user) return '?';
    
    const fullName = user.user_metadata?.full_name || '';
    if (fullName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return fullName[0]?.toUpperCase() || '?';
    }
    
    // Fallback to email
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '?';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-2">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
          
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-brand-600">ConsentGuard</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-brand-100 text-brand-800">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleNavigation('/dashboard/settings')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleNavigation('/dashboard/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleNavigation('/dashboard/websites')}>
                  My Websites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
          ${isMobile ? (isSidebarOpen ? 'block' : 'hidden') : 'block'} 
          w-64 border-r bg-white`}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium
                  ${location.pathname === item.path 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
