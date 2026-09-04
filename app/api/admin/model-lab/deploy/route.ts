import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { clearModelRegistryCache } from "@/lib/ai/model-registry";

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

function isAuthed(request: NextRequest) {
    return (
        request.cookies.get("admin_session")?.value ===
        process.env.ADMIN_PASSWORD
    );
}

export async function POST(request: NextRequest) {
    if (!isAuthed(request)) {
        return json({ error: "Unauthorized" }, 401);
    }

    const { provider, model, task } = await request.json();

    if (!provider || !model || !task) {
        return json(
            { error: "provider, model and task are required." },
            400
        );
    }

    try {
        // Archive the currently active deployment for this task.
        const { error: archiveError } = await supabaseAdmin
            .from("ai_deployments")
            .update({ is_active: false })
            .eq("task", task)
            .eq("is_active", true);

        if (archiveError) throw archiveError;

        // Create the new active deployment.
        const { data: deployment, error: deploymentError } = await supabaseAdmin
            .from("ai_deployments")
            .insert({
                provider,
                model,
                task,
                deployed_by: "admin",
                is_active: true,
            })
            .select()
            .single();

        if (deploymentError) throw deploymentError;

        // Mark ONLY the latest successful certification as deployed.
        const {
            data: latestCertification,
            error: historyLookupError,
        } = await supabaseAdmin
            .from("ai_certification_history")
            .select("id")
            .eq("provider", provider)
            .eq("model", model)
            .eq("task", task)
            .eq("connectivity_passed", true)
            .eq("json_passed", true)
            .eq("deployed", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (historyLookupError) throw historyLookupError;

        if (latestCertification) {
            const { error: updateError } = await supabaseAdmin
                .from("ai_certification_history")
                .update({
                    deployed: true,
                })
                .eq("id", latestCertification.id);

            if (updateError) throw updateError;
        }

        clearModelRegistryCache(task);

        return json({
            success: true,
            deployment,
        });
    } catch (error) {
        console.error({
            tag: "MODEL_DEPLOY_ERROR",
            provider,
            model,
            task,
            error,
        });

        return json(
            {
                error: "Deployment failed.",
            },
            500
        );
    }
}