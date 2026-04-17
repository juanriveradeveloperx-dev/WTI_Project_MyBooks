import { createContext, useContext, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SavedBooksContext = createContext(null);

export function SavedBooksProvider({ children }) {
  // Global provider that keeps the user's saved library in memory.
  // Receives: children.
  // Sends: state + helper functions to load, refresh, add, remove, and update books.
  // Purpose: avoids duplicating saved-books logic in multiple pages.
  const [savedBooks, setSavedBooks] = useState([]);
  const [loadingSavedBooks, setLoadingSavedBooks] = useState(false);
  const [hasLoadedSavedBooks, setHasLoadedSavedBooks] = useState(false);

  const loadSavedBooks = async () => {
    // Initial library fetch.
    // Trigger: called by pages that need the saved library.
    // Purpose: avoid repeating the same request more than once in the same session.
    if (hasLoadedSavedBooks) return;

    try {
      setLoadingSavedBooks(true);

      const res = await fetch(`${API_BASE}/books/userbooks`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to load saved books", data);
        return;
      }

      setSavedBooks(data || []);
      setHasLoadedSavedBooks(true);
    } catch (error) {
      console.error("Error loading saved books", error);
    } finally {
      setLoadingSavedBooks(false);
    }
  };

  const refreshSavedBooks = async () => {
    // Manual refetch used after save actions so the UI stays in sync with the backend.
    try {
      setLoadingSavedBooks(true);

      const res = await fetch(`${API_BASE}/books/userbooks`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to refresh saved books", data);
        return;
      }

      setSavedBooks(data || []);
      setHasLoadedSavedBooks(true);
    } catch (error) {
      console.error("Error refreshing saved books", error);
    } finally {
      setLoadingSavedBooks(false);
    }
  };

  const addSavedBook = (book) => {
    // Inserts one book into local state without duplicating the same Google volume id.
    setSavedBooks((prev) => {
      const alreadyExists = prev.some(
        (savedBook) => savedBook.google_volume_id === book.google_volume_id
      );

      if (alreadyExists) return prev;

      return [book, ...prev];
    });
  };

  const removeSavedBook = (bookId) => {
    // Removes one book from local state after a successful DELETE request.
    setSavedBooks((prev) => prev.filter((book) => book.id !== bookId));
  };

  const updateSavedBookStatus = (bookId, newStatus) => {
    // This map updates only the matching book while leaving the rest unchanged.
    setSavedBooks((prev) =>
      prev.map((book) =>
        book.id === bookId ? { ...book, status: newStatus } : book
      )
    );
  };

  const isBookSaved = (googleVolumeId) => {
    // Returns true when the searched book already exists in the user's library.
    // Used by the search page to switch between Save and In Library buttons.
    return savedBooks.some(
      (book) => book.google_volume_id === googleVolumeId
    );
  };

  return (
    <SavedBooksContext.Provider
      value={{
        savedBooks,
        loadingSavedBooks,
        hasLoadedSavedBooks,
        loadSavedBooks,
        refreshSavedBooks,
        addSavedBook,
        removeSavedBook,
        updateSavedBookStatus,
        isBookSaved,
      }}
    >
      {children}
    </SavedBooksContext.Provider>
  );
}

export function useSavedBooks() {
  // Convenience hook that reads the saved-books context and validates usage.
  const context = useContext(SavedBooksContext);

  if (!context) {
    throw new Error("useSavedBooks must be used inside a SavedBooksProvider");
  }

  return context;
}
