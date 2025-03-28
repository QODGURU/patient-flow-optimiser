
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { patients } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Snowflake, Clock, BarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const ColdLeadsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === "admin";

  // States for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");

  // Get only cold leads
  const coldLeads = patients.filter(patient => patient.status === "cold" || patient.status === "opt-out");
  
  // Filter patients based on role, search term, and reason
  const filteredPatients = coldLeads
    .filter((patient) => (isAdmin ? true : patient.doctorId === user?.id))
    .filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
    )
    .filter(
      (patient) => reasonFilter === "all" || patient.coldReason === reasonFilter
    );

  // Quick stats
  const countByReason = {
    "no-response": coldLeads.filter(p => p.coldReason === "no-response").length,
    "declined": coldLeads.filter(p => p.coldReason === "declined").length,
    "opt-out": coldLeads.filter(p => p.status === "opt-out").length,
    "invalid-contact": coldLeads.filter(p => p.coldReason === "invalid-contact").length,
    "budget-constraints": coldLeads.filter(p => p.coldReason === "budget-constraints").length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Snowflake className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Cold Leads</h1>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-500">No Response</p>
            <p className="text-xl font-bold">{countByReason["no-response"]}</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-500">Declined</p>
            <p className="text-xl font-bold">{countByReason["declined"]}</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-500">Opted Out</p>
            <p className="text-xl font-bold">{countByReason["opt-out"]}</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-500">Invalid Contact</p>
            <p className="text-xl font-bold">{countByReason["invalid-contact"]}</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-500">Budget Issues</p>
            <p className="text-xl font-bold">{countByReason["budget-constraints"]}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search by name or phone"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Select
            value={reasonFilter}
            onValueChange={setReasonFilter}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <span>Reason: {reasonFilter === "all" ? "All" : reasonFilter.replace("-", " ").charAt(0).toUpperCase() + reasonFilter.replace("-", " ").slice(1)}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              <SelectItem value="no-response">No Response</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="opt-out">Opted Out</SelectItem>
              <SelectItem value="invalid-contact">Invalid Contact</SelectItem>
              <SelectItem value="budget-constraints">Budget Constraints</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            View Analysis
          </Button>
        </div>
      </div>

      {/* Cold Leads Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Price (AED)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover-scale">
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.treatment}</TableCell>
                    <TableCell>{patient.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={patient.status} />
                    </TableCell>
                    <TableCell>
                      {patient.coldReason ? patient.coldReason.replace("-", " ") : "-"}
                    </TableCell>
                    <TableCell>{patient.lastContactDate || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/patients/${patient.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button variant="secondary" size="sm">
                          Reactivate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Snowflake className="h-8 w-8 text-blue-300 mb-2" />
                      <p className="text-lg font-medium text-gray-500 mb-2">
                        No cold leads found
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        {searchTerm || reasonFilter !== "all"
                          ? "Try changing your search or filter criteria"
                          : "All your leads are currently active"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ColdLeadsPage;
