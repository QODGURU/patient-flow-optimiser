
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const generatePatientTemplateFile = () => {
  // Define headers and example row
  const headers = [
    'Patient Name',
    'Age',
    'Gender',
    'Phone',
    'Email',
    'Clinic Name',
    'Doctor Name',
    'Treatment Category',
    'Treatment Type',
    'Price (AED)',
    'Follow-Up Required',
    'Preferred Time',
    'Preferred Channel',
    'Availability Preferences',
    'Notes',
    'Script'
  ];

  const exampleRow = [
    'John Doe',
    '35',
    'Male',
    '+971501234567',
    'johndoe@example.com',
    'Dubai Clinic',
    'Dr. Smith',
    'Dental',
    'Implant',
    '5000',
    'Yes',
    'Morning',
    'Call',
    'Weekdays',
    'First time patient',
    'Hello {name}, this is {clinic} following up on your {treatment} consultation.'
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

  // Add instructions sheet
  const instructions = [
    ['Patient Import Template Instructions'],
    [''],
    ['1. Fill in the data according to the column headers'],
    ['2. Do not modify the column headers'],
    ['3. Phone numbers should be in international format (e.g., +971501234567)'],
    ['4. Gender should be "Male", "Female", or "Other"'],
    ['5. Follow-Up Required should be "Yes" or "No"'],
    ['6. Preferred Time should be "Morning", "Afternoon", or "Evening"'],
    ['7. Preferred Channel should be "Call", "SMS", or "Email"'],
    ['8. Save the file as .xlsx or .csv before uploading'],
    [''],
    ['Note: All columns except Patient Name and Phone are optional']
  ];
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patient Template');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // Generate binary string
  const wbout = XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' });

  // Convert to Blob and save
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF;
  }

  const blob = new Blob([buf], { type: 'application/octet-stream' });
  saveAs(blob, 'patient_import_template.xlsx');
};
