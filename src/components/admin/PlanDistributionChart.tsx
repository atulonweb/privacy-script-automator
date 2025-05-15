
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlanDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const PlanDistributionChart: React.FC<PlanDistributionChartProps> = ({ data }) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Plan Distribution</CardTitle>
        <CardDescription>Users by subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PlanDistributionChart;
