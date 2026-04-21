import { EntityDetailPage } from "../../generic/EntityDetailPage";
import { demandModule } from "../../modules/moduleRegistry";

export function DemandDetailPage() {
  return <EntityDetailPage moduleConfig={demandModule} />;
}
