
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import StatisticsCard from '@/components/admin/StatisticsCard';
import GrowthChart from '@/components/admin/GrowthChart';
import PlanDistributionChart from '@/components/admin/PlanDistributionChart';
import RecentUsersTable from '@/components/admin/RecentUsersTable';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

const AdminDashboardPage: React.FC = () => {
  const { statistics, graphData, planDistribution, recentUsers, loading } = useAdminDashboard();

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatisticsCard 
            title="Total Users" 
            value={statistics.totalUsers}
            description="Active registered users"
          />
          <StatisticsCard 
            title="Total Websites" 
            value={statistics.totalWebsites}
            description="Websites using ConsentGuard"
          />
          <StatisticsCard 
            title="Active Scripts" 
            value={statistics.activeScripts}
            description="Scripts currently in use"
          />
          <StatisticsCard 
            title="Revenue" 
            value={`$${statistics.revenue}`}
            description="Monthly recurring revenue"
          />
        </div>
        
        {/* Growth Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <GrowthChart data={graphData} />
          <PlanDistributionChart data={planDistribution} />
        </div>
        
        {/* Recent Users */}
        <RecentUsersTable users={recentUsers} loading={loading} />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
