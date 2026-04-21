import clsx from "clsx";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status.toLowerCase().includes("active") || status.toLowerCase().includes("approved")
      ? "success"
      : status.toLowerCase().includes("pending")
        ? "warning"
        : "neutral";

  return <span className={clsx("badge", `badge--${tone}`)}>{status}</span>;
}
