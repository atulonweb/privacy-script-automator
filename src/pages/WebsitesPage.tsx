
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';

const WebsitesPage: React.FC = () => {
  const { websites, loading, error } = useWebsites();

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Websites</h2>
          <Button className="bg-brand-600 hover:bg-brand-700">
            Add Website
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">Error loading websites: {error}</p>
            <Button variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : websites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't added any websites yet.</p>
              <Button className="bg-brand-600 hover:bg-brand-700">
                Add Your First Website
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => (
              <Card key={website.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-brand-100 to-brand-50 p-6">
                  <h3 className="text-xl font-bold">{website.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{website.domain}</p>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Status:</span>
                      <span className={website.active ? "text-green-600" : "text-red-600"}>
                        {website.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(website.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button variant="outline" className="flex-1 text-sm">
                        Edit
                      </Button>
                      <Button variant="outline" className="flex-1 text-sm" disabled={!website.active}>
                        View Script
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WebsitesPage;
