import { upsertHeartbeat } from "@/lib/repositories/heartbeat";

export async function heartbeatService() {
    await upsertHeartbeat("github-actions");
}