
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-brand-600">ConsentGuard</h1>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-brand-600 transition-colors">
              Home
            </Link>
            <Link to="/features" className="text-gray-700 hover:text-brand-600 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-brand-600 transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-brand-600 transition-colors">
              About
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-brand-600 transition-colors">
              Dashboard
            </Link>
          </nav>
        )}

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline">Log In</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-brand-600 hover:bg-brand-700">Sign Up</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="px-4 py-2 bg-white border-b">
          <nav className="flex flex-col">
            <Link to="/" className="py-3 border-b border-gray-100 text-gray-700">
              Home
            </Link>
            <Link to="/features" className="py-3 border-b border-gray-100 text-gray-700">
              Features
            </Link>
            <Link to="/pricing" className="py-3 border-b border-gray-100 text-gray-700">
              Pricing
            </Link>
            <Link to="/about" className="py-3 border-b border-gray-100 text-gray-700">
              About
            </Link>
            <Link to="/dashboard" className="py-3 border-b border-gray-100 text-gray-700">
              Dashboard
            </Link>
            <div className="flex flex-col space-y-2 py-3">
              <Link to="/login">
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">Sign Up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
