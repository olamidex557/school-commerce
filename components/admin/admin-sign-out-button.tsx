import { LogOut } from "lucide-react";
import { signOutAdmin } from "@/app/admin/(protected)/actions";

export function AdminSignOutButton() {
  return (
    <form action={signOutAdmin}>
      <button
        className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
        type="submit"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </form>
  );
}
