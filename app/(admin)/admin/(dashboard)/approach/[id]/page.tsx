import { ApproachDetail } from "./approach-detail";

export default async function ApproachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ApproachDetail id={id} />;
}
