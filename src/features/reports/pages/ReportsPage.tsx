const REPORT_EMBED_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiMTY2NTk0NjktNDZmNC00MTE4LTg0OTEtNDIwMTBmYzgwNTUyIiwidCI6IjM0MjdlMmFkLWJhNmQtNDEwMC1hZWM0LWYzZjE4ZTRiMzJkMSJ9";

export function ReportsPage() {
  return (
    <div className="reports-page">
      <div className="report-embed-shell report-embed-shell--full">
        <iframe
          title="PAES Operational Reporting"
          className="report-embed-frame"
          src={REPORT_EMBED_URL}
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
