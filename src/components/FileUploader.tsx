
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, X, Check, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface FileUploaderProps {
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  onFileAccepted?: (file: File) => void;
  onValidationComplete?: (isValid: boolean, data: any) => void;
}

const FileUploader = ({
  allowedFileTypes = [".csv", ".xlsx", ".xls"],
  maxSizeMB = 5,
  onFileAccepted,
  onValidationComplete,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    if (fileList.length === 0) return;
    
    const selectedFile = fileList[0];
    const fileExtension = "." + selectedFile.name.split(".").pop()?.toLowerCase();
    
    // Check file type
    if (!allowedFileTypes.includes(fileExtension)) {
      toast.error(`Invalid file type. Please upload ${allowedFileTypes.join(", ")}`);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    setFile(selectedFile);
    
    if (onFileAccepted) {
      onFileAccepted(selectedFile);
    }
    
    // Start validation process
    validateFile(selectedFile);
  };

  const validateFile = async (fileToValidate: File) => {
    setValidating(true);
    setProgress(0);
    setValidationErrors([]);
    
    // Simulate validation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => finishValidation(fileToValidate), 500);
          return 100;
        }
        return next;
      });
    }, 200);
  };

  const finishValidation = (fileToValidate: File) => {
    // In a real app, this would actually parse and validate the file
    const mockValidation = {
      totalRows: 50,
      validRows: 48,
      errors: fileToValidate.name.includes("error") ? [
        "Row 5: Invalid phone number format",
        "Row 23: Missing required field 'Name'"
      ] : []
    };
    
    setValidationErrors(mockValidation.errors);
    
    if (mockValidation.errors.length === 0) {
      toast.success(`File validated successfully. ${mockValidation.validRows} records ready for import.`);
    } else {
      toast.warning(`${mockValidation.errors.length} validation issues found`);
    }
    
    setValidating(false);
    
    if (onValidationComplete) {
      onValidationComplete(mockValidation.errors.length === 0, {
        file: fileToValidate,
        validation: mockValidation
      });
    }
  };

  const removeFile = () => {
    setFile(null);
    setValidationErrors([]);
    setProgress(0);
  };

  return (
    <div className="w-full space-y-4">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">
                Drag & drop your file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports {allowedFileTypes.join(", ")} (Max {maxSizeMB}MB)
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="mt-4"
            >
              Browse Files
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept={allowedFileTypes.join(",")}
              onChange={handleFileChange}
            />
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-primary/10 text-primary mr-3">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={validating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {validating ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Validating...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <div className="mt-2">
              {validationErrors.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Validation issues</span>
                  </div>
                  <div className="text-xs space-y-1 max-h-24 overflow-y-auto p-2 bg-amber-50 rounded border border-amber-200">
                    {validationErrors.map((error, index) => (
                      <p key={index} className="text-amber-800">{error}</p>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm" onClick={removeFile}>
                      Remove File
                    </Button>
                    <Button size="sm" disabled>
                      Fix Issues to Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">File is valid</span>
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm" onClick={removeFile}>
                      Remove File
                    </Button>
                    <Button size="sm">
                      Import Patients
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
