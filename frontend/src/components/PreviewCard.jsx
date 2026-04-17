import { useEffect, useRef, useState } from "react";
import "../styles/PreviewCard.css";

// External script exposed by Google to render the embedded book preview.
const GOOGLE_PREVIEW_SRC = "https://books.google.com/books/previewlib.js";

function BookPreview({ volumeId }) {
  // Component responsible for rendering the embedded Google Books preview.
  // Receives: volumeId of the selected book.
  // Sends: no data to parent components.
  // Purpose: manage script loading, viewer rendering, loading state, and fallback UI.
  const containerRef = useRef(null);
  const [previewError, setPreviewError] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    // Trigger: runs whenever volumeId changes.
    // Purpose: rebuild the embedded preview for the newly selected book.
    if (!volumeId || !containerRef.current) return;

    let cancelled = false;

    const renderViewer = () => {
      // Inserts the embedded viewer into the current container.
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

      // Google Books internally uses document.write, so this temporarily redirects
      // that output into our preview container.
      const previousWrite = document.write;
      document.write = (html) => {
        if (containerRef.current && !cancelled) {
          containerRef.current.innerHTML += html;
        }
      };

      try {
        window.GBS_insertEmbeddedViewer(volumeId, 800, 600);

        // Short delay used to verify that the viewer actually injected visible content.
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
      // If the script already exists, render immediately or wait until it finishes loading.
      if (typeof window.GBS_insertEmbeddedViewer === "function") {
        renderViewer();
      } else {
        existingScript.addEventListener("load", renderViewer, { once: true });
      }
    } else {
      // If the script does not exist yet, inject it into the document once.
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
      // Prevent state updates if the component unmounts while the preview is still loading.
      cancelled = true;
    };
  }, [volumeId]);

  return (
    <div className="embedded-preview-wrapper">
      {loadingPreview && (
        <div className="embedded-preview-loading">
          <div className="preview-spinner"></div>
          <span>Loading preview...</span>
        </div>
      )}

      <div
        ref={containerRef}
        className={`embedded-preview-container ${
          loadingPreview ? "hidden-preview" : ""
        }`}
      />

      {previewError && !loadingPreview && (
        <div className="embedded-preview-error">
          <div className="error-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              <path d="m9.5 9.5 5 5"/>
              <path d="m14.5 9.5-5 5"/>
            </svg>
          </div>
          <p className="error-message">
            Preview is not available for this book
          </p>
        </div>
      )}
    </div>
  );
}

export default BookPreview;
