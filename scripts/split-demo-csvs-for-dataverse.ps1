$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $root "demo-data\csv"
$outputBaseDir = Join-Path $root "demo-data\csv-dataverse-ready"
$baseDir = Join-Path $outputBaseDir "base"
$relationsDir = Join-Path $outputBaseDir "relationship-updates"

$plans = @(
  @{
    File = "PAES Partner.csv"
    Key = "Partner Name"
    Lookups = @()
  },
  @{
    File = "PAES Course.csv"
    Key = "Course Name"
    Lookups = @()
  },
  @{
    File = "PAES Demand.csv"
    Key = "Demand Name"
    Lookups = @()
  },
  @{
    File = "PAES Supply.csv"
    Key = "Supply Name"
    Lookups = @("Linked Demand", "Partner")
  },
  @{
    File = "PAES Learner.csv"
    Key = "Learner Name"
    Lookups = @("Linked Supply", "Linked Course")
  },
  @{
    File = "PAES Readiness.csv"
    Key = "Readiness Name"
    Lookups = @("Linked Demand", "Linked Supply")
  },
  @{
    File = "PAES Deployment.csv"
    Key = "Deployment Name"
    Lookups = @("Linked Demand", "Linked Supply", "Linked Readiness", "Partner")
  },
  @{
    File = "PAES Event.csv"
    Key = "Event Name"
    Lookups = @()
  },
  @{
    File = "PAES Event Registration.csv"
    Key = "Registration Name"
    Lookups = @("Linked Event", "Participant")
  },
  @{
    File = "PAES Certification.csv"
    Key = "Certification Name"
    Lookups = @("Candidate or Supply", "Linked Demand")
  },
  @{
    File = "PAES Payment.csv"
    Key = "Payment Reference"
    Lookups = @("Linked Deployment", "Linked Learner")
  }
)

if (-not (Test-Path $sourceDir)) {
  throw "Source CSV folder not found: $sourceDir"
}

if (Test-Path $outputBaseDir) {
  Remove-Item -Recurse -Force $outputBaseDir
}

New-Item -ItemType Directory -Force $baseDir | Out-Null
New-Item -ItemType Directory -Force $relationsDir | Out-Null

foreach ($plan in $plans) {
  $path = Join-Path $sourceDir $plan.File
  $rows = Import-Csv -Path $path

  $allColumns = @($rows[0].PSObject.Properties.Name)
  $baseColumns = $allColumns | Where-Object { $_ -notin $plan.Lookups }

  $baseRows = foreach ($row in $rows) {
    $record = [ordered]@{}
    foreach ($column in $baseColumns) {
      $record[$column] = $row.$column
    }
    [pscustomobject]$record
  }

  $baseOutputPath = Join-Path $baseDir $plan.File
  $baseRows | Export-Csv -Path $baseOutputPath -NoTypeInformation -Encoding UTF8

  if ($plan.Lookups.Count -gt 0) {
    $relationshipRows = foreach ($row in $rows) {
      $record = [ordered]@{}
      $record[$plan.Key] = $row.($plan.Key)
      foreach ($lookup in $plan.Lookups) {
        $record[$lookup] = $row.$lookup
      }
      [pscustomobject]$record
    }

    $relationshipOutputPath = Join-Path $relationsDir $plan.File
    $relationshipRows | Export-Csv -Path $relationshipOutputPath -NoTypeInformation -Encoding UTF8
  }
}

$readme = @"
Dataverse import approach

1. Import all files in the 'base' folder first.
2. After those records exist, import the matching files in 'relationship-updates'.
3. During relationship-update import, map the first column as the primary-name match field and map each lookup column to the target table lookup.

Recommended base import order:
- PAES Partner.csv
- PAES Course.csv
- PAES Demand.csv
- PAES Event.csv
- PAES Supply.csv
- PAES Learner.csv
- PAES Readiness.csv
- PAES Deployment.csv
- PAES Event Registration.csv
- PAES Certification.csv
- PAES Payment.csv

Why this works:
The original CSVs include lookup fields. Dataverse often rejects those if the referenced records do not already exist or if the lookup mapping is not explicitly configured during import. Splitting the files lets you load base records first, then apply relationships in a second pass.
"@

Set-Content -Path (Join-Path $outputBaseDir "README.txt") -Value $readme -Encoding UTF8

Write-Output "Split CSV files created in: $outputBaseDir"
