$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-SheetNameMap {
  param(
    [xml]$WorkbookXml,
    [xml]$RelationshipsXml
  )

  $workbookNs = New-Object System.Xml.XmlNamespaceManager($WorkbookXml.NameTable)
  $workbookNs.AddNamespace("main", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
  $workbookNs.AddNamespace("rel", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")

  $relsNs = New-Object System.Xml.XmlNamespaceManager($RelationshipsXml.NameTable)
  $relsNs.AddNamespace("pkg", "http://schemas.openxmlformats.org/package/2006/relationships")

  $relationshipMap = @{}
  foreach ($relationship in $RelationshipsXml.SelectNodes("//pkg:Relationship", $relsNs)) {
    $relationshipMap[$relationship.GetAttribute("Id")] = $relationship.GetAttribute("Target")
  }

  $sheetMap = @()
  foreach ($sheet in $WorkbookXml.SelectNodes("//main:sheet", $workbookNs)) {
    $relationshipId = $sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
    $sheetMap += [pscustomobject]@{
      Name = $sheet.GetAttribute("name")
      Target = $relationshipMap[$relationshipId]
    }
  }

  return $sheetMap
}

function Get-CellValue {
  param(
    [System.Xml.XmlElement]$Cell
  )

  if ($null -eq $Cell) {
    return ""
  }

  if ($Cell.t -eq "inlineStr") {
    if ($Cell.is -and $Cell.is.t) {
      return [string]$Cell.is.t
    }
    return ""
  }

  if ($Cell.v) {
    return [string]$Cell.v
  }

  return ""
}

function Convert-WorksheetToObjects {
  param(
    [xml]$WorksheetXml
  )

  $namespaceManager = New-Object System.Xml.XmlNamespaceManager($WorksheetXml.NameTable)
  $namespaceManager.AddNamespace("main", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

  $rows = $WorksheetXml.SelectNodes("//main:sheetData/main:row", $namespaceManager)
  if ($rows.Count -eq 0) {
    return @()
  }

  $headerCells = $rows[0].SelectNodes("./main:c", $namespaceManager)
  $headers = @()
  foreach ($cell in $headerCells) {
    $headers += Get-CellValue -Cell $cell
  }

  $objects = @()
  for ($rowIndex = 1; $rowIndex -lt $rows.Count; $rowIndex++) {
    $rowCells = $rows[$rowIndex].SelectNodes("./main:c", $namespaceManager)
    $orderedValues = @()
    foreach ($cell in $rowCells) {
      $orderedValues += Get-CellValue -Cell $cell
    }

    $record = [ordered]@{}
    for ($index = 0; $index -lt $headers.Count; $index++) {
      $record[$headers[$index]] = if ($index -lt $orderedValues.Count) { $orderedValues[$index] } else { "" }
    }

    $objects += [pscustomobject]$record
  }

  return $objects
}

$root = Split-Path -Parent $PSScriptRoot
$workbookPath = Join-Path $root "demo-data\PAES_Dummy_Data_Import_Workbook.xlsx"
$csvDir = Join-Path $root "demo-data\csv"

if (-not (Test-Path $workbookPath)) {
  throw "Workbook not found: $workbookPath"
}

if (Test-Path $csvDir) {
  Remove-Item -Recurse -Force $csvDir
}

New-Item -ItemType Directory -Force $csvDir | Out-Null

$zip = [System.IO.Compression.ZipFile]::OpenRead($workbookPath)

try {
  $workbookEntry = $zip.Entries | Where-Object FullName -eq "xl/workbook.xml"
  $relsEntry = $zip.Entries | Where-Object FullName -eq "xl/_rels/workbook.xml.rels"

  [xml]$workbookXml = (New-Object System.IO.StreamReader($workbookEntry.Open())).ReadToEnd()
  [xml]$relsXml = (New-Object System.IO.StreamReader($relsEntry.Open())).ReadToEnd()

  $sheetMap = Get-SheetNameMap -WorkbookXml $workbookXml -RelationshipsXml $relsXml

  foreach ($sheet in $sheetMap) {
    if ($sheet.Name -eq "Import Guide") {
      continue
    }

    $entryPath = "xl/$($sheet.Target)"
    $worksheetEntry = $zip.Entries | Where-Object FullName -eq $entryPath
    if ($null -eq $worksheetEntry) {
      continue
    }

    [xml]$worksheetXml = (New-Object System.IO.StreamReader($worksheetEntry.Open())).ReadToEnd()
    $objects = Convert-WorksheetToObjects -WorksheetXml $worksheetXml

    $safeName = ($sheet.Name -replace '[\\/:*?"<>|]', "_")
    $outputPath = Join-Path $csvDir "$safeName.csv"
    $objects | Export-Csv -Path $outputPath -NoTypeInformation -Encoding UTF8
  }
}
finally {
  $zip.Dispose()
}

Write-Output "CSV exports created in: $csvDir"
