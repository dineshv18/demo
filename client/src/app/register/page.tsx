import { Suspense } from "react";
import ClientRegister from "@/components/pages/ClientRegister";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ClientRegister />
    </Suspense>
  );
}
