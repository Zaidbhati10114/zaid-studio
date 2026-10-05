import { NextRequest, NextResponse } from "next/server";
import { selectApproachMessage } from "@/lib/lead-search/approach-message-repository";
import { getApproachLead } from "@/lib/lead-search/approach-lead-repository";
import { getApproachMessages } from "@/lib/lead-search/approach-message-repository";
import { deleteApproachLead } from "@/lib/lead-search/approach-lead-repository";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const lead = await getApproachLead(id);

        const messages = await getApproachMessages(id);

        return NextResponse.json({
            success: true,
            lead,
            messages,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load approach lead.",
            },
            { status: 500 },
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const messageId =
            typeof body.messageId === "string"
                ? body.messageId.trim()
                : "";

        if (!messageId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "messageId is required.",
                },
                { status: 400 },
            );
        }

        const message = await selectApproachMessage({
            approachLeadId: id,
            messageId,
        });

        return NextResponse.json({
            success: true,
            message,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to select approach message.";

        const status =
            message === "Approach message not found for this lead."
                ? 404
                : 500;

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        await deleteApproachLead(id);

        return NextResponse.json({
            success: true,
            id,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete approach lead.";

        const status =
            message === "Approach lead not found."
                ? 404
                : 500;

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status },
        );
    }
}