import { useMsal } from "@azure/msal-react";
import { LogOut, Menu } from "lucide-react";
import { useAccessControl } from "../../features/admin/AccessControlContext";
import { roleDefinitions } from "../../features/admin/accessModel";
import { Button } from "../ui/Button";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { accounts, instance } = useMsal();
  const { currentRole } = useAccessControl();
  const account = accounts[0];

  return (
    <header className="topbar">
      <button type="button" className="topbar__menu" onClick={onMenuToggle} aria-label="Open navigation">
        <Menu size={18} />
      </button>

      <div className="topbar__spacer" aria-hidden="true" />

      <div className="topbar__actions">
        <div className="topbar__user">
          <strong>{account?.name ?? "Signed-in user"}</strong>
          <span>{account?.username ?? "Organization account"}</span>
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
