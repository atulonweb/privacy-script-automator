
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PlanFeatureAlertProps {
  title: string;
  description: string;
  showUpgradeButton?: boolean;
}

const PlanFeatureAlert: React.FC<PlanFeatureAlertProps> = ({ 
  title, 
  description, 
  showUpgradeButton = true 
}) => {
  const navigate = useNavigate();
  
  return (
    <Alert className="bg-amber-50 border-amber-200 mb-4">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">{title}</AlertTitle>
      <AlertDescription className="text-amber-700 flex justify-between items-center">
        <span>{description}</span>
        {showUpgradeButton && (
          <Button 
            variant="outline" 
            className="ml-4 border-amber-500 text-amber-700 hover:bg-amber-100"
            onClick={() => navigate('/plans')}
          >
            View Plans
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default PlanFeatureAlert;
