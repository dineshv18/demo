import { redirect } from "next/navigation";

// Internal Transfer is temporarily disabled — route redirects to the
// dashboard until the feature is turned back on. Swap this back to
// rendering <TransferPage /> to re-enable.
export default function TransferRoute() {
  redirect("/dashboard");
}
