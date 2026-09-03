import { Suspense } from "react";
import NewShowroomClient from "../components/NewShowroomClient";

export default function NewShowroomPage() {
  return (
    <Suspense fallback={<div>Loading showroom...</div>}>
      <NewShowroomClient />
    </Suspense>
  );
}
