import { EntityListPage } from "../../generic/EntityListPage";
import { supplyModule } from "../../modules/moduleRegistry";

export function SupplyListPage() {
  return <EntityListPage moduleConfig={supplyModule} />;
}
