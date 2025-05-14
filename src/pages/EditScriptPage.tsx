
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ScriptEditor from '@/components/script-generator/ScriptEditor';
import { ConsentScript } from '@/hooks/useScripts';

const EditScriptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const scriptData: ConsentScript | undefined = location.state?.scriptData;
  
  const handleBack = () => {
    navigate('/dashboard/scripts');
  };

  if (!scriptData) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Edit Script</h2>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No script data found. Please select a script to edit from the scripts list.</p>
              <Button onClick={handleBack} className="bg-brand-600 hover:bg-brand-700">
                Back to Scripts
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scripts
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Script</h2>
        </div>
        
        <ScriptEditor scriptData={scriptData} />
      </div>
    </DashboardLayout>
  );
};

export default EditScriptPage;
