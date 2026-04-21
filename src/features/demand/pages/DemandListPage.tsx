import { EntityListPage } from "../../generic/EntityListPage";
import { demandModule } from "../../modules/moduleRegistry";

export function DemandListPage() {
  return <EntityListPage moduleConfig={demandModule} />;
}
