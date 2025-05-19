
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { usePermissionsManagement } from '@/hooks/admin/usePermissionsManagement';

export function UserPermissionsForm() {
  const { email, setEmail, isSubmitting, handleAssignAdminRole } = usePermissionsManagement();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Admin Role</CardTitle>
        <CardDescription>
          Assign admin privileges to existing users by email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">User Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              The user must have an existing account in the system.
            </p>
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-4 bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <div className="text-sm">
              <p>Warning: Admin users have full access to all system functionality.</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAssignAdminRole} 
          disabled={isSubmitting || !email.includes('@')}
        >
          {isSubmitting ? 'Assigning...' : 'Assign Admin Role'}
        </Button>
      </CardFooter>
    </Card>
  );
}
