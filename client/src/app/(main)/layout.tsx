import { SiteShell } from "@/components/site/Shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <SiteShell>{children}</SiteShell>;
}
