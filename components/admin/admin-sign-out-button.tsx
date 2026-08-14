import { LogOut } from "lucide-react";
import { signOutAdmin } from "@/app/admin/(protected)/actions";

export function AdminSignOutButton() {
  return (
    <form action={signOutAdmin}>
      <button
        className="button-secondary focus-ring text-sm"
        type="submit"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </form>
  );
}
