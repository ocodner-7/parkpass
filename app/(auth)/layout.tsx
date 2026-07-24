import { PageTransition } from "@/app/components/ui/PageTransition";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
};