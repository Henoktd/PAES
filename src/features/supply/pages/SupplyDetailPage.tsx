import { EntityDetailPage } from "../../generic/EntityDetailPage";
import { supplyModule } from "../../modules/moduleRegistry";

export function SupplyDetailPage() {
  return <EntityDetailPage moduleConfig={supplyModule} />;
}
