
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDetailedAnalytics } from '@/hooks/useDetailedAnalytics';
import { useWebsites } from '@/hooks/useWebsites';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AnalyticsPage: React.FC = () => {
  const [selectedWebsite, setSelectedWebsite] = React.useState<string>('all');
  const [timeRange, setTimeRange] = React.useState('7');
  
  const { websites, loading: websitesLoading } = useWebsites();
  const { analyticsData, loading, error } = useAnalytics(selectedWebsite === 'all' ? undefined : selectedWebsite);
  const { geographicData, deviceData, sessionData, loading: detailedLoading } = useDetailedAnalytics(selectedWebsite === 'all' ? undefined : selectedWebsite, parseInt(timeRange));
  
  // Format data for charts
  const formattedChartData = React.useMemo(() => {
    if (!analyticsData) return [];
    
    const filteredData = analyticsData.slice(-parseInt(timeRange));
    
    return filteredData.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      visitors: item.visitor_count || 0,
      accepts: item.accept_count || 0,
      rejects: item.reject_count || 0,
      partials: item.partial_count || 0,
      acceptRate: Math.round(((item.accept_count || 0) / (item.visitor_count || 1)) * 100),
    }));
  }, [analyticsData, timeRange]);
  
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          
          <div className="flex gap-4">
            <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select website" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Websites</SelectItem>
                {websites.map((website) => (
                  <SelectItem key={website.id} value={website.id}>
                    {website.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <Loader className="h-8 w-8 animate-spin text-brand-600" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500">Error loading analytics data: {error}</p>
            </CardContent>
          </Card>
        ) : analyticsData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No analytics data available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formattedChartData.reduce((sum, item) => sum + item.visitors, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In the last {timeRange} days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Accepts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formattedChartData.reduce((sum, item) => sum + item.accepts, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In the last {timeRange} days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Rejects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formattedChartData.reduce((sum, item) => sum + item.rejects, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In the last {timeRange} days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Accept Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formattedChartData.length > 0 
                      ? Math.round(formattedChartData.reduce((sum, item) => sum + item.acceptRate, 0) / formattedChartData.length)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Visitors Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="visitors" stroke="#2563eb" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="accepts" stroke="#16a34a" />
                      <Line type="monotone" dataKey="rejects" stroke="#dc2626" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Consent Actions</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="accepts" stackId="a" fill="#16a34a" />
                      <Bar dataKey="rejects" stackId="a" fill="#dc2626" />
                      <Bar dataKey="partials" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Analytics Section */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Session Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Visitors</p>
                    <p className="text-2xl font-bold">{sessionData.activeVisitors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                    <p className="text-2xl font-bold">{sessionData.avgSessionDuration}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bounce Rate</p>
                    <p className="text-2xl font-bold">{sessionData.bounceRate}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {geographicData.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.region}</span>
                        <span className="text-sm font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Browsers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {deviceData.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.browser}</span>
                        <span className="text-sm font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
