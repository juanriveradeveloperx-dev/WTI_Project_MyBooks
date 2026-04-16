import { useEffect, useRef } from "react";

function BookPreview({ volumeId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!volumeId || !containerRef.current) return;

    const renderViewer = () => {
      if (!window.GBS_insertEmbeddedViewer || !containerRef.current) {
        console.error("Google preview library not loaded");
        return;
      }

      containerRef.current.innerHTML = "";

      const previousWrite = document.write;
      document.write = (html) => {
        if (containerRef.current) {
          containerRef.current.innerHTML += html;
        }
      };

      try {
        window.GBS_insertEmbeddedViewer(volumeId, 800, 600);
      } catch (error) {
        console.error("Could not render embedded viewer", error);
      } finally {
        document.write = previousWrite;
      }
    };

    const scriptSrc = "https://books.google.com/books/previewlib.js";
    let script = document.querySelector(`script[src="${scriptSrc}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.onload = renderViewer;
      script.onerror = () => {
        console.error("Failed to load Google preview script");
      };
      document.body.appendChild(script);
    } else if (window.GBS_insertEmbeddedViewer) {
      renderViewer();
    } else {
      script.addEventListener("load", renderViewer, { once: true });
    }

    return () => {
      if (script) {
        script.removeEventListener("load", renderViewer);
      }
    };
  }, [volumeId]);

  return <div ref={containerRef} />;
}

export default BookPreview;