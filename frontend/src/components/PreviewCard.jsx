import { useEffect, useRef } from "react";

function BookPreview({ volumeId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!volumeId || !containerRef.current) return;

    const renderViewer = () => {
      if (!window.GBS_insertEmbeddedViewer) {
        console.error("Google preview library not loaded");
        return;
      }

      containerRef.current.innerHTML = "";

      const placeholder = document.createElement("div");
      containerRef.current.appendChild(placeholder);

      const previousWrite = document.write;
      document.write = (html) => {
        placeholder.innerHTML += html;
      };

      try {
        window.GBS_insertEmbeddedViewer(volumeId, 800, 600);
      } catch (error) {
        console.error("Could not render embedded viewer", error);
      } finally {
        document.write = previousWrite;
      }
    };

    const existingScript = document.querySelector(
      'script[src="https://books.google.com/books/previewlib.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://books.google.com/books/previewlib.js";
      script.async = true;
      script.onload = renderViewer;
      document.body.appendChild(script);
    } else {
      renderViewer();
    }
  }, [volumeId]);

  return <div ref={containerRef} />;
}

export default BookPreview;