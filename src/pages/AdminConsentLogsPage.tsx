
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useConsentLogs } from "@/hooks/admin/useConsentLogs";
import ConsentLogsTable from "@/components/admin/ConsentLogsTable";
import ConsentLogsFilterBar from "@/components/admin/ConsentLogsFilterBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToJSON } from "@/lib/export";

const AdminConsentLogsPage = () => {
  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [domain, setDomain] = useState<string | null>(null);
  const [eventType, setEventType] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const { logs, isLoading, domains, error } = useConsentLogs({ dateRange, domain, eventType, region });

  const handleExportCSV = () => {
    if (logs) {
      exportToCSV(logs, 'consent-logs');
    }
  };

  const handleExportJSON = () => {
    if (logs) {
      exportToJSON(logs, 'consent-logs');
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Consent Logs & Analytics</h1>
            <p className="text-muted-foreground">
              View and analyze user consent activity across all domains
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={isLoading || !logs?.length}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={isLoading || !logs?.length}
            >
              Export JSON
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filter Logs</CardTitle>
            <CardDescription>
              Narrow down consent logs by date, domain, event type, or region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsentLogsFilterBar 
              domains={domains}
              dateRange={dateRange}
              selectedDomain={domain}
              selectedEventType={eventType}
              selectedRegion={region}
              onDateRangeChange={setDateRange}
              onDomainChange={setDomain}
              onEventTypeChange={setEventType}
              onRegionChange={setRegion}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Consent Logs</CardTitle>
            <CardDescription>
              Detailed record of user consent activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">
                Error: {error}
              </div>
            ) : logs && logs.length > 0 ? (
              <ConsentLogsTable logs={logs} />
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No consent logs found matching the selected filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminConsentLogsPage;
