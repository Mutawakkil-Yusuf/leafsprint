import { AppChrome } from "@/components/AppChrome";

export default function TabbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppChrome>{children}</AppChrome>;
}
