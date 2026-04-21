$ErrorActionPreference = "Stop"

function New-Row {
  param([hashtable]$Data)
  return $Data
}

function Escape-Xml {
  param([string]$Value)
  if ($null -eq $Value) { return "" }
  return [System.Security.SecurityElement]::Escape($Value)
}

function Get-ColumnName {
  param([int]$Number)
  $name = ""
  while ($Number -gt 0) {
    $remainder = ($Number - 1) % 26
    $name = [char](65 + $remainder) + $name
    $Number = [math]::Floor(($Number - 1) / 26)
  }
  return $name
}

function New-CellXml {
  param(
    [int]$RowIndex,
    [int]$ColumnIndex,
    $Value
  )

  $reference = "$(Get-ColumnName $ColumnIndex)$RowIndex"

  if ($null -eq $Value -or $Value -eq "") {
    return "<c r=`"$reference`" t=`"inlineStr`"><is><t></t></is></c>"
  }

  if ($Value -is [int] -or $Value -is [long] -or $Value -is [double] -or $Value -is [decimal]) {
    return "<c r=`"$reference`"><v>$Value</v></c>"
  }

  $escaped = Escape-Xml ([string]$Value)
  return "<c r=`"$reference`" t=`"inlineStr`"><is><t>$escaped</t></is></c>"
}

function New-SheetXml {
  param(
    [string[]]$Headers,
    [object[]]$Rows
  )

  $rowXml = New-Object System.Collections.Generic.List[string]

  $headerCells = for ($columnIndex = 1; $columnIndex -le $Headers.Count; $columnIndex++) {
    New-CellXml -RowIndex 1 -ColumnIndex $columnIndex -Value $Headers[$columnIndex - 1]
  }
  $rowXml.Add("<row r=`"1`">$($headerCells -join '')</row>")

  for ($rowIndex = 0; $rowIndex -lt $Rows.Count; $rowIndex++) {
    $rowNumber = $rowIndex + 2
    $cells = for ($columnIndex = 1; $columnIndex -le $Headers.Count; $columnIndex++) {
      $header = $Headers[$columnIndex - 1]
      New-CellXml -RowIndex $rowNumber -ColumnIndex $columnIndex -Value $Rows[$rowIndex][$header]
    }
    $rowXml.Add("<row r=`"$rowNumber`">$($cells -join '')</row>")
  }

  return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    $($rowXml -join "`n    ")
  </sheetData>
</worksheet>
"@
}

$partners = @(
  (New-Row @{
    "Partner Name" = "Nile Bridge Solutions"
    "Partner ID" = "PAR-001"
    "Partner Type" = "Employer"
    "Country" = "Ethiopia"
    "Region" = "Addis Ababa"
    "Contact Person" = "Marta Bekele"
    "Email" = "partnerships@nilebridge.example"
    "Phone" = "+251911000101"
    "Status" = "Active"
    "Notes" = "Strategic hiring partner for digital sales and service roles."
  }),
  (New-Row @{
    "Partner Name" = "Gulf Horizon Talent"
    "Partner ID" = "PAR-002"
    "Partner Type" = "Employer"
    "Country" = "UAE"
    "Region" = "Dubai"
    "Contact Person" = "Amina Rahman"
    "Email" = "ops@gulfhorizon.example"
    "Phone" = "+971501000202"
    "Status" = "Active"
    "Notes" = "Supports placement pathways for customer operations roles."
  }),
  (New-Row @{
    "Partner Name" = "Red Sea Skills Hub"
    "Partner ID" = "PAR-003"
    "Partner Type" = "Training Provider"
    "Country" = "Djibouti"
    "Region" = "Djibouti City"
    "Contact Person" = "Ismail Hassan"
    "Email" = "programs@redseaskills.example"
    "Phone" = "+25377000303"
    "Status" = "Onboarding"
    "Notes" = "Regional certification and readiness partner."
  }),
  (New-Row @{
    "Partner Name" = "Future Pathways Academy"
    "Partner ID" = "PAR-004"
    "Partner Type" = "Training Provider"
    "Country" = "Kenya"
    "Region" = "Nairobi"
    "Contact Person" = "Grace Njeri"
    "Email" = "academy@futurepathways.example"
    "Phone" = "+254711000404"
    "Status" = "Active"
    "Notes" = "Provides blended employability and technical delivery."
  })
)

$demands = @(
  (New-Row @{
    "Demand Name" = "Regional Digital Sales Cohort"
    "Demand ID" = "DEM-001"
    "Client Name" = "Nile Bridge Solutions"
    "Sector" = "ICT"
    "Region" = "Addis Ababa"
    "Skill Category" = "Digital Sales"
    "Required Skills" = "CRM, lead qualification, telesales"
    "Required Experience" = "0-2 years"
    "Required Qualifications" = "Diploma or degree"
    "Certification Required" = "No"
    "Number of Seats" = 40
    "Expected Start Date" = "2026-05-12"
    "Status" = "Open"
    "Expected Revenue" = 320000
    "Notes" = "Priority hiring wave for Q2 commercial expansion."
  }),
  (New-Row @{
    "Demand Name" = "Customer Support Readiness Pipeline"
    "Demand ID" = "DEM-002"
    "Client Name" = "Gulf Horizon Talent"
    "Sector" = "BPO"
    "Region" = "Dubai"
    "Skill Category" = "Customer Support"
    "Required Skills" = "Ticket handling, communication, CRM"
    "Required Experience" = "Entry level"
    "Required Qualifications" = "Secondary or diploma"
    "Certification Required" = "No"
    "Number of Seats" = 30
    "Expected Start Date" = "2026-06-01"
    "Status" = "In Progress"
    "Expected Revenue" = 270000
    "Notes" = "Arabic and English support mix requested."
  }),
  (New-Row @{
    "Demand Name" = "Healthcare Support Upskilling Batch"
    "Demand ID" = "DEM-003"
    "Client Name" = "Red Sea Skills Hub"
    "Sector" = "Healthcare"
    "Region" = "Djibouti City"
    "Skill Category" = "Healthcare Support"
    "Required Skills" = "Patient handling, documentation, customer care"
    "Required Experience" = "0-1 years"
    "Required Qualifications" = "Certificate or diploma"
    "Certification Required" = "Yes"
    "Number of Seats" = 25
    "Expected Start Date" = "2026-06-15"
    "Status" = "Open"
    "Expected Revenue" = 210000
    "Notes" = "Certification-linked readiness path required."
  }),
  (New-Row @{
    "Demand Name" = "Junior Data Annotation Team"
    "Demand ID" = "DEM-004"
    "Client Name" = "Future Pathways Academy"
    "Sector" = "Digital Services"
    "Region" = "Nairobi"
    "Skill Category" = "Data Annotation"
    "Required Skills" = "Labeling, QA review, productivity tracking"
    "Required Experience" = "Graduate entry level"
    "Required Qualifications" = "Degree preferred"
    "Certification Required" = "No"
    "Number of Seats" = 50
    "Expected Start Date" = "2026-05-26"
    "Status" = "Open"
    "Expected Revenue" = 295000
    "Notes" = "Multi-country delivery coverage planned."
  }),
  (New-Row @{
    "Demand Name" = "Hospitality Front Office Pipeline"
    "Demand ID" = "DEM-005"
    "Client Name" = "Nile Bridge Solutions"
    "Sector" = "Hospitality"
    "Region" = "Addis Ababa"
    "Skill Category" = "Front Office"
    "Required Skills" = "Guest service, reservations, communication"
    "Required Experience" = "1 year"
    "Required Qualifications" = "TVET or diploma"
    "Certification Required" = "No"
    "Number of Seats" = 18
    "Expected Start Date" = "2026-07-04"
    "Status" = "Open"
    "Expected Revenue" = 144000
    "Notes" = "Seasonal hiring window."
  }),
  (New-Row @{
    "Demand Name" = "Software QA Associate Intake"
    "Demand ID" = "DEM-006"
    "Client Name" = "Gulf Horizon Talent"
    "Sector" = "ICT"
    "Region" = "Dubai"
    "Skill Category" = "Software QA"
    "Required Skills" = "Manual testing, bug logging, regression testing"
    "Required Experience" = "0-2 years"
    "Required Qualifications" = "Degree in IT or engineering"
    "Certification Required" = "Yes"
    "Number of Seats" = 22
    "Expected Start Date" = "2026-08-10"
    "Status" = "In Progress"
    "Expected Revenue" = 260000
    "Notes" = "Certification preferred before deployment."
  })
)

$courses = @(
  (New-Row @{
    "Course Name" = "Digital Sales Readiness Bootcamp"
    "Course ID" = "CRS-001"
    "Category" = "Business"
    "Skill Category" = "Digital Sales"
    "Duration" = "6 weeks"
    "Price" = 18000
    "Delivery Type" = "Hybrid"
    "Status" = "Open"
    "Notes" = "Blended commercial readiness pathway."
  }),
  (New-Row @{
    "Course Name" = "Customer Support Foundations"
    "Course ID" = "CRS-002"
    "Category" = "Employability"
    "Skill Category" = "Customer Support"
    "Duration" = "4 weeks"
    "Price" = 12000
    "Delivery Type" = "Online"
    "Status" = "Open"
    "Notes" = "Regional remote delivery."
  }),
  (New-Row @{
    "Course Name" = "Healthcare Support Essentials"
    "Course ID" = "CRS-003"
    "Category" = "Technical"
    "Skill Category" = "Healthcare Support"
    "Duration" = "8 weeks"
    "Price" = 22000
    "Delivery Type" = "In Person"
    "Status" = "Open"
    "Notes" = "Includes compliance orientation."
  }),
  (New-Row @{
    "Course Name" = "Software QA Starter Track"
    "Course ID" = "CRS-004"
    "Category" = "Technical"
    "Skill Category" = "Software QA"
    "Duration" = "6 weeks"
    "Price" = 24000
    "Delivery Type" = "Hybrid"
    "Status" = "Open"
    "Notes" = "Testing fundamentals and work readiness."
  })
)

$supplies = @(
  (New-Row @{
    "Supply Name" = "Digital Sales Cohort A"
    "Supply ID" = "SUP-001"
    "Linked Demand" = "Regional Digital Sales Cohort"
    "Candidate Name" = "Digital Sales Cohort A"
    "Partner" = "Nile Bridge Solutions"
    "Region" = "Addis Ababa"
    "Skill Category" = "Digital Sales"
    "Skills Summary" = "CRM, communication, telesales"
    "Experience Level" = "Entry level"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Availability Status" = "Available"
    "Expected Readiness Date" = "2026-05-08"
    "Status" = "Open"
    "Notes" = "Primary feeder pool for DEM-001."
  }),
  (New-Row @{
    "Supply Name" = "Support Cohort Gulf 1"
    "Supply ID" = "SUP-002"
    "Linked Demand" = "Customer Support Readiness Pipeline"
    "Candidate Name" = "Support Cohort Gulf 1"
    "Partner" = "Gulf Horizon Talent"
    "Region" = "Dubai"
    "Skill Category" = "Customer Support"
    "Skills Summary" = "Call handling, CRM, service etiquette"
    "Experience Level" = "Entry level"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Availability Status" = "Pipeline"
    "Expected Readiness Date" = "2026-05-26"
    "Status" = "In Progress"
    "Notes" = "Language screening still underway."
  }),
  (New-Row @{
    "Supply Name" = "Healthcare Support Cohort"
    "Supply ID" = "SUP-003"
    "Linked Demand" = "Healthcare Support Upskilling Batch"
    "Candidate Name" = "Healthcare Support Cohort"
    "Partner" = "Red Sea Skills Hub"
    "Region" = "Djibouti City"
    "Skill Category" = "Healthcare Support"
    "Skills Summary" = "Patient care basics, documentation, service"
    "Experience Level" = "Entry level"
    "Qualification Status" = "Partial"
    "Certification Status" = "In Progress"
    "Availability Status" = "Pipeline"
    "Expected Readiness Date" = "2026-06-10"
    "Status" = "In Progress"
    "Notes" = "Certification in progress."
  }),
  (New-Row @{
    "Supply Name" = "Annotation Team East"
    "Supply ID" = "SUP-004"
    "Linked Demand" = "Junior Data Annotation Team"
    "Candidate Name" = "Annotation Team East"
    "Partner" = "Future Pathways Academy"
    "Region" = "Nairobi"
    "Skill Category" = "Data Annotation"
    "Skills Summary" = "Labeling, QA, productivity"
    "Experience Level" = "Graduate entry level"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Availability Status" = "Available"
    "Expected Readiness Date" = "2026-05-20"
    "Status" = "Open"
    "Notes" = "Ready for rapid mobilization."
  }),
  (New-Row @{
    "Supply Name" = "Hospitality Front Office Pool"
    "Supply ID" = "SUP-005"
    "Linked Demand" = "Hospitality Front Office Pipeline"
    "Candidate Name" = "Hospitality Front Office Pool"
    "Partner" = "Nile Bridge Solutions"
    "Region" = "Addis Ababa"
    "Skill Category" = "Front Office"
    "Skills Summary" = "Guest service, reservations, admin support"
    "Experience Level" = "Junior"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Availability Status" = "Available"
    "Expected Readiness Date" = "2026-06-20"
    "Status" = "Open"
    "Notes" = "Strong hospitality soft skills."
  }),
  (New-Row @{
    "Supply Name" = "QA Associates Pool"
    "Supply ID" = "SUP-006"
    "Linked Demand" = "Software QA Associate Intake"
    "Candidate Name" = "QA Associates Pool"
    "Partner" = "Gulf Horizon Talent"
    "Region" = "Dubai"
    "Skill Category" = "Software QA"
    "Skills Summary" = "Testing, defect logging, regression support"
    "Experience Level" = "Junior"
    "Qualification Status" = "Yes"
    "Certification Status" = "Partial"
    "Availability Status" = "Pipeline"
    "Expected Readiness Date" = "2026-07-22"
    "Status" = "In Progress"
    "Notes" = "Awaiting test certification completion."
  })
)

$readiness = @(
  (New-Row @{
    "Readiness Name" = "Readiness - Digital Sales Cohort A"
    "Readiness ID" = "RED-001"
    "Linked Demand" = "Regional Digital Sales Cohort"
    "Linked Supply" = "Digital Sales Cohort A"
    "Readiness Status" = "Ready"
    "Skills Match" = "Strong"
    "Experience Match" = "Good"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Key Requirements Met" = "Yes"
    "Training Status" = "Completed"
    "Date Updated" = "2026-05-06"
    "Notes" = "Ready for deployment shortlist."
  }),
  (New-Row @{
    "Readiness Name" = "Readiness - Support Cohort Gulf 1"
    "Readiness ID" = "RED-002"
    "Linked Demand" = "Customer Support Readiness Pipeline"
    "Linked Supply" = "Support Cohort Gulf 1"
    "Readiness Status" = "In Progress"
    "Skills Match" = "Moderate"
    "Experience Match" = "Entry fit"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Key Requirements Met" = "Partial"
    "Training Status" = "In Progress"
    "Date Updated" = "2026-05-18"
    "Notes" = "Language coaching and service simulation ongoing."
  }),
  (New-Row @{
    "Readiness Name" = "Readiness - Healthcare Support Cohort"
    "Readiness ID" = "RED-003"
    "Linked Demand" = "Healthcare Support Upskilling Batch"
    "Linked Supply" = "Healthcare Support Cohort"
    "Readiness Status" = "In Progress"
    "Skills Match" = "Good"
    "Experience Match" = "Entry fit"
    "Qualification Status" = "Partial"
    "Certification Status" = "In Progress"
    "Key Requirements Met" = "Partial"
    "Training Status" = "In Progress"
    "Date Updated" = "2026-06-02"
    "Notes" = "Certification exam window pending."
  }),
  (New-Row @{
    "Readiness Name" = "Readiness - Annotation Team East"
    "Readiness ID" = "RED-004"
    "Linked Demand" = "Junior Data Annotation Team"
    "Linked Supply" = "Annotation Team East"
    "Readiness Status" = "Ready"
    "Skills Match" = "Strong"
    "Experience Match" = "Strong"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Key Requirements Met" = "Yes"
    "Training Status" = "Completed"
    "Date Updated" = "2026-05-21"
    "Notes" = "Deployment-ready with QA supervisors identified."
  }),
  (New-Row @{
    "Readiness Name" = "Readiness - Hospitality Pool"
    "Readiness ID" = "RED-005"
    "Linked Demand" = "Hospitality Front Office Pipeline"
    "Linked Supply" = "Hospitality Front Office Pool"
    "Readiness Status" = "Not Ready"
    "Skills Match" = "Moderate"
    "Experience Match" = "Good"
    "Qualification Status" = "Yes"
    "Certification Status" = "No"
    "Key Requirements Met" = "No"
    "Training Status" = "Not Started"
    "Date Updated" = "2026-06-16"
    "Notes" = "Front office systems orientation not started."
  }),
  (New-Row @{
    "Readiness Name" = "Readiness - QA Associates Pool"
    "Readiness ID" = "RED-006"
    "Linked Demand" = "Software QA Associate Intake"
    "Linked Supply" = "QA Associates Pool"
    "Readiness Status" = "In Progress"
    "Skills Match" = "Good"
    "Experience Match" = "Moderate"
    "Qualification Status" = "Yes"
    "Certification Status" = "Partial"
    "Key Requirements Met" = "Partial"
    "Training Status" = "In Progress"
    "Date Updated" = "2026-07-18"
    "Notes" = "Certification still needed for full conversion."
  })
)

$deployments = @(
  (New-Row @{
    "Deployment Name" = "Deployment - Digital Sales Wave 1"
    "Deployment ID" = "DEP-001"
    "Linked Demand" = "Regional Digital Sales Cohort"
    "Linked Supply" = "Digital Sales Cohort A"
    "Linked Readiness" = "Readiness - Digital Sales Cohort A"
    "Partner" = "Nile Bridge Solutions"
    "Region" = "Addis Ababa"
    "Deployment Date" = "2026-05-12"
    "Deployment Status" = "Active"
    "Number Deployed" = 24
    "Placement Revenue" = 190000
    "Notes" = "First deployment wave activated."
  }),
  (New-Row @{
    "Deployment Name" = "Deployment - Annotation Team Launch"
    "Deployment ID" = "DEP-002"
    "Linked Demand" = "Junior Data Annotation Team"
    "Linked Supply" = "Annotation Team East"
    "Linked Readiness" = "Readiness - Annotation Team East"
    "Partner" = "Future Pathways Academy"
    "Region" = "Nairobi"
    "Deployment Date" = "2026-05-27"
    "Deployment Status" = "Planned"
    "Number Deployed" = 18
    "Placement Revenue" = 128000
    "Notes" = "Go-live planned for end of month."
  }),
  (New-Row @{
    "Deployment Name" = "Deployment - Support Pilot"
    "Deployment ID" = "DEP-003"
    "Linked Demand" = "Customer Support Readiness Pipeline"
    "Linked Supply" = "Support Cohort Gulf 1"
    "Linked Readiness" = "Readiness - Support Cohort Gulf 1"
    "Partner" = "Gulf Horizon Talent"
    "Region" = "Dubai"
    "Deployment Date" = "2026-06-06"
    "Deployment Status" = "Planned"
    "Number Deployed" = 10
    "Placement Revenue" = 90000
    "Notes" = "Pilot deployment pending final QA."
  })
)

$learners = @(
  (New-Row @{
    "Learner Name" = "Samrawit Alemu"
    "Learner ID" = "LRN-001"
    "Email" = "samrawit.alemu@example.org"
    "Phone" = "+251911111111"
    "Gender" = "Female"
    "Date of Birth" = "1998-02-14"
    "Region" = "Addis Ababa"
    "Status" = "Open"
    "Linked Supply" = "Digital Sales Cohort A"
    "Linked Course" = "Digital Sales Readiness Bootcamp"
    "Notes" = "Strong communication scores."
  }),
  (New-Row @{
    "Learner Name" = "Yonas Gebre"
    "Learner ID" = "LRN-002"
    "Email" = "yonas.gebre@example.org"
    "Phone" = "+251922222222"
    "Gender" = "Male"
    "Date of Birth" = "1997-09-03"
    "Region" = "Addis Ababa"
    "Status" = "Open"
    "Linked Supply" = "Digital Sales Cohort A"
    "Linked Course" = "Digital Sales Readiness Bootcamp"
    "Notes" = "Deployment-ready candidate."
  }),
  (New-Row @{
    "Learner Name" = "Layla Noor"
    "Learner ID" = "LRN-003"
    "Email" = "layla.noor@example.org"
    "Phone" = "+971533333333"
    "Gender" = "Female"
    "Date of Birth" = "1999-05-28"
    "Region" = "Dubai"
    "Status" = "In Progress"
    "Linked Supply" = "Support Cohort Gulf 1"
    "Linked Course" = "Customer Support Foundations"
    "Notes" = "Language proficiency training ongoing."
  }),
  (New-Row @{
    "Learner Name" = "Hassan Aden"
    "Learner ID" = "LRN-004"
    "Email" = "hassan.aden@example.org"
    "Phone" = "+253773333444"
    "Gender" = "Male"
    "Date of Birth" = "1996-11-19"
    "Region" = "Djibouti City"
    "Status" = "In Progress"
    "Linked Supply" = "Healthcare Support Cohort"
    "Linked Course" = "Healthcare Support Essentials"
    "Notes" = "Certification candidate."
  }),
  (New-Row @{
    "Learner Name" = "Amina Yusuf"
    "Learner ID" = "LRN-005"
    "Email" = "amina.yusuf@example.org"
    "Phone" = "+254744444555"
    "Gender" = "Female"
    "Date of Birth" = "2000-01-08"
    "Region" = "Nairobi"
    "Status" = "Open"
    "Linked Supply" = "Annotation Team East"
    "Linked Course" = "Customer Support Foundations"
    "Notes" = "Strong productivity and accuracy."
  }),
  (New-Row @{
    "Learner Name" = "Daniel Otieno"
    "Learner ID" = "LRN-006"
    "Email" = "daniel.otieno@example.org"
    "Phone" = "+254755555666"
    "Gender" = "Male"
    "Date of Birth" = "1998-07-30"
    "Region" = "Nairobi"
    "Status" = "Open"
    "Linked Supply" = "Annotation Team East"
    "Linked Course" = "Software QA Starter Track"
    "Notes" = "Candidate for QA track crossover."
  })
)

$events = @(
  (New-Row @{
    "Event Name" = "Regional Employer Forum Q2"
    "Event ID" = "EVT-001"
    "Event Type" = "Career Fair"
    "Event Date" = "2026-05-18"
    "Location" = "Addis Ababa Conference Center"
    "Organizer" = "PAES Team"
    "Capacity" = 180
    "Cost Per Participant" = 1500
    "Total Registrations" = 140
    "Total Attendance" = 118
    "Total Revenue" = 177000
    "Status" = "Closed"
    "Notes" = "High partner attendance and strong placement leads."
  }),
  (New-Row @{
    "Event Name" = "Future Skills Showcase"
    "Event ID" = "EVT-002"
    "Event Type" = "Workshop"
    "Event Date" = "2026-06-12"
    "Location" = "Dubai Knowledge Hub"
    "Organizer" = "Gulf Horizon Talent"
    "Capacity" = 90
    "Cost Per Participant" = 2200
    "Total Registrations" = 72
    "Total Attendance" = 61
    "Total Revenue" = 134200
    "Status" = "Open"
    "Notes" = "Focused on customer support and QA pathways."
  }),
  (New-Row @{
    "Event Name" = "Certification Readiness Clinic"
    "Event ID" = "EVT-003"
    "Event Type" = "Seminar"
    "Event Date" = "2026-06-28"
    "Location" = "Djibouti Skills Centre"
    "Organizer" = "Red Sea Skills Hub"
    "Capacity" = 60
    "Cost Per Participant" = 1200
    "Total Registrations" = 45
    "Total Attendance" = 39
    "Total Revenue" = 46800
    "Status" = "Open"
    "Notes" = "Supports healthcare and QA certification tracks."
  })
)

$eventRegistrations = @(
  (New-Row @{
    "Registration Name" = "Registration - Samrawit Alemu"
    "Registration ID" = "REG-001"
    "Linked Event" = "Regional Employer Forum Q2"
    "Participant" = "Samrawit Alemu"
    "Payment Status" = "Paid"
    "Amount Paid" = 1500
    "Attendance Status" = "Attended"
    "Notes" = "Participated in employer interviews."
  }),
  (New-Row @{
    "Registration Name" = "Registration - Yonas Gebre"
    "Registration ID" = "REG-002"
    "Linked Event" = "Regional Employer Forum Q2"
    "Participant" = "Yonas Gebre"
    "Payment Status" = "Paid"
    "Amount Paid" = 1500
    "Attendance Status" = "Attended"
    "Notes" = "Selected for next-round interview."
  }),
  (New-Row @{
    "Registration Name" = "Registration - Layla Noor"
    "Registration ID" = "REG-003"
    "Linked Event" = "Future Skills Showcase"
    "Participant" = "Layla Noor"
    "Payment Status" = "Pending"
    "Amount Paid" = 0
    "Attendance Status" = "Registered"
    "Notes" = "Awaiting payment approval."
  }),
  (New-Row @{
    "Registration Name" = "Registration - Hassan Aden"
    "Registration ID" = "REG-004"
    "Linked Event" = "Certification Readiness Clinic"
    "Participant" = "Hassan Aden"
    "Payment Status" = "Paid"
    "Amount Paid" = 1200
    "Attendance Status" = "Attended"
    "Notes" = "Completed certification preparation clinic."
  })
)

$certifications = @(
  (New-Row @{
    "Certification Name" = "Customer Service Foundations"
    "Certification ID" = "CER-001"
    "Certifying Body" = "Pearson"
    "Skill Category" = "Customer Support"
    "Candidate or Supply" = "Support Cohort Gulf 1"
    "Linked Demand" = "Customer Support Readiness Pipeline"
    "Status" = "In Progress"
    "Date Started" = "2026-05-14"
    "Date Completed" = ""
    "Cost" = 45000
    "Revenue" = 62000
    "Payment Status" = "Pending"
    "Notes" = "Bulk exam booking pending final roster."
  }),
  (New-Row @{
    "Certification Name" = "Healthcare Support Compliance"
    "Certification ID" = "CER-002"
    "Certifying Body" = "NHA"
    "Skill Category" = "Healthcare Support"
    "Candidate or Supply" = "Healthcare Support Cohort"
    "Linked Demand" = "Healthcare Support Upskilling Batch"
    "Status" = "In Progress"
    "Date Started" = "2026-05-20"
    "Date Completed" = ""
    "Cost" = 51000
    "Revenue" = 70000
    "Payment Status" = "Pending"
    "Notes" = "Exam preparation underway."
  }),
  (New-Row @{
    "Certification Name" = "Software QA Foundation"
    "Certification ID" = "CER-003"
    "Certifying Body" = "Prometric"
    "Skill Category" = "Software QA"
    "Candidate or Supply" = "QA Associates Pool"
    "Linked Demand" = "Software QA Associate Intake"
    "Status" = "Not Started"
    "Date Started" = ""
    "Date Completed" = ""
    "Cost" = 38000
    "Revenue" = 0
    "Payment Status" = "Pending"
    "Notes" = "Budget approved, scheduling next."
  }),
  (New-Row @{
    "Certification Name" = "Digital Sales Professional"
    "Certification ID" = "CER-004"
    "Certifying Body" = "Pearson"
    "Skill Category" = "Digital Sales"
    "Candidate or Supply" = "Digital Sales Cohort A"
    "Linked Demand" = "Regional Digital Sales Cohort"
    "Status" = "Completed"
    "Date Started" = "2026-04-12"
    "Date Completed" = "2026-05-02"
    "Cost" = 30000
    "Revenue" = 54000
    "Payment Status" = "Paid"
    "Notes" = "Completed ahead of deployment wave."
  })
)

$payments = @(
  (New-Row @{
    "Payment Reference" = "PAY-DEP-001"
    "Payment ID" = "PAY-001"
    "Linked Deployment" = "Deployment - Digital Sales Wave 1"
    "Linked Learner" = "Samrawit Alemu"
    "Payment Type" = "Invoice"
    "Revenue Stream" = "Deployment"
    "Amount" = 80000
    "Payment Date" = "2026-05-16"
    "Payment Status" = "Paid"
    "Notes" = "First deployment invoice received."
  }),
  (New-Row @{
    "Payment Reference" = "PAY-LRN-001"
    "Payment ID" = "PAY-002"
    "Linked Deployment" = ""
    "Linked Learner" = "Layla Noor"
    "Payment Type" = "Collection"
    "Revenue Stream" = "Learning"
    "Amount" = 12000
    "Payment Date" = "2026-05-25"
    "Payment Status" = "Paid"
    "Notes" = "Course fee settlement."
  }),
  (New-Row @{
    "Payment Reference" = "PAY-EVT-001"
    "Payment ID" = "PAY-003"
    "Linked Deployment" = ""
    "Linked Learner" = "Hassan Aden"
    "Payment Type" = "Collection"
    "Revenue Stream" = "Event"
    "Amount" = 1200
    "Payment Date" = "2026-06-28"
    "Payment Status" = "Paid"
    "Notes" = "Certification clinic attendance fee."
  }),
  (New-Row @{
    "Payment Reference" = "PAY-CER-001"
    "Payment ID" = "PAY-004"
    "Linked Deployment" = ""
    "Linked Learner" = "Hassan Aden"
    "Payment Type" = "Invoice"
    "Revenue Stream" = "Certification"
    "Amount" = 35000
    "Payment Date" = "2026-07-02"
    "Payment Status" = "Pending"
    "Notes" = "Certification billing raised."
  })
)

$guide = @(
  (New-Row @{
    "Step" = "1"
    "Instruction" = "Import tables in dependency order: PAES Partner, PAES Course, PAES Demand, PAES Supply, PAES Learner, PAES Readiness, PAES Deployment, PAES Event, PAES Event Registration, PAES Certification, PAES Payment."
  }),
  (New-Row @{
    "Step" = "2"
    "Instruction" = "Use the primary name fields to match lookup relationships during Dataverse import. Example: Linked Demand uses the Demand Name values from the PAES Demand sheet."
  }),
  (New-Row @{
    "Step" = "3"
    "Instruction" = "Review country, region, dates, and revenue amounts before import if you want to tailor the demo to a specific market or month."
  }),
  (New-Row @{
    "Step" = "4"
    "Instruction" = "If Dataverse asks for mapping, use the sheet headers, which match the display names of the PAES table columns."
  })
)

$sheets = @(
  @{ Name = "Import Guide"; Headers = @("Step", "Instruction"); Rows = $guide },
  @{ Name = "PAES Partner"; Headers = @("Partner Name", "Partner ID", "Partner Type", "Country", "Region", "Contact Person", "Email", "Phone", "Status", "Notes"); Rows = $partners },
  @{ Name = "PAES Course"; Headers = @("Course Name", "Course ID", "Category", "Skill Category", "Duration", "Price", "Delivery Type", "Status", "Notes"); Rows = $courses },
  @{ Name = "PAES Demand"; Headers = @("Demand Name", "Demand ID", "Client Name", "Sector", "Region", "Skill Category", "Required Skills", "Required Experience", "Required Qualifications", "Certification Required", "Number of Seats", "Expected Start Date", "Status", "Expected Revenue", "Notes"); Rows = $demands },
  @{ Name = "PAES Supply"; Headers = @("Supply Name", "Supply ID", "Linked Demand", "Candidate Name", "Partner", "Region", "Skill Category", "Skills Summary", "Experience Level", "Qualification Status", "Certification Status", "Availability Status", "Expected Readiness Date", "Status", "Notes"); Rows = $supplies },
  @{ Name = "PAES Learner"; Headers = @("Learner Name", "Learner ID", "Email", "Phone", "Gender", "Date of Birth", "Region", "Status", "Linked Supply", "Linked Course", "Notes"); Rows = $learners },
  @{ Name = "PAES Readiness"; Headers = @("Readiness Name", "Readiness ID", "Linked Demand", "Linked Supply", "Readiness Status", "Skills Match", "Experience Match", "Qualification Status", "Certification Status", "Key Requirements Met", "Training Status", "Date Updated", "Notes"); Rows = $readiness },
  @{ Name = "PAES Deployment"; Headers = @("Deployment Name", "Deployment ID", "Linked Demand", "Linked Supply", "Linked Readiness", "Partner", "Region", "Deployment Date", "Deployment Status", "Number Deployed", "Placement Revenue", "Notes"); Rows = $deployments },
  @{ Name = "PAES Event"; Headers = @("Event Name", "Event ID", "Event Type", "Event Date", "Location", "Organizer", "Capacity", "Cost Per Participant", "Total Registrations", "Total Attendance", "Total Revenue", "Status", "Notes"); Rows = $events },
  @{ Name = "PAES Event Registration"; Headers = @("Registration Name", "Registration ID", "Linked Event", "Participant", "Payment Status", "Amount Paid", "Attendance Status", "Notes"); Rows = $eventRegistrations },
  @{ Name = "PAES Certification"; Headers = @("Certification Name", "Certification ID", "Certifying Body", "Skill Category", "Candidate or Supply", "Linked Demand", "Status", "Date Started", "Date Completed", "Cost", "Revenue", "Payment Status", "Notes"); Rows = $certifications },
  @{ Name = "PAES Payment"; Headers = @("Payment Reference", "Payment ID", "Linked Deployment", "Linked Learner", "Payment Type", "Revenue Stream", "Amount", "Payment Date", "Payment Status", "Notes"); Rows = $payments }
)

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root "demo-data"
$tempDir = Join-Path $outputDir "xlsx-build"
$outputPath = Join-Path $outputDir "PAES_Dummy_Data_Import_Workbook.xlsx"

if (Test-Path $tempDir) {
  Remove-Item -Recurse -Force $tempDir
}

New-Item -ItemType Directory -Force $tempDir | Out-Null
New-Item -ItemType Directory -Force (Join-Path $tempDir "_rels") | Out-Null
New-Item -ItemType Directory -Force (Join-Path $tempDir "xl") | Out-Null
New-Item -ItemType Directory -Force (Join-Path $tempDir "xl\_rels") | Out-Null
New-Item -ItemType Directory -Force (Join-Path $tempDir "xl\worksheets") | Out-Null
New-Item -ItemType Directory -Force $outputDir | Out-Null

$sheetEntries = New-Object System.Collections.Generic.List[string]
$sheetRelationshipEntries = New-Object System.Collections.Generic.List[string]
$contentTypesEntries = New-Object System.Collections.Generic.List[string]

for ($index = 0; $index -lt $sheets.Count; $index++) {
  $sheetNumber = $index + 1
  $sheet = $sheets[$index]
  $worksheetXml = New-SheetXml -Headers $sheet.Headers -Rows $sheet.Rows
  $worksheetPath = Join-Path $tempDir "xl\worksheets\sheet$sheetNumber.xml"
  [System.IO.File]::WriteAllText($worksheetPath, $worksheetXml, [System.Text.UTF8Encoding]::new($false))

  $safeName = Escape-Xml $sheet.Name
  $sheetEntries.Add("<sheet name=`"$safeName`" sheetId=`"$sheetNumber`" r:id=`"rId$sheetNumber`"/>")
  $sheetRelationshipEntries.Add("<Relationship Id=`"rId$sheetNumber`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet`" Target=`"worksheets/sheet$sheetNumber.xml`"/>")
  $contentTypesEntries.Add("<Override PartName=`"/xl/worksheets/sheet$sheetNumber.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml`"/>")
}

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  $($contentTypesEntries -join "`n  ")
</Types>
"@

$rootRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"@

$workbook = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    $($sheetEntries -join "`n    ")
  </sheets>
</workbook>
"@

$workbookRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  $($sheetRelationshipEntries -join "`n  ")
  <Relationship Id="rId$($sheets.Count + 1)" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"@

$styles = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>
"@

[System.IO.File]::WriteAllText((Join-Path $tempDir "[Content_Types].xml"), $contentTypes, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $tempDir "_rels\.rels"), $rootRels, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $tempDir "xl\workbook.xml"), $workbook, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $tempDir "xl\_rels\workbook.xml.rels"), $workbookRels, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $tempDir "xl\styles.xml"), $styles, [System.Text.UTF8Encoding]::new($false))

if (Test-Path $outputPath) {
  Remove-Item -Force $outputPath
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $outputPath)

Write-Output "Workbook created: $outputPath"
