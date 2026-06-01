import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: "Best Colleges in USA for MS in Computer Science",
        });

        return NextResponse.json({
            success: true,
            result: text,
        });
    } catch (error) {
        console.error("Groq Error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}