"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full border border-[var(--color-slate-700)]/40 hover:border-emerald-500/50 hover:bg-[var(--color-slate-900)] active:scale-[0.98] transition-all duration-150 group"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.image || undefined} alt={user.name} className="object-cover" />
            <AvatarFallback className="bg-[var(--color-slate-800)] text-[var(--color-slate-300)] text-xs font-mono">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--color-slate-900)]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-[var(--color-slate-950)] border border-[var(--color-slate-800)]/60"
        align="end"
        sideOffset={8}
      >
        {/* User info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-[var(--color-slate-200)]">{user.name}</p>
            <p className="text-xs font-mono text-[var(--color-slate-500)] truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--color-slate-800)]/40" />

        {/* Navigation items */}
        <Link href="/desk">
          <DropdownMenuItem className="cursor-pointer focus:bg-[var(--color-slate-900)] focus:text-[var(--color-slate-200)]">
            <LayoutDashboard className="mr-2 h-4 w-4 text-[var(--color-slate-500)]" />
            <span className="text-sm">Workspace</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem className="cursor-pointer focus:bg-[var(--color-slate-900)] focus:text-[var(--color-slate-200)]">
          <User className="mr-2 h-4 w-4 text-[var(--color-slate-500)]" />
          <span className="text-sm">Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer focus:bg-[var(--color-slate-900)] focus:text-[var(--color-slate-200)]">
          <Settings className="mr-2 h-4 w-4 text-[var(--color-slate-500)]" />
          <span className="text-sm">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--color-slate-800)]/40" />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-[var(--color-slate-400)] focus:bg-[var(--color-slate-900)] focus:text-[var(--color-slate-200)]"
        >
          <LogOut className="mr-2 h-4 w-4 text-[var(--color-slate-500)]" />
          <span className="text-sm">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
