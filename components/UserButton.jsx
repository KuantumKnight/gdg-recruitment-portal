"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function getInitials(user) {
  const name = user?.name?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }
  return user?.email?.charAt(0)?.toUpperCase() || "U";
}

export default function UserButton({ user }) {
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = () => router.push("/auth/signout");
  const displayName = user.name?.trim() || "Candidate";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex max-w-[230px] items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-left text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7fa70]"
          aria-label={`Open account menu for ${displayName}`}
        >
          <Avatar className="h-8 w-8 border border-white/10">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="bg-[#d7fa70] text-xs font-bold text-[#101110]">{getInitials(user)}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate font-medium">{displayName}</span>
            <span className="block truncate text-[11px] text-gray-400">{user.email}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-[#30332c] bg-[#171914] text-[#f3f1e9]">
        <DropdownMenuLabel className="space-y-1">
          <span className="block truncate">{displayName}</span>
          <span className="block truncate text-xs font-normal text-[#a7aa9e]">{user.email}</span>
        </DropdownMenuLabel>
        {user.role === "admin" ? (
          <>
            <DropdownMenuSeparator className="bg-[#30332c]" />
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#d7fa70]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Administrator access
            </div>
          </>
        ) : null}
        <DropdownMenuSeparator className="bg-[#30332c]" />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="cursor-pointer gap-2 focus:bg-[#24271f] focus:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}