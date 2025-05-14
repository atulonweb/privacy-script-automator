
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import ScriptEditor from '@/components/script-generator/ScriptEditor';
import { ConsentScript, useScripts } from '@/hooks/useScripts';
import { useToast } from '@/hooks/use-toast';

const EditScriptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { scripts, loading: scriptsLoading, fetchScripts } = useScripts();
  const [scriptData, setScriptData] = useState<ConsentScript | undefined>(
    location.state?.scriptData
  );
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // If script data wasn't passed via location state, fetch it using the id
    if (!scriptData && id) {
      const loadScript = async () => {
        setLoading(true);
        await fetchScripts();
        setLoading(false);
      };
      
      loadScript();
    } else {
      setLoading(false);
    }
  }, [id, scriptData, fetchScripts]);
  
  // Find the script after fetching if we didn't have it from location state
  useEffect(() => {
    if (!scriptData && id && scripts.length > 0) {
      const foundScript = scripts.find(script => script.id === id);
      if (foundScript) {
        setScriptData(foundScript);
      } else {
        toast({
          title: "Error",
          description: "Script not found",
          variant: "destructive",
        });
      }
    }
  }, [id, scripts, scriptData, toast]);
  
  const handleBack = () => {
    navigate('/dashboard/scripts');
  };

  if (loading || scriptsLoading) {
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
              <Loader className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading script data...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
