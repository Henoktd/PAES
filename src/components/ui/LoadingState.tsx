export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="state-card">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
