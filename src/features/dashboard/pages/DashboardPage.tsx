import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../../../components/ui/Card";
import { ErrorState } from "../../../components/ui/ErrorState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { formatCurrency, formatNumber, formatPercent } from "../../../lib/utils";
import { useDataverseClient } from "../../../services/dataverse/DataverseContext";
import type { DataverseListResponse } from "../../../types/entities";
import { demandModule, supplyModule, moduleRoutes } from "../../modules/moduleRegistry";

function getModule(key: string) {
  const moduleConfig = moduleRoutes.find((item) => item.key === key);
  if (!moduleConfig) {
    throw new Error(`Module configuration not found for ${key}`);
  }

  return moduleConfig;
}

function toRecordMap(record: unknown) {
  return record as Record<string, unknown>;
}

function useDashboardDataset(entitySetName: string, selectFields: string[]) {
  const client = useDataverseClient();
  const select = Array.from(new Set(selectFields)).join(",");

  return useQuery({
    queryKey: ["dashboard", entitySetName, select],
    queryFn: async () => {
      const response = await client.request<DataverseListResponse<Record<string, unknown>>>(
        `${entitySetName}?$select=${select}`,
      );

      return response.value;
    },
  });
}

function numberValue(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sumBy(records: Record<string, unknown>[], field: string) {
  return records.reduce((total, record) => total + numberValue(record[field]), 0);
}

function countByMonth(records: Record<string, unknown>[], field: string) {
  const now = new Date();
  return records.filter((record) => {
    const value = textValue(record[field]);
    if (!value) {
      return false;
    }

    const date = new Date(value);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
}

function groupCounts(records: Record<string, unknown>[], field: string, valueField?: string) {
  const grouped = new Map<string, number>();

  records.forEach((record) => {
    const key = textValue(record[field]) || "Unspecified";
    const increment = valueField ? Math.max(numberValue(record[valueField]), 1) : 1;
    grouped.set(key, (grouped.get(key) ?? 0) + increment);
  });

  return Array.from(grouped.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function daysFromNow(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const diff = date.getTime() - Date.now();
  return diff / (1000 * 60 * 60 * 24);
}

function lookupId(record: Record<string, unknown>, field: string) {
  return textValue(record[`_${field}_value`]);
}

function daysBetween(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

type PeriodFilter = "all" | "week" | "month" | "year";

function uniqueTextOptions(records: Record<string, unknown>[], fields: string[]) {
  return Array.from(
    new Set(
      records.flatMap((record) =>
        fields
          .map((field) => textValue(record[field]).trim())
          .filter(Boolean),
      ),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

function filterRecordsBySelections(
  records: Record<string, unknown>[],
  {
    region,
    skillCategory,
    revenueStream,
  }: {
    region: string;
    skillCategory: string;
    revenueStream: string;
  },
) {
  return records.filter((record) => {
    const matchesRegion =
      !region ||
      [
        textValue(record.paes_region),
        textValue(record.paes_location),
      ].includes(region);
    const matchesSkill =
      !skillCategory ||
      [textValue(record.paes_skillcategory), textValue(record.paes_sector)].includes(skillCategory);
    const matchesRevenue = !revenueStream || textValue(record.paes_revenuestream) === revenueStream;

    return matchesRegion && matchesSkill && matchesRevenue;
  });
}

function filterRecordsByDate(
  records: Record<string, unknown>[],
  dateFields: string[],
  period: PeriodFilter,
  year: string,
  month: string,
) {
  return records.filter((record) => {
    const matchingDate = dateFields
      .map((field) => textValue(record[field]))
      .find((value) => value);

    if (!matchingDate) {
      return !year && !month;
    }

    const date = new Date(matchingDate);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();
    const matchesYear = !year || String(date.getFullYear()) === year;
    const matchesMonth = !month || String(date.getMonth() + 1).padStart(2, "0") === month;

    let matchesPeriod = true;
    if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      matchesPeriod = date >= start && date <= now;
    } else if (period === "month") {
      matchesPeriod = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    } else if (period === "year") {
      matchesPeriod = date.getFullYear() === now.getFullYear();
    }

    return matchesYear && matchesMonth && matchesPeriod;
  });
}

function MetricList({
  items,
}: {
  items: Array<{ label: string; value: string; helper?: ReactNode }>;
}) {
  return (
    <div className="metric-list">
      {items.map((item) => (
        <article key={item.label} className="metric-list__item">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.helper ? <small>{item.helper}</small> : null}
        </article>
      ))}
    </div>
  );
}

function RankedList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="ranked-list">
      <h4>{title}</h4>
      {items.length === 0 ? <p>No records yet.</p> : null}
      {items.map((item) => (
        <div key={item.label} className="ranked-list__item">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [region, setRegion] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [revenueStream, setRevenueStream] = useState("");
  const demandQuery = useDashboardDataset(demandModule.entitySetName, [
    demandModule.primaryIdField,
    "paes_demandname",
    "paes_clientname",
    "paes_skillcategory",
    "paes_numberofseats",
    "paes_expectedrevenue",
    "paes_expectedstartdate",
    "paes_region",
    "paes_status",
  ]);
  const supplyQuery = useDashboardDataset(supplyModule.entitySetName, [
    supplyModule.primaryIdField,
    "paes_supplyname",
    "paes_candidatename",
    "paes_skillcategory",
    "paes_region",
    "paes_status",
    "paes_expectedreadinessdate",
    "_paes_linkeddemand_value",
  ]);
  const readinessQuery = useDashboardDataset(getModule("readiness").entitySetName, [
    getModule("readiness").primaryIdField,
    "paes_readinessname",
    "paes_readinessstatus",
    "paes_skillsmatch",
    "paes_experiencematch",
    "paes_qualificationstatus",
    "paes_certificationstatus",
    "paes_trainingstatus",
    "paes_keyrequirementsmet",
    "paes_dateupdated",
    "_paes_linkeddemand_value",
    "_paes_linkedsupply_value",
  ]);
  const deploymentQuery = useDashboardDataset(getModule("deployments").entitySetName, [
    getModule("deployments").primaryIdField,
    "paes_deploymentname",
    "paes_deploymentdate",
    "paes_deploymentstatus",
    "paes_numberdeployed",
    "paes_placementrevenue",
    "_paes_linkeddemand_value",
    "_paes_linkedsupply_value",
    "_paes_linkedreadiness_value",
  ]);
  const paymentQuery = useDashboardDataset(getModule("payments").entitySetName, [
    getModule("payments").primaryIdField,
    "paes_paymentreference",
    "paes_paymentdate",
    "paes_amount",
    "paes_paymentstatus",
    "paes_paymenttype",
    "paes_revenuestream",
    "_paes_linkeddeployment_value",
    "_paes_linkedlearner_value",
  ]);
  const eventQuery = useDashboardDataset(getModule("events").entitySetName, [
    getModule("events").primaryIdField,
    "paes_eventname",
    "paes_eventdate",
    "paes_eventtype",
    "paes_location",
    "paes_capacity",
    "paes_totalregistrations",
    "paes_totalattendance",
    "paes_totalrevenue",
    "paes_status",
  ]);
  const eventRegistrationQuery = useDashboardDataset(getModule("event-registrations").entitySetName, [
    getModule("event-registrations").primaryIdField,
    "paes_registrationname",
    "paes_registrationid",
    "paes_paymentstatus",
    "paes_attendancestatus",
    "paes_amountpaid",
    "_paes_linkedevent_value",
    "_paes_participant_value",
  ]);
  const certificationQuery = useDashboardDataset(getModule("certifications").entitySetName, [
    getModule("certifications").primaryIdField,
    "paes_certificationname",
    "paes_certificationid",
    "paes_certifyingbody",
    "paes_skillcategory",
    "paes_datestarted",
    "paes_datecompleted",
    "paes_cost",
    "paes_revenue",
    "paes_paymentstatus",
    "paes_status",
    "_paes_linkeddemand_value",
    "_paes_candidateorsupply_value",
  ]);

  const requiredQueries = [
    demandQuery,
    supplyQuery,
    readinessQuery,
    deploymentQuery,
    paymentQuery,
    eventQuery,
    certificationQuery,
  ];
  const optionalQueries = [eventRegistrationQuery];

  const demands = (demandQuery.data ?? []).map(toRecordMap);
  const allSupplies = (supplyQuery.data ?? []).map(toRecordMap);
  const allReadiness = (readinessQuery.data ?? []).map(toRecordMap);
  const allDeployments = (deploymentQuery.data ?? []).map(toRecordMap);
  const allPayments = (paymentQuery.data ?? []).map(toRecordMap);
  const allEvents = (eventQuery.data ?? []).map(toRecordMap);
  const allEventRegistrations = eventRegistrationQuery.isError ? [] : (eventRegistrationQuery.data ?? []).map(toRecordMap);
  const allCertifications = (certificationQuery.data ?? []).map(toRecordMap);

  const regionOptions = useMemo(
    () => uniqueTextOptions([...demands, ...allSupplies, ...allDeployments, ...allEvents], ["paes_region", "paes_location"]),
    [allDeployments, allEvents, allSupplies, demands],
  );
  const skillOptions = useMemo(
    () => uniqueTextOptions([...demands, ...allSupplies, ...allCertifications], ["paes_skillcategory", "paes_sector"]),
    [allCertifications, allSupplies, demands],
  );
  const yearOptions = useMemo(() => {
    const allDates = [
      ...demands.map((record) => textValue(record.paes_expectedstartdate)),
      ...allSupplies.map((record) => textValue(record.paes_expectedreadinessdate)),
      ...allReadiness.map((record) => textValue(record.paes_dateupdated)),
      ...allDeployments.map((record) => textValue(record.paes_deploymentdate)),
      ...allPayments.map((record) => textValue(record.paes_paymentdate)),
      ...allEvents.map((record) => textValue(record.paes_eventdate)),
      ...allCertifications.map((record) => textValue(record.paes_datestarted)),
    ]
      .map((value) => new Date(value))
      .filter((value) => !Number.isNaN(value.getTime()))
      .map((value) => String(value.getFullYear()));

    return Array.from(new Set(allDates)).sort((left, right) => Number(right) - Number(left));
  }, [allCertifications, allDeployments, allEvents, allPayments, allReadiness, allSupplies, demands]);

  if (requiredQueries.some((query) => query.isLoading)) {
    return <LoadingState label="Loading pipeline dashboard..." />;
  }

  const errorQuery = requiredQueries.find((query) => query.isError);
  if (errorQuery?.error) {
    return (
      <ErrorState
        message={errorQuery.error instanceof Error ? errorQuery.error.message : "Unable to load dashboard data."}
      />
    );
  }

  const optionalWarnings = optionalQueries
    .filter((query) => query.isError)
    .map(
      () =>
        "Participant-level event registration data is unavailable, so event metrics are being calculated from event summary totals.",
    );

  const demandsFiltered = filterRecordsBySelections(
    filterRecordsByDate(demands, ["paes_expectedstartdate"], period, year, month),
    { region, skillCategory, revenueStream },
  );
  const supplies = filterRecordsBySelections(
    filterRecordsByDate(allSupplies, ["paes_expectedreadinessdate"], period, year, month),
    { region, skillCategory, revenueStream },
  );
  const readiness = filterRecordsBySelections(
    filterRecordsByDate(allReadiness, ["paes_dateupdated"], period, year, month),
    { region, skillCategory, revenueStream },
  );
  const deployments = filterRecordsBySelections(
    filterRecordsByDate(allDeployments, ["paes_deploymentdate"], period, year, month),
    { region, skillCategory, revenueStream },
  );
  const payments = filterRecordsBySelections(
    filterRecordsByDate(allPayments, ["paes_paymentdate"], period, year, month),
    { region, skillCategory, revenueStream },
  );
  const events = filterRecordsBySelections(
    filterRecordsByDate(allEvents, ["paes_eventdate"], period, year, month),
    { region, skillCategory, revenueStream },
  );
  const eventRegistrations = filterRecordsBySelections(
    filterRecordsByDate(allEventRegistrations, [], period, year, month),
    { region, skillCategory, revenueStream },
  );
  const certifications = filterRecordsBySelections(
    filterRecordsByDate(allCertifications, ["paes_datestarted", "paes_datecompleted"], period, year, month),
    { region, skillCategory, revenueStream },
  );

  const totalDemandVolume = sumBy(demandsFiltered, "paes_numberofseats");
  const totalSupplyAvailable = supplies.length;
  const readyReadinessRecords = readiness.filter(
    (record) => textValue(record.paes_readinessstatus).toLowerCase() === "ready",
  );
  const readyCandidates = new Set(
    readyReadinessRecords.map((record) => lookupId(record, "paes_linkedsupply")).filter(Boolean),
  ).size;
  const monthlyDeployments = countByMonth(deployments, "paes_deploymentdate");

  const placementRevenue = sumBy(deployments, "paes_placementrevenue");
  const paymentStreams = {
    deployment: payments
      .filter((record) => textValue(record.paes_revenuestream).toLowerCase() === "deployment")
      .reduce((total, record) => total + numberValue(record.paes_amount), 0),
    learning: payments
      .filter((record) => textValue(record.paes_revenuestream).toLowerCase() === "learning")
      .reduce((total, record) => total + numberValue(record.paes_amount), 0),
    events: payments
      .filter((record) => textValue(record.paes_revenuestream).toLowerCase() === "event")
      .reduce((total, record) => total + numberValue(record.paes_amount), 0),
    certification: payments
      .filter((record) => textValue(record.paes_revenuestream).toLowerCase() === "certification")
      .reduce((total, record) => total + numberValue(record.paes_amount), 0),
  };
  const totalEventRevenue = paymentStreams.events || sumBy(events, "paes_totalrevenue");
  const totalCertificationRevenue = paymentStreams.certification || sumBy(certifications, "paes_revenue");
  const totalRevenue = placementRevenue + paymentStreams.learning + totalEventRevenue + totalCertificationRevenue;

  const demandBySkillCategory = groupCounts(demandsFiltered, "paes_skillcategory", "paes_numberofseats");
  const supplyBySkillCategory = groupCounts(supplies, "paes_skillcategory");
  const supplyBySkillMap = new Map(supplyBySkillCategory.map((item) => [item.label, item.value]));
  const gapBySkillCategory = demandBySkillCategory.map((item) => ({
    label: item.label,
    value: item.value - (supplyBySkillMap.get(item.label) ?? 0),
  }));

  const readinessBuckets = [
    { label: "Not Ready", value: readiness.filter((record) => textValue(record.paes_readinessstatus).toLowerCase() === "not ready").length },
    { label: "In Progress", value: readiness.filter((record) => textValue(record.paes_readinessstatus).toLowerCase() === "in progress").length },
    { label: "Ready", value: readyCandidates },
  ];

  const readinessGaps = [
    {
      label: "Qualification gaps",
      value: readiness.filter((record) =>
        textValue(record.paes_qualificationstatus).toLowerCase().includes("not"),
      ).length,
    },
    {
      label: "Certification gaps",
      value: readiness.filter((record) =>
        textValue(record.paes_certificationstatus).toLowerCase().includes("not"),
      ).length,
    },
    {
      label: "Training in progress",
      value: readiness.filter((record) =>
        textValue(record.paes_trainingstatus).toLowerCase().includes("progress"),
      ).length,
    },
  ];

  const registrationsCount = eventRegistrations.length > 0 ? eventRegistrations.length : sumBy(events, "paes_totalregistrations");
  const attendanceCount =
    eventRegistrations.length > 0
      ? eventRegistrations.filter((record) =>
          textValue(record.paes_attendancestatus).toLowerCase().includes("attend"),
        ).length
      : sumBy(events, "paes_totalattendance");
  const attendanceRate =
    registrationsCount > 0 ? (attendanceCount / registrationsCount) * 100 : null;
  const revenuePerEvent = events.length > 0 ? totalEventRevenue / events.length : null;

  const certificationCompleted = certifications.filter((record) =>
    textValue(record.paes_status).toLowerCase().includes("completed"),
  ).length;
  const certificationPipeline = certifications.length;
  const certificationGapBySkill = groupCounts(
    certifications.filter((record) => !textValue(record.paes_status).toLowerCase().includes("completed")),
    "paes_skillcategory",
  );

  const repeatDemandClients = (() => {
    const grouped = groupCounts(demandsFiltered, "paes_clientname");
    const repeating = grouped.filter((item) => item.value > 1).reduce((total, item) => total + item.value, 0);
    return demandsFiltered.length > 0 ? (repeating / demandsFiltered.length) * 100 : null;
  })();
  const readyPercent = totalSupplyAvailable > 0 ? (readyCandidates / totalSupplyAvailable) * 100 : null;
  const readinessLeadTimes = supplies
    .map((record) => daysFromNow(textValue(record.paes_expectedreadinessdate)))
    .filter((value): value is number => value !== null);
  const timeToReadiness = average(readinessLeadTimes);
  const certificationMetPct = certificationPipeline > 0 ? (certificationCompleted / certificationPipeline) * 100 : null;
  const placementRate = totalSupplyAvailable > 0 ? (deployments.length / totalSupplyAvailable) * 100 : null;
  const revenuePerCandidate = totalSupplyAvailable > 0 ? totalRevenue / totalSupplyAvailable : null;
  const deploymentLagDays = deployments
    .map((deployment) => {
      const readinessId = lookupId(deployment, "paes_linkedreadiness");
      const readinessRecord = readiness.find(
        (record) => textValue(record[getModule("readiness").primaryIdField]) === readinessId,
      );
      if (!readinessRecord) {
        return null;
      }

      return daysBetween(
        textValue(readinessRecord.paes_dateupdated),
        textValue(deployment.paes_deploymentdate),
      );
    })
    .filter((value): value is number => value !== null);
  const timeToDeployment = average(deploymentLagDays);

  const suppliedDemandIds = new Set(
    supplies.map((record) => lookupId(record, "paes_linkeddemand")).filter(Boolean),
  );
  const readySupplyIds = new Set(
    readyReadinessRecords.map((record) => lookupId(record, "paes_linkedsupply")).filter(Boolean),
  );
  const deployedSupplyIds = new Set(
    deployments.map((record) => lookupId(record, "paes_linkedsupply")).filter(Boolean),
  );
  const demandWithoutSupplyCount = demandsFiltered.filter(
    (record) => !suppliedDemandIds.has(textValue(record[demandModule.primaryIdField])),
  ).length;
  const supplyNotReadyCount = supplies.filter(
    (record) => !readySupplyIds.has(textValue(record[supplyModule.primaryIdField])),
  ).length;
  const readyButNotDeployedCount = Array.from(readySupplyIds).filter(
    (supplyId) => !deployedSupplyIds.has(supplyId),
  ).length;

  const bottlenecks = [
    {
      label: "Demand without supply",
      value: demandWithoutSupplyCount.toString(),
      helper: "Demand records that are not yet linked to any supply records.",
    },
    {
      label: "Supply not ready",
      value: supplyNotReadyCount.toString(),
      helper: "Supply records without a linked readiness record marked Ready.",
    },
    {
      label: "Ready but not deployed",
      value: readyButNotDeployedCount.toString(),
      helper: "Ready supply records that have not yet converted into deployment.",
    },
  ];

  const executiveStats = [
    { label: "Demand Volume (Seats)", value: formatNumber(totalDemandVolume) },
    { label: "Supply Available", value: formatNumber(totalSupplyAvailable) },
    { label: "Ready Candidates", value: formatNumber(readyCandidates) },
    { label: "Deployments This Month", value: formatNumber(monthlyDeployments) },
    { label: "Total Revenue", value: formatCurrency(totalRevenue) },
  ];

  return (
    <div className="page dashboard-page">
      <div className="page__header">
        <div>
          <span className="eyebrow">Executive Summary</span>
          <h1>Dashboard</h1>
          <p>
            Real-time management visibility across the full PAES pipeline:
            Demand to Supply to Readiness to Deployment to Revenue.
          </p>
        </div>
      </div>

      <Card
        title="Review Filters"
        subtitle="Use one control panel for weekly, monthly, regional, and skill-based management review."
      >
        {optionalWarnings.length > 0 ? (
          <p className="page__caption">{optionalWarnings.join(" ")}</p>
        ) : null}
        <div className="dashboard-filters">
          <label className="form-field">
            <span>Period</span>
            <select className="input" value={period} onChange={(event) => setPeriod(event.target.value as PeriodFilter)}>
              <option value="all">All time</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </label>
          <label className="form-field">
            <span>Year</span>
            <select className="input" value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="">All years</option>
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Month</span>
            <select className="input" value={month} onChange={(event) => setMonth(event.target.value)}>
              <option value="">All months</option>
              {[
                ["01", "January"],
                ["02", "February"],
                ["03", "March"],
                ["04", "April"],
                ["05", "May"],
                ["06", "June"],
                ["07", "July"],
                ["08", "August"],
                ["09", "September"],
                ["10", "October"],
                ["11", "November"],
                ["12", "December"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Region</span>
            <select className="input" value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="">All regions</option>
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Skill Category</span>
            <select className="input" value={skillCategory} onChange={(event) => setSkillCategory(event.target.value)}>
              <option value="">All skills</option>
              {skillOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Revenue Source</span>
            <select className="input" value={revenueStream} onChange={(event) => setRevenueStream(event.target.value)}>
              <option value="">All sources</option>
              <option value="Deployment">Deployment</option>
              <option value="Learning">Learning</option>
              <option value="Event">Event</option>
              <option value="Certification">Certification</option>
            </select>
          </label>
        </div>
      </Card>

      <section className="dashboard-kpis">
        {executiveStats.map((stat) => (
          <Card key={stat.label} className="dashboard-kpi-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </Card>
        ))}
      </section>

      <section className="dashboard-section-grid">
        <Card title="Demand vs Supply" subtitle="Compare requirement pressure with available pipeline by skill category.">
          <div className="dashboard-two-col">
            <RankedList title="Demand by Skill Category" items={demandBySkillCategory.slice(0, 6)} />
            <RankedList title="Supply by Skill Category" items={supplyBySkillCategory.slice(0, 6)} />
          </div>
          <RankedList title="Gap (Demand vs Supply)" items={gapBySkillCategory.slice(0, 6)} />
        </Card>

        <Card title="Readiness Status" subtitle="Track readiness mix and the biggest blockers slowing deployment conversion.">
          <MetricList
            items={readinessBuckets.map((item) => ({
              label: item.label,
              value: item.value.toString(),
            }))}
          />
          <RankedList title="Key Readiness Gaps" items={readinessGaps} />
        </Card>
      </section>

      <section className="dashboard-section-grid">
        <Card title="Deployment & Revenue" subtitle="Track placement throughput and commercial performance across revenue sources.">
          <MetricList
            items={[
              { label: "Placements", value: formatNumber(deployments.length) },
              {
                label: "Revenue per Placement",
                value: formatCurrency(deployments.length > 0 ? placementRevenue / deployments.length : null),
              },
              { label: "Deployment Revenue", value: formatCurrency(placementRevenue), helper: "Placement-driven revenue" },
              { label: "Learning Revenue", value: formatCurrency(paymentStreams.learning), helper: "Learning and training income" },
              { label: "Event Revenue", value: formatCurrency(totalEventRevenue), helper: "Commercial return from events" },
              { label: "Certification Revenue", value: formatCurrency(totalCertificationRevenue), helper: "Certification-related income" },
            ]}
          />
        </Card>

        <Card title="Events Performance" subtitle="Event demand generation and monetization performance in one view.">
          <MetricList
            items={[
              { label: "Number of Events", value: formatNumber(events.length) },
              { label: "Registrations", value: formatNumber(registrationsCount) },
              { label: "Attendance Rate", value: formatPercent(attendanceRate) },
              { label: "Revenue per Event", value: formatCurrency(revenuePerEvent) },
              { label: "Total Event Revenue", value: formatCurrency(totalEventRevenue) },
            ]}
          />
        </Card>
      </section>

      <section className="dashboard-section-grid">
        <Card title="Certification Overview" subtitle="Monitor certification throughput, value creation, and gaps by skill area.">
          <MetricList
            items={[
              { label: "Candidates in Pipeline", value: formatNumber(certificationPipeline) },
              { label: "Completed Certifications", value: formatNumber(certificationCompleted) },
              { label: "Certification Revenue", value: formatCurrency(totalCertificationRevenue) },
              { label: "Certification Completion %", value: formatPercent(certificationMetPct) },
            ]}
          />
          <RankedList title="Certification Gap by Role / Skill" items={certificationGapBySkill.slice(0, 6)} />
        </Card>

        <Card title="Pipeline Bottlenecks" subtitle="Quickly spot where the operating chain is stalling.">
          <MetricList items={bottlenecks} />
        </Card>
      </section>

      <section>
        <Card title="Mandatory Metrics" subtitle="Core weekly operating measures for management review.">
          <MetricList
            items={[
              {
                label: "Demand Volume",
                value: formatNumber(totalDemandVolume),
                helper: "Total seats represented in current demand records",
              },
              {
                label: "Repeat Demand",
                value: formatPercent(repeatDemandClients),
                helper: "Share of demand coming from repeat clients",
              },
              {
                label: "Total Candidates",
                value: formatNumber(totalSupplyAvailable),
                helper: "Supply records currently available in the pipeline",
              },
              {
                label: "Ready for Deployment",
                value: formatPercent(readyPercent),
                helper: "Share of supply already marked ready",
              },
              {
                label: "Average Time to Readiness",
                value: timeToReadiness !== null ? `${timeToReadiness.toFixed(1)} days` : "N/A",
                helper: "Based on expected readiness dates recorded in supply",
              },
              {
                label: "Meeting Certification Requirements",
                value: formatPercent(certificationMetPct),
                helper: "Completed certifications as a share of the active certification pipeline",
              },
              {
                label: "Certification Pipeline",
                value: formatNumber(certificationPipeline),
                helper: "Candidates currently moving through certification",
              },
              {
                label: "Certification Revenue",
                value: formatCurrency(totalCertificationRevenue),
              },
              {
                label: "Placement Rate",
                value: formatPercent(placementRate),
                helper: "Deployments as a share of total supply",
              },
              {
                label: "Average Time to Deployment",
                value: timeToDeployment !== null ? `${timeToDeployment.toFixed(1)} days` : "N/A",
                helper: "Average days from readiness update to deployment date.",
              },
              { label: "Total Revenue", value: formatCurrency(totalRevenue) },
              {
                label: "Revenue per Candidate",
                value: formatCurrency(revenuePerCandidate),
                helper: "Average revenue against total supply records",
              },
              {
                label: "Revenue Mix",
                value: formatCurrency(totalRevenue),
                helper: (
                  <div className="metric-breakdown">
                    <span>Deployment {formatCurrency(placementRevenue)}</span>
                    <span>Learning {formatCurrency(paymentStreams.learning)}</span>
                    <span>Events {formatCurrency(totalEventRevenue)}</span>
                    <span>Certification {formatCurrency(totalCertificationRevenue)}</span>
                  </div>
                ),
              },
              { label: "Events Held", value: formatNumber(events.length) },
              { label: "Attendance Rate", value: formatPercent(attendanceRate) },
              { label: "Revenue per Event", value: formatCurrency(revenuePerEvent) },
            ]}
          />
        </Card>
      </section>
    </div>
  );
}
