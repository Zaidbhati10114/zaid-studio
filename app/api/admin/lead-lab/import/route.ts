import { NextRequest } from "next/server";
import {
    startImportJob,
    completeImportJob,
    failImportJob,
} from "@/lib/lead-search/import-job";
import { importCampaignBusinesses, ImportEvent } from "@/lib/lead-search/importer";

function sendLog(
    controller: ReadableStreamDefaultController,
    encoder: TextEncoder,
    type: "info" | "success" | "warning" | "error",
    message: string,
) {
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type,
                message,
            })}\n\n`,
        ),
    );
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            let jobId: string | undefined;
            const log = (
                type: "info" | "success" | "warning" | "error",
                message: string,
            ) => sendLog(controller, encoder, type, message);

            try {
                log("info", "Initializing campaign...");

                const query = `${body.niche} in ${body.city}`;

                jobId = await startImportJob(
                    body.campaignId,
                    "google",
                    query,
                );
                log(
                    "info",
                    `Searching ${body.niche} in ${body.city}...`,
                );

                const report = await importCampaignBusinesses(
                    body,
                    (event: ImportEvent) => {
                        switch (event.type) {
                            case "new":
                                log("success", `New: ${event.business}`);
                                break;

                            case "updated":
                                log("info", `Updated: ${event.business}`);
                                break;

                            case "linked":
                                log(
                                    "success",
                                    `Linked to campaign: ${event.business}`,
                                );
                                break;

                            case "skipped":
                                log(
                                    "warning",
                                    `Already linked: ${event.business}`,
                                );
                                break;
                        }
                    },
                );

                if (!jobId) {
                    throw new Error("Import job was not created.");
                }


                await completeImportJob({
                    jobId,

                    found: report.found,
                    newBusinesses: report.newBusinesses,
                    updatedBusinesses: report.updatedBusinesses,
                    linkedBusinesses: report.linkedBusinesses,
                    skippedBusinesses: report.skippedBusinesses,

                    apiRequests: 1 + body.maxResults,
                });

                log("success", "Import completed.");

                log(
                    "success",
                    `Found ${report.found} businesses`,
                );

                log(
                    "success",
                    `${report.newBusinesses} new businesses`,
                );

                log(
                    "success",
                    `${report.updatedBusinesses} refreshed`,
                );

                log(
                    "success",
                    `${report.skippedBusinesses} skipped`,
                );
            } catch (error) {
                if (jobId) {
                    await failImportJob(
                        jobId,
                        error instanceof Error ? error.message : "Import failed.",
                    );
                }
                log(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Import failed.",
                );
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}