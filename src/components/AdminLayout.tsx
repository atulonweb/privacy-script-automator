
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
import { Menu, X, Users, Settings, Activity, Database, UserPlus, FileCode, Globe, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <Activity className="h-5 w-5 mr-2" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="h-5 w-5 mr-2" /> },
    { name: 'Scripts', path: '/admin/scripts', icon: <FileCode className="h-5 w-5 mr-2" /> },
    { name: 'Domains', path: '/admin/domains', icon: <Globe className="h-5 w-5 mr-2" /> },
    { name: 'Consent Logs', path: '/admin/consent-logs', icon: <Calendar className="h-5 w-5 mr-2" /> },
    { name: 'Admins', path: '/admin/admins', icon: <UserPlus className="h-5 w-5 mr-2" /> },
    { name: 'Webhooks', path: '/admin/webhooks', icon: <Database className="h-5 w-5 mr-2" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5 mr-2" /> },
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-2">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
          
          <div className="flex items-center flex-1">
            <Link to="/admin" className="flex items-center">
              <h1 className="text-xl font-bold text-brand-600">ConsentGuard Admin</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              User Dashboard
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-purple-100 text-purple-800">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleNavigation('/admin/settings')}>
                  Admin Settings
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
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${location.pathname === item.path 
                    ? 'bg-purple-50 text-purple-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                {item.icon}
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

export default AdminLayout;
