import { EntityFormPage } from "../../generic/EntityFormPage";
import { supplyModule } from "../../modules/moduleRegistry";

export function SupplyFormPage() {
  return <EntityFormPage moduleConfig={supplyModule} />;
}
