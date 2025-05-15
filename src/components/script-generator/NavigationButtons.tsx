
import React from 'react';
import { Button } from '@/components/ui/button';
import { ListIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavigationButtons: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="pt-4 flex gap-2">
      <Button 
        className="bg-brand-600 hover:bg-brand-700" 
        onClick={() => navigate('/dashboard', { replace: true })}
      >
        Back to Dashboard
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/dashboard/scripts')}
        className="flex-1"
      >
        <ListIcon className="mr-2 h-4 w-4" />
        View All Scripts
      </Button>
    </div>
  );
};

export default NavigationButtons;
