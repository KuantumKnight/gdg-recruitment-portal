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

  const displayName = user.name?.trim() || "Candidate";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex max-w-[250px] items-center gap-2 rounded-full border border-[#dadce0] bg-white py-1.5 pl-1.5 pr-3 text-left text-sm text-[#202124] transition-colors hover:bg-[#f8f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
          aria-label={`Open account menu for ${displayName}`}
        >
          <Avatar className="h-8 w-8 border border-[#e8eaed]">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="bg-[#e8f0fe] text-xs font-semibold text-[#1a73e8]">{getInitials(user)}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate font-medium">{displayName}</span>
            <span className="block truncate text-[11px] text-[#80868b]">{user.email}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#80868b]" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 border-[#dadce0] bg-white text-[#202124] shadow-lg">
        <DropdownMenuLabel className="space-y-1 px-3 py-2.5">
          <span className="block truncate text-sm font-medium">{displayName}</span>
          <span className="block truncate text-xs font-normal text-[#5f6368]">{user.email}</span>
        </DropdownMenuLabel>
        {user.role === "admin" ? (
          <>
            <DropdownMenuSeparator className="bg-[#e8eaed]" />
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#188038]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Administrator access
            </div>
          </>
        ) : null}
        <DropdownMenuSeparator className="bg-[#e8eaed]" />
        <DropdownMenuItem
          onSelect={() => router.push("/auth/signout")}
          className="cursor-pointer gap-2 px-3 py-2.5 focus:bg-[#f1f3f4] focus:text-[#202124]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
