import { useEffect, useRef, useState } from "react";
import "../styles/PreviewCard.css";

const GOOGLE_PREVIEW_SRC = "https://books.google.com/books/previewlib.js";

function BookPreview({ volumeId }) {
  const containerRef = useRef(null);
  const [previewError, setPreviewError] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    if (!volumeId || !containerRef.current) return;

    let cancelled = false;

    const renderViewer = () => {
      if (cancelled || !containerRef.current) return;

      if (typeof window.GBS_insertEmbeddedViewer !== "function") {
        console.error("Google preview library not loaded");
        setPreviewError(true);
        setLoadingPreview(false);
        return;
      }

      setPreviewError(false);
      setLoadingPreview(true);
      containerRef.current.innerHTML = "";

      const previousWrite = document.write;
      document.write = (html) => {
        if (containerRef.current && !cancelled) {
          containerRef.current.innerHTML += html;
        }
      };

      try {
        window.GBS_insertEmbeddedViewer(volumeId, 800, 600);

        setTimeout(() => {
          if (cancelled || !containerRef.current) return;

          const hasContent = containerRef.current.innerHTML.trim().length > 0;
          if (!hasContent) {
            setPreviewError(true);
          }

          setLoadingPreview(false);
        }, 1200);
      } catch (error) {
        console.error("Could not render embedded viewer", error);
        setPreviewError(true);
        setLoadingPreview(false);
      } finally {
        document.write = previousWrite;
      }
    };

    const existingScript = document.querySelector(
      `script[src="${GOOGLE_PREVIEW_SRC}"]`
    );

    if (existingScript) {
      if (typeof window.GBS_insertEmbeddedViewer === "function") {
        renderViewer();
      } else {
        existingScript.addEventListener("load", renderViewer, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = GOOGLE_PREVIEW_SRC;
      script.async = true;
      script.onload = renderViewer;
      script.onerror = () => {
        console.error("Failed to load Google preview script");
        setPreviewError(true);
        setLoadingPreview(false);
      };
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [volumeId]);

  return (
    <div className="embedded-preview-wrapper">
      {loadingPreview && (
        <div className="embedded-preview-loading">
          Loading preview...
        </div>
      )}

      <div
        ref={containerRef}
        className={`embedded-preview-container ${
          loadingPreview ? "hidden-preview" : ""
        }`}
      />

      {previewError && (
        <div className="embedded-preview-error">
          Preview is not available for this book.
        </div>
      )}
    </div>
  );
}

export default BookPreview;