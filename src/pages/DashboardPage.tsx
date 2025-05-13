
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CopyIcon, CheckIcon } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const mockData = {
  consents: [
    { date: 'Jan', accept: 65, reject: 35, partial: 20 },
    { date: 'Feb', accept: 59, reject: 25, partial: 36 },
    { date: 'Mar', accept: 80, reject: 10, partial: 40 },
    { date: 'Apr', accept: 81, reject: 19, partial: 28 },
    { date: 'May', accept: 56, reject: 44, partial: 22 },
    { date: 'Jun', accept: 55, reject: 45, partial: 15 },
    { date: 'Jul', accept: 70, reject: 30, partial: 25 },
  ],
  websites: [
    { id: 1, name: 'My Company Website', domain: 'example.com', active: true, visitors: 12543, acceptRate: 78 },
    { id: 2, name: 'Blog', domain: 'blog.example.com', active: true, visitors: 5433, acceptRate: 65 },
  ]
};

const DashboardPage: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState(false);
  
  const sampleScript = `<script src="https://cdn.consentguard.com/cg.js?id=YOUR_SITE_ID" async></script>`;
  
  const handleCopyScript = () => {
    navigator.clipboard.writeText(sampleScript);
    setCopiedScript(true);
    
    setTimeout(() => {
      setCopiedScript(false);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Button className="bg-brand-600 hover:bg-brand-700">
            Create New Site
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Websites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.websites.length}</div>
              <p className="text-xs text-muted-foreground">
                Active websites using ConsentGuard
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.websites.reduce((acc, site) => acc + site.visitors, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Visitors across all your websites
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Acceptance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  mockData.websites.reduce((acc, site) => acc + site.acceptRate, 0) / 
                  mockData.websites.length
                )}%
              </div>
              <p className="text-xs text-muted-foreground">
                Users who accepted cookies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Scripts Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.websites.length}</div>
              <p className="text-xs text-muted-foreground">
                Active consent scripts
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Consent Analytics</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={mockData.consents}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="accept" stackId="1" stroke="#2563eb" fill="#2563eb" />
                  <Area type="monotone" dataKey="partial" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                  <Area type="monotone" dataKey="reject" stackId="1" stroke="#dc2626" fill="#dc2626" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Your Consent Script</CardTitle>
              <CardDescription>
                Add this script to your website's &lt;head&gt; tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                {sampleScript}
              </div>
              <Button 
                onClick={handleCopyScript} 
                variant="outline" 
                className="mt-4 w-full"
              >
                {copiedScript ? (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy Script
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Websites</CardTitle>
            <CardDescription>
              Manage your websites and view their consent statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Domain</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Visitors</th>
                    <th className="text-left py-3 px-4 font-medium">Acceptance Rate</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.websites.map((site) => (
                    <tr key={site.id} className="border-b">
                      <td className="py-3 px-4">{site.name}</td>
                      <td className="py-3 px-4">{site.domain}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4">{site.visitors.toLocaleString()}</td>
                      <td className="py-3 px-4">{site.acceptRate}%</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Manage</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
