import { useMsal } from "@azure/msal-react";
import { LogOut, Search } from "lucide-react";
import { useAccessControl } from "../../features/admin/AccessControlContext";
import { roleDefinitions } from "../../features/admin/accessModel";
import { Button } from "../ui/Button";

export function Topbar() {
  const { accounts, instance } = useMsal();
  const { currentRole } = useAccessControl();
  const account = accounts[0];

  return (
    <header className="topbar">
      <div className="topbar__search">
        <Search size={18} />
        <input placeholder="Search demand, partners, learners, and regions" aria-label="Search" />
      </div>

      <div className="topbar__actions">
        <div className="topbar__user">
          <strong>{account?.name ?? "Signed-in user"}</strong>
          <span>{account?.username ?? "Microsoft Entra ID"}</span>
          <span>{roleDefinitions[currentRole].label}</span>
        </div>
        <Button variant="ghost" onClick={() => void instance.logoutRedirect()}>
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </header>
  );
}
