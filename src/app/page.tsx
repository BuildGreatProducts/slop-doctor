import { Suspense } from "react";
import { Home } from "@/components/features/Home";

export default function Page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
