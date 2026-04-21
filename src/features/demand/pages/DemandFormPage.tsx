import { EntityFormPage } from "../../generic/EntityFormPage";
import { demandModule } from "../../modules/moduleRegistry";

export function DemandFormPage() {
  return <EntityFormPage moduleConfig={demandModule} />;
}
