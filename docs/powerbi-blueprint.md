# PAES Power BI Blueprint

This document translates the agreed PAES operating model into a Power BI implementation plan.

The reporting model must follow:

`Demand -> Supply -> Readiness -> Deployment -> Revenue`

Revenue sources:
- Deployment
- Learning
- Events
- Certification

## 1. Power BI Objective

Build a management reporting layer that:
- gives leadership real-time operational visibility
- follows the PAES pipeline exactly
- supports weekly review meetings
- can later expand into a more formal enterprise BI setup

This report should sit on top of the Dataverse model already implemented in the PAES app.

## 2. Data Source

Primary source:
- Dataverse

Recommended connector:
- Power BI Dataverse connector / Power Platform Dataverse connector

Recommended refresh approach:
- scheduled refresh in Power BI Service
- start daily or twice daily
- move to more frequent refresh only if operational need justifies it

## 3. Core Tables To Bring Into Power BI

Bring these tables in exactly:
- `PAES Demand`
- `PAES Supply`
- `PAES Readiness`
- `PAES Deployment`
- `PAES Payment`
- `PAES Partner`
- `PAES Learner`
- `PAES Course`
- `PAES Event`
- `PAES Event Registration`
- `PAES Certification`

Useful technical names from the app:
- `paes_paesdemands`
- `paes_paessupplies`
- `paes_paesreadinesses`
- `paes_paesdeployments`
- `paes_paespayments`
- `paes_paespartners`
- `paes_paeslearners`
- `paes_paescourses`
- `paes_paesevents`
- `paes_paeseventregistrations`
- `paes_paescertifications`

## 4. Recommended Power BI Model

Use a clean reporting model, not a direct dump of all Dataverse complexity.

### Main fact-style tables
- `FactDemand`
- `FactSupply`
- `FactReadiness`
- `FactDeployment`
- `FactPayment`
- `FactEvent`
- `FactEventRegistration`
- `FactCertification`

### Supporting dimensions
- `DimDate`
- `DimRegion`
- `DimSkillCategory`
- `DimPartner`
- `DimRevenueSource`
- `DimStatus`

### Recommended relationships
- `Demand[DemandID]` -> `Supply[LinkedDemandID]`
- `Demand[DemandID]` -> `Readiness[LinkedDemandID]`
- `Demand[DemandID]` -> `Deployment[LinkedDemandID]`
- `Demand[DemandID]` -> `Certification[LinkedDemandID]`

- `Supply[SupplyID]` -> `Readiness[LinkedSupplyID]`
- `Supply[SupplyID]` -> `Deployment[LinkedSupplyID]`
- `Supply[SupplyID]` -> `Learner[LinkedSupplyID]`
- `Supply[SupplyID]` -> `Certification[CandidateOrSupplyID]`

- `Readiness[ReadinessID]` -> `Deployment[LinkedReadinessID]`

- `Deployment[DeploymentID]` -> `Payment[LinkedDeploymentID]`

- `Learner[LearnerID]` -> `Payment[LinkedLearnerID]`
- `Learner[LearnerID]` -> `EventRegistration[ParticipantID]`

- `Course[CourseID]` -> `Learner[LinkedCourseID]`

- `Event[EventID]` -> `EventRegistration[LinkedEventID]`

- `Partner[PartnerID]` -> `Supply[PartnerID]`
- `Partner[PartnerID]` -> `Deployment[PartnerID]`

### Date model
Create one `DimDate` table and connect it to the right facts through the most meaningful date columns:
- Demand -> Expected Start Date
- Supply -> Expected Readiness Date
- Readiness -> Date Updated
- Deployment -> Deployment Date
- Payment -> Payment Date
- Event -> Event Date
- Certification -> Date Started and optionally Date Completed through a secondary role-playing date table if needed

## 5. Power Query Cleanup Rules

Before modeling visuals:
- rename technical Dataverse column names to business names
- convert all amount fields to decimal/currency
- convert date fields to date type
- normalize status text values
- create a clean `Revenue Source` field in payments
- remove unused Dataverse metadata columns

