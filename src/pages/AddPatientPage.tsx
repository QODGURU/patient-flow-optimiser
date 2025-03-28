
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { doctors } from "@/data/mockData";

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    doctorId: user?.id || "",
    clinicName: "",
    treatment: "",
    price: "",
    needsFollowUp: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, needsFollowUp: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd make an API call to save the patient
    
    // For demo purposes, we'll just show a success message
    toast.success("Patient added successfully");
    navigate("/patients");
  };

  // If admin, get a list of doctors for the dropdown
  const availableDoctors = isAdmin ? doctors : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Patient</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Enter the patient's details from the consultation
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+971 XX XXX XXXX"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    max="120"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Treatment Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Treatment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Input
                    id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    placeholder="e.g., Dental Implant"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (AED)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="needsFollowUp"
                  checked={formData.needsFollowUp}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="needsFollowUp" className="cursor-pointer">
                  This patient needs follow-up
                </Label>
              </div>
            </div>

            {/* Clinic Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Clinic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="doctorId">Assigned Doctor</Label>
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) => handleSelectChange("doctorId", value)}
                    >
                      <SelectTrigger id="doctorId">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/patients")}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-medical-teal hover:bg-teal-600">
              Add Patient
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddPatientPage;
