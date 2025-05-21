
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { UserPlanManagement } from '@/components/admin/UserPlanManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPlansPage = () => {
  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Plan Management</h2>
        </div>

        <Tabs defaultValue="user-plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="user-plans">User Plans</TabsTrigger>
            <TabsTrigger value="plan-overview">Plan Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user-plans" className="space-y-4">
            <UserPlanManagement />
          </TabsContent>
          
          <TabsContent value="plan-overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Free Tier</CardTitle>
                  <CardDescription>$0 per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1 website</div>
                  <p className="text-xs text-muted-foreground">
                    7-day analytics, basic customization
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Basic Tier</CardTitle>
                  <CardDescription>$9.99 per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5 websites</div>
                  <p className="text-xs text-muted-foreground">
                    30-day analytics, standard customization
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Professional Tier</CardTitle>
                  <CardDescription>$29.99 per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">20 websites</div>
                  <p className="text-xs text-muted-foreground">
                    90-day analytics, full customization, white labeling
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Plan Features Comparison</CardTitle>
                <CardDescription>
                  Overview of features available in each subscription tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Feature</th>
                        <th className="text-center p-2">Free</th>
                        <th className="text-center p-2">Basic</th>
                        <th className="text-center p-2">Professional</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Websites</td>
                        <td className="text-center p-2">1</td>
                        <td className="text-center p-2">5</td>
                        <td className="text-center p-2">20</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Analytics History</td>
                        <td className="text-center p-2">7 days</td>
                        <td className="text-center p-2">30 days</td>
                        <td className="text-center p-2">90 days</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Webhooks</td>
                        <td className="text-center p-2">❌</td>
                        <td className="text-center p-2">✅</td>
                        <td className="text-center p-2">✅</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">White Labeling</td>
                        <td className="text-center p-2">❌</td>
                        <td className="text-center p-2">❌</td>
                        <td className="text-center p-2">✅</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Customization Level</td>
                        <td className="text-center p-2">Basic</td>
                        <td className="text-center p-2">Standard</td>
                        <td className="text-center p-2">Full</td>
                      </tr>
                      <tr>
                        <td className="p-2">Support Level</td>
                        <td className="text-center p-2">Community</td>
                        <td className="text-center p-2">Email</td>
                        <td className="text-center p-2">Priority</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPlansPage;
