import { Suspense } from "react";
import WalletPage from "@/components/pages/WalletPage";

export default function WalletRoute() {
  return (
    <Suspense fallback={null}>
      <WalletPage />
    </Suspense>
  );
}
