
import { useState } from "react";
import { doctors, patients } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Users, Phone, Mail } from "lucide-react";

const DoctorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.clinicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get patient counts for each doctor
  const getDoctorPatientCount = (doctorId: string) => {
    return patients.filter((patient) => patient.doctorId === doctorId).length;
  };

  // Get booked patients count
  const getDoctorBookedCount = (doctorId: string) => {
    return patients.filter(
      (patient) => patient.doctorId === doctorId && patient.status === "booked"
    ).length;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctors</h1>

      {/* Search */}
      <div className="mb-6 w-full md:w-1/2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search by name, email, or clinic"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Doctor Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Doctors</p>
              <h3 className="text-2xl font-bold">{doctors.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Patients
              </p>
              <h3 className="text-2xl font-bold">{patients.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Patients per Doctor (Avg)
              </p>
              <h3 className="text-2xl font-bold">
                {(patients.length / doctors.length).toFixed(1)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors List</CardTitle>
          <CardDescription>
            All doctors and their patient counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead className="text-center">Total Patients</TableHead>
                <TableHead className="text-center">Booked Appointments</TableHead>
                <TableHead className="text-center">Conversion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => {
                  const patientCount = getDoctorPatientCount(doctor.id);
                  const bookedCount = getDoctorBookedCount(doctor.id);
                  const conversionRate = patientCount > 0 
                    ? ((bookedCount / patientCount) * 100).toFixed(1)
                    : "0.0";
                  
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.clinicName}</TableCell>
                      <TableCell className="text-center">{patientCount}</TableCell>
                      <TableCell className="text-center">{bookedCount}</TableCell>
                      <TableCell className="text-center">{conversionRate}%</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-lg font-medium text-gray-500 mb-1">
                        No doctors found
                      </p>
                      <p className="text-sm text-gray-400">
                        Try a different search term
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorsPage;
