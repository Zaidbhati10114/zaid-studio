"use client";

import { useEffect, useRef, useState } from "react";

import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: string | null;
}

export function PdfViewer({ file }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [numPages, setNumPages] = useState(0);

  const [pageWidth, setPageWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;

    const resize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;

      setPageWidth(Math.max(width - 48, 300));
    };

    resize();

    const observer = new ResizeObserver(resize);

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  if (!file) {
    return null;
  }

  return (
    <div ref={containerRef} className="h-full overflow-auto bg-muted">
      <div className="flex flex-col items-center py-6">
        <Document
          file={file}
          loading="Loading PDF..."
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {Array.from({ length: numPages }, (_, index) => (
            <div
              key={index}
              className="mb-6 overflow-hidden rounded-lg border bg-white shadow"
            >
              <Page
                pageNumber={index + 1}
                width={pageWidth}
                renderAnnotationLayer
                renderTextLayer
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
