"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";

import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";

export function useProposalPdf() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const [generating, setGenerating] = useState(false);

    const [blob, setBlob] = useState<Blob | null>(null);

    // Keep track of the current URL without causing re-renders
    const pdfUrlRef = useRef<string | null>(null);

    const generatePdf = useCallback(
        async (document: ReactElement) => {
            try {
                setGenerating(true);

                // Revoke previous blob URL
                if (pdfUrlRef.current) {
                    URL.revokeObjectURL(pdfUrlRef.current);
                }

                const nextBlob = await pdf(
                    document as ReactElement<DocumentProps>
                ).toBlob();

                const url = URL.createObjectURL(nextBlob);

                pdfUrlRef.current = url;

                setBlob(nextBlob);
                setPdfUrl(url);
            } finally {
                setGenerating(false);
            }
        },
        [] // ✅ Stable forever
    );

    const downloadPdf = useCallback(
        (filename = "proposal.pdf") => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = filename;

            a.click();

            URL.revokeObjectURL(url);
        },
        [blob]
    );

    useEffect(() => {
        return () => {
            if (pdfUrlRef.current) {
                URL.revokeObjectURL(pdfUrlRef.current);
            }
        };
    }, []);

    return {
        pdfUrl,
        blob,
        generating,
        generatePdf,
        downloadPdf,
    };
}