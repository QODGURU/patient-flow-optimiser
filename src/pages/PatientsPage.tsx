
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FilePlus, 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Edit,
  Trash2
} from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { Patient, FollowUp, Profile, Clinic } from "@/types/supabase";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 20;
const DEFAULT_COLUMNS = ["name", "phone", "treatment", "price", "status", "clinic", "actions"];

const PatientsPage = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  // States for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // Data fetching hooks
  const { data: patients, loading: patientsLoading, count: totalPatients, refetch: refetchPatients } = 
    useSupabaseQuery<Patient>("patients", {
      orderBy: { column: "created_at", ascending: false },
      limit: ITEMS_PER_PAGE,
      page: currentPage,
      filters: isAdmin ? {} : { doctor_id: profile?.id || "" }
    });

  const { data: clinics } = useSupabaseQuery<Clinic>("clinics");
  const { data: doctors } = useSupabaseQuery<Profile>("profiles", {
    filters: { role: "doctor" }
  });

  const { remove, loading: deleteLoading } = useMutateSupabase();

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter]);

  // All possible columns
  const allColumns = [
    { id: "id", name: "Patient ID" },
    { id: "name", name: "Patient Name" },
    { id: "age", name: "Age" },
    { id: "gender", name: "Gender" },
    { id: "clinic", name: "Clinic Name" },
    { id: "doctor", name: "Assigned Doctor" },
    { id: "phone", name: "Phone" },
    { id: "email", name: "Email" },
    { id: "treatment", name: "Treatment" },
    { id: "treatment_category", name: "Treatment Category" },
    { id: "price", name: "Price (AED)" },
    { id: "follow_up_required", name: "Follow-Up Required" },
    { id: "status", name: "Status" },
    { id: "created_at", name: "Created At" },
    { id: "next_interaction", name: "Next Interaction" },
    { id: "last_interaction", name: "Last Interaction" },
    { id: "last_interaction_outcome", name: "Last Outcome" },
    { id: "call_attempts", name: "Call Attempts" },
    { id: "sms_attempts", name: "SMS Attempts" },
    { id: "sms_transcript", name: "SMS Transcript" },
    { id: "call_transcript", name: "Call Transcript" },
    { id: "preferred_time", name: "Preferred Time" },
    { id: "preferred_channel", name: "Preferred Channel" },
    { id: "availability_preferences", name: "Availability Preferences" },
    { id: "notes", name: "Notes" },
    { id: "interaction_rating", name: "Interaction Rating" },
    { id: "patient_feedback", name: "Patient Feedback" },
    { id: "last_modified", name: "Last Modified" },
    { id: "last_modified_by", name: "Last Modified By" },
    { id: "script", name: "Script" },
    { id: "actions", name: "Actions" },
  ];

  // Filter patients based on search term and status
  const filteredPatients = patients.filter(
    (patient) => {
      const matchesSearch = 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || 
        patient.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }
  );

  const totalPages = Math.ceil(totalPatients / ITEMS_PER_PAGE);

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(current => 
      current.includes(columnId)
        ? current.filter(id => id !== columnId)
        : [...current, columnId]
    );
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      await remove("patients", patientToDelete);
      toast.success("Patient deleted successfully");
      refetchPatients();
    } catch (error) {
      // Error is handled in the mutation hook
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const confirmDelete = (patientId: string) => {
    setPatientToDelete(patientId);
    setDeleteDialogOpen(true);
  };

  const renderCellContent = (patient: Patient, columnId: string) => {
    const clinic = clinics.find(c => c.id === patient.clinic_id);
    const doctor = doctors.find(d => d.id === patient.doctor_id);
    const lastModifiedBy = doctors.find(d => d.id === patient.last_modified_by);

    switch (columnId) {
      case "id":
        return <span className="text-xs text-[#2B2E33] font-mono">{patient.id}</span>;
      case "name":
        return <span className="font-medium">{patient.name}</span>;
      case "age":
        return patient.age || "N/A";
      case "gender":
        return patient.gender || "N/A";
      case "clinic":
        return clinic?.name || "N/A";
      case "doctor":
        return doctor?.name || "N/A";
      case "phone":
        return patient.phone;
      case "email":
        return patient.email || "N/A";
      case "treatment":
        return patient.treatment_type || "N/A";
      case "treatment_category":
        return patient.treatment_category || "N/A";
      case "price":
        return patient.price ? `${patient.price.toLocaleString()} AED` : "N/A";
      case "follow_up_required":
        return (
          <Checkbox
            checked={patient.follow_up_required}
            disabled
          />
        );
      case "status":
        return <StatusBadge status={patient.status || "Pending"} />;
      case "created_at":
        return patient.created_at 
          ? new Date(patient.created_at).toLocaleDateString() 
          : "N/A";
      case "next_interaction":
        return patient.next_interaction 
          ? new Date(patient.next_interaction).toLocaleString() 
          : "Not scheduled";
      case "last_interaction":
        return patient.last_interaction 
          ? new Date(patient.last_interaction).toLocaleString() 
          : "None";
      case "last_interaction_outcome":
        return patient.last_interaction_outcome || "N/A";
      case "call_attempts":
        return patient.call_attempts || 0;
      case "sms_attempts":
        return patient.sms_attempts || 0;
      case "sms_transcript":
        return (
          <div className="max-w-xs truncate" title={patient.sms_transcript || ""}>
            {patient.sms_transcript || "No transcript"}
          </div>
        );
      case "call_transcript":
        return (
          <div className="max-w-xs truncate" title={patient.call_transcript || ""}>
            {patient.call_transcript || "No transcript"}
          </div>
        );
      case "preferred_time":
        return patient.preferred_time || "N/A";
      case "preferred_channel":
        return patient.preferred_channel || "N/A";
      case "availability_preferences":
        return (
          <div className="max-w-xs truncate" title={patient.availability_preferences || ""}>
            {patient.availability_preferences || "Not specified"}
          </div>
        );
      case "interaction_rating":
        return patient.interaction_rating || "N/A";
      case "patient_feedback":
        return (
          <div className="max-w-xs truncate" title={patient.patient_feedback || ""}>
            {patient.patient_feedback || "No feedback"}
          </div>
        );
      case "notes":
        return (
          <div className="max-w-xs truncate" title={patient.notes || ""}>
            {patient.notes || "No notes"}
          </div>
        );
      case "last_modified":
        return patient.last_modified 
          ? new Date(patient.last_modified).toLocaleString() 
          : "N/A";
      case "last_modified_by":
        return lastModifiedBy?.name || "N/A";
      case "script":
        return (
          <div className="max-w-xs truncate" title={patient.script || ""}>
            {patient.script || "No script"}
          </div>
        );
      case "actions":
        return (
          <div className="flex space-x-2 justify-end">
            <Link to={`/patients/${patient.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Details
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[#FF3B3B] border-[#FF3B3B]/20 hover:bg-[#FF3B3B]/10"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete(patient.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return "N/A";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#101B4C]">Patients</h1>
        <Link to="/add-patient">
          <Button className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90">
            <FilePlus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#2B2E33]/40" />
          </div>
          <Input
            type="text"
            placeholder="Search by name, phone, or email"
            className="pl-10 border-[#2B2E33]/20 focus-visible:ring-[#00FFC8]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full border-[#2B2E33]/20 focus:ring-[#00FFC8]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-[#2B2E33]/40" />
                <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Interested">Interested</SelectItem>
              <SelectItem value="Not Interested">Not Interested</SelectItem>
              <SelectItem value="Booked">Booked</SelectItem>
              <SelectItem value="Cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full flex justify-between items-center border-[#2B2E33]/20"
              >
                <span className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-[#2B2E33]/40" />
                  Columns
                </span>
                <ChevronDown className="h-4 w-4 text-[#2B2E33]/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                >
                  {column.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-[#101B4C]/10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {allColumns
                  .filter(column => visibleColumns.includes(column.id))
                  .map(column => (
                    <TableHead key={column.id} className="text-[#101B4C]">
                      {column.name}
                    </TableHead>
                  ))
                }
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientsLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {visibleColumns.map((column, colIndex) => (
                      <TableCell key={`skeleton-cell-${colIndex}`}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-[#00FFC8]/5">
                    {allColumns
                      .filter(column => visibleColumns.includes(column.id))
                      .map(column => (
                        <TableCell key={`${patient.id}-${column.id}`}>
                          {renderCellContent(patient, column.id)}
                        </TableCell>
                      ))
                    }
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium text-[#2B2E33] mb-2">
                        No patients found
                      </p>
                      <p className="text-sm text-[#2B2E33]/60 mb-4">
                        {searchTerm || statusFilter !== "all"
                          ? "Try changing your search or filter criteria"
                          : "Start by adding a new patient"}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <Link to="/add-patient">
                          <Button className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90">
                            <FilePlus className="mr-2 h-4 w-4" /> Add Patient
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!patientsLoading && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Show pages around current page
                let pageNumber = currentPage;
                if (totalPages <= 5) {
                  pageNumber = i;
                } else if (currentPage < 3) {
                  pageNumber = i;
                } else if (currentPage > totalPages - 3) {
                  pageNumber = totalPages - 5 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#101B4C]">Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this patient? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePatient}
              disabled={deleteLoading}
              className="bg-[#FF3B3B] hover:bg-[#FF3B3B]/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsPage;
