
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MakeAdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const promoteUser = async () => {
    const email = "admin@example.com";
    setLoading(true);
    
    try {
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to promote user to admin');
      }

      setResult(`SUCCESS: ${data.message || 'User successfully promoted to admin!'}`);
      toast.success(data.message || 'User successfully promoted to admin!');
    } catch (error: any) {
      setResult(`ERROR: ${error.message || 'An error occurred while promoting user'}`);
      toast.error(error.message || 'An error occurred while promoting user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Promote User to Admin</CardTitle>
          <CardDescription className="text-center">
            This will promote admin@example.com to admin role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This action will promote user with email <strong>admin@example.com</strong> to admin role.
            The user must exist in the system for this to work.
          </p>
          
          {result && (
            <div className={`p-3 rounded ${result.startsWith('ERROR') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {result}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Back
          </Button>
          <Button 
            onClick={promoteUser} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Make Admin'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MakeAdminPage;
