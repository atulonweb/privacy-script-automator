
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GrowthChartProps {
  data: Array<{
    month: string;
    users: number;
    websites: number;
    revenue: number;
  }>;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Growth Overview</CardTitle>
        <CardDescription>Platform growth over time</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="users" stackId="1" stroke="#2563eb" fill="#93c5fd" name="Users" />
            <Area type="monotone" dataKey="websites" stackId="2" stroke="#059669" fill="#6ee7b7" name="Websites" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
