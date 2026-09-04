import { supabaseAdmin } from "@/lib/supabase-server";

type Task =
    | "quote_generation"
    | "proposal_generation"
    | "fallback_generation"
    | "fallback_generation_secondary"
    | "standalone_test";

interface DeploymentCacheEntry {
    model: string;
    provider: string;
    expiresAt: number;
}

const CACHE_TTL = 60 * 1000; // 60 seconds

const cache = new Map<Task, DeploymentCacheEntry>();

/**
 * Returns the currently active deployment for a task.
 * Results are cached for 60 seconds.
 */
export async function getActiveDeployment(task: Task): Promise<{
    provider: string;
    model: string;
}> {
    const now = Date.now();

    const cached = cache.get(task);

    if (cached && cached.expiresAt > now) {
        return {
            provider: cached.provider,
            model: cached.model,
        };
    }

    const { data, error } = await supabaseAdmin
        .from("ai_deployments")
        .select("provider, model")
        .eq("task", task)
        .eq("is_active", true)
        .single();

    if (error || !data) {
        throw new Error(`No active deployment found for task "${task}".`);
    }

    cache.set(task, {
        provider: data.provider,
        model: data.model,
        expiresAt: now + CACHE_TTL,
    });

    return data;
}

/**
 * Convenience helper when only the model name is needed.
 */
export async function getActiveModel(task: Task): Promise<string> {
    const deployment = await getActiveDeployment(task);
    return deployment.model;
}

/**
 * Clears cached deployments.
 * Useful immediately after a successful deployment.
 */
export function clearModelRegistryCache(task?: Task) {
    if (task) {
        cache.delete(task);
        return;
    }

    cache.clear();
}