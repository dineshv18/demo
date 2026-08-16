import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconShield, IconMail, IconLogout, IconChevronDown } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

export default function ProfileMenu({ className }: { className?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted transition-colors"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate font-medium">{user?.name}</span>
        <IconChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-card shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-3 space-y-2 border-b">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
              <IconShield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium truncate">{user?.role}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
              <IconMail className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              <span className="font-medium truncate">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
          >
            <IconLogout className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