### Important event rule
`Event Registration` is optional.

So in reporting:
- if registration-level rows exist, use them for participant-level metrics
- if they do not exist, fall back to summary values stored on `Event`

This should be handled in measures, not by forcing data entry.

## 6. Core Measures

Below are the first recommended DAX measures.

### Demand
```DAX
Total Demand Volume = SUM('PAES Demand'[Number of Seats])
```

```DAX
Demand Count = COUNTROWS('PAES Demand')
```

```DAX
Repeat Demand % =
DIVIDE(
    COUNTROWS(
        FILTER(
            SUMMARIZE('PAES Demand', 'PAES Demand'[Client Name], "DemandCount", COUNTROWS('PAES Demand')),
            [DemandCount] > 1
        )
    ),
    DISTINCTCOUNT('PAES Demand'[Client Name])
)
```

### Supply
```DAX
Total Supply Available = COUNTROWS('PAES Supply')
```

```DAX
Total Candidates = COUNTROWS('PAES Supply')
```

### Readiness
```DAX
Ready Candidates =
CALCULATE(
    DISTINCTCOUNT('PAES Readiness'[Linked Supply]),
    'PAES Readiness'[Readiness Status] = "Ready"
)
```

```DAX
Readiness % =
DIVIDE([Ready Candidates], [Total Supply Available])
```

```DAX
Average Time to Readiness =
AVERAGEX(
    'PAES Supply',
    DATEDIFF(TODAY(), 'PAES Supply'[Expected Readiness Date], DAY)
)
```

### Deployment
```DAX
Placements = COUNTROWS('PAES Deployment')
```

```DAX
Deployments Monthly =
CALCULATE(
    [Placements],
    DATESMTD('DimDate'[Date])
)
```

```DAX
Placement Rate =
DIVIDE([Placements], [Total Supply Available])
```

```DAX
Revenue per Placement =
DIVIDE(SUM('PAES Deployment'[Placement Revenue]), [Placements])
```

### Revenue
```DAX
Deployment Revenue = SUM('PAES Deployment'[Placement Revenue])
```

```DAX
Learning Revenue =
CALCULATE(
    SUM('PAES Payment'[Amount]),
    'PAES Payment'[Revenue Stream] = "Learning"
)
```

```DAX
Event Revenue =
VAR PaymentEventRevenue =
    CALCULATE(
        SUM('PAES Payment'[Amount]),
        'PAES Payment'[Revenue Stream] = "Event"
    )
RETURN
IF(NOT ISBLANK(PaymentEventRevenue), PaymentEventRevenue, SUM('PAES Event'[Total Revenue]))
```

```DAX
Certification Revenue =
VAR PaymentCertificationRevenue =
    CALCULATE(
        SUM('PAES Payment'[Amount]),
        'PAES Payment'[Revenue Stream] = "Certification"
    )
RETURN
IF(NOT ISBLANK(PaymentCertificationRevenue), PaymentCertificationRevenue, SUM('PAES Certification'[Revenue]))
```

```DAX
Total Revenue =
[Deployment Revenue] + [Learning Revenue] + [Event Revenue] + [Certification Revenue]
```

```DAX
Revenue per Candidate =
DIVIDE([Total Revenue], [Total Candidates])
```

### Events
```DAX
Number of Events = COUNTROWS('PAES Event')
```

```DAX
Registrations =
VAR RegistrationRows = COUNTROWS('PAES Event Registration')
RETURN
IF(RegistrationRows > 0, RegistrationRows, SUM('PAES Event'[Total Registrations]))
```

```DAX
Attendance Count =
VAR RegistrationAttendance =
    CALCULATE(
        COUNTROWS('PAES Event Registration'),
        'PAES Event Registration'[Attendance Status] = "Attended"
    )
RETURN
IF(RegistrationAttendance > 0, RegistrationAttendance, SUM('PAES Event'[Total Attendance]))
```

```DAX
Attendance Rate = DIVIDE([Attendance Count], [Registrations])
```

```DAX
Revenue per Event = DIVIDE([Event Revenue], [Number of Events])
```

