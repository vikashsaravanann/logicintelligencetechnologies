"use client";

import { Suspense } from "react";
import RouteTransition from "./route-transition";

export default function RouteTransitionHost() {
  return (
    <Suspense fallback={null}>
      <RouteTransition />
    </Suspense>
  );
}
