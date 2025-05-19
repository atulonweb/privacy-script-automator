
import React, { useEffect } from "react";
import { useAdminManagement } from "@/hooks/admin/useAdminManagement";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPermissionsForm } from "./UserPermissionsForm";

export function AdminsList() {
  const { admins, loading, refreshing, fetchAdmins } = useAdminManagement();

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Current Administrators</h3>

        {loading ? (
          <div className="flex justify-center p-6">
            <Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : admins.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {format(new Date(admin.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-4 text-center border rounded-md">
            <p className="text-muted-foreground">No administrators found</p>
          </div>
        )}
      </div>
      
      <UserPermissionsForm />
    </div>
  );
}