### Certification
```DAX
Certification Pipeline Volume = COUNTROWS('PAES Certification')
```

```DAX
Completed Certifications =
CALCULATE(
    COUNTROWS('PAES Certification'),
    'PAES Certification'[Status] = "Completed"
)
```

```DAX
Certification Completion % =
DIVIDE([Completed Certifications], [Certification Pipeline Volume])
```

### Bottlenecks
```DAX
Demand Without Supply =
COUNTROWS(
    EXCEPT(
        VALUES('PAES Demand'[PAES Demand]),
        VALUES('PAES Supply'[Linked Demand])
    )
)
```

```DAX
Supply Not Ready =
COUNTROWS(
    EXCEPT(
        VALUES('PAES Supply'[PAES Supply]),
        CALCULATETABLE(
            VALUES('PAES Readiness'[Linked Supply]),
            'PAES Readiness'[Readiness Status] = "Ready"
        )
    )
)
```

```DAX
Ready But Not Deployed =
COUNTROWS(
    EXCEPT(
        CALCULATETABLE(
            VALUES('PAES Readiness'[Linked Supply]),
            'PAES Readiness'[Readiness Status] = "Ready"
        ),
        VALUES('PAES Deployment'[Linked Supply])
    )
)
```

## 7. Dashboard Pages To Build

These should map directly to the instruction email.

### Page 1: Executive Summary
Show:
- Total Demand Volume
- Total Supply Available
- Ready Candidates
- Deployments (Monthly)
- Total Revenue

Suggested visuals:
- 5 KPI cards
- monthly deployment trend
- revenue mix donut

### Page 2: Demand vs Supply
Show:
- Demand by Skill Category
- Supply by Skill Category
- Gap

Suggested visuals:
- clustered bar chart
- gap matrix

### Page 3: Readiness Status
Show:
- Not Ready
- In Progress
- Ready
- Key readiness gaps

Suggested visuals:
- readiness status donut
- bar chart for qualification/certification/training gaps

### Page 4: Deployment & Revenue
Show:
- Placements
- Revenue per placement
- Revenue by source

Suggested visuals:
- KPI cards
- stacked column by revenue source
- region/partner view if data quality supports it

### Page 5: Events Performance
Show:
- Number of events
- Registrations
- Attendance rate
- Revenue per event
- Total event revenue

### Page 6: Certification Overview
Show:
- Candidates in certification pipeline
- Completed certifications
- Certification revenue
- Certification gap by role/skill

### Page 7: Pipeline Bottlenecks
Show:
- Demand without supply
- Supply not ready
- Ready but not deployed

## 8. Filter Strategy

Use report-level filters and slicers for:
- Year
- Month
- Week if needed through date hierarchy
- Region
- Skill Category
- Partner
- Revenue Source

Optional later:
- Country
- Client
- Event Type

## 9. Best-Practice Power BI Build Plan

### Phase A: Foundation
1. connect Power BI to Dataverse
2. bring in the 11 PAES tables
3. clean names and types in Power Query
4. build `DimDate`, `DimRegion`, `DimSkillCategory`, `DimRevenueSource`
5. set relationships cleanly

### Phase B: Measures
1. create all mandatory measures first
2. validate numbers against the app dashboard
3. validate numbers against known sample records in Dataverse

### Phase C: Report Pages
1. Executive Summary
2. Demand vs Supply
3. Readiness Status
4. Deployment & Revenue
5. Events Performance
6. Certification Overview
7. Pipeline Bottlenecks

### Phase D: Publish and Share
1. publish to Power BI Service
2. configure refresh
3. apply workspace/app permissions
4. later embed into Teams if needed

## 10. Recommended First Build Sequence

For us to develop together, this is the best order:

1. define the exact Dataverse fields to use in Power BI
2. confirm table relationships for reporting
3. build the first set of DAX measures
4. build Page 1 Executive Summary
5. validate numbers
6. then build the other pages one by one

## 11. Immediate Next Step

Start with Page 1:
- create the dataset
- define the first 5 KPI measures
- validate them against live Dataverse data

That gives a reliable base before we build the full report.
