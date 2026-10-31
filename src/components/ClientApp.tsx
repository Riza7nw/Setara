"use client";

import dynamic from "next/dynamic";

// The experience reads window.location, matchMedia and localStorage on first render,
// so it is rendered on the client only.
const SetaraApp = dynamic(() => import("./SetaraApp"), { ssr: false });

export default function ClientApp() {
  return <SetaraApp />;
}
