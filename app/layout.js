import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SubmissionsProvider } from "@/components/SubmissionsProvider";
import { ORGANIZATION_NAME } from "@/lib/recruitment";
import "./globals.css";

export const metadata = {
  title: `${ORGANIZATION_NAME} on campus | Recruitment 2026`,
  description: "Find your people, build useful things, and grow with GDG on campus.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}><SubmissionsProvider>{children}<Toaster /></SubmissionsProvider></ThemeProvider></body></html>;
}
