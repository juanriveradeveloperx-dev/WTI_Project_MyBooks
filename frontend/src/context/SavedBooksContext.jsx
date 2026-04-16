import { createContext, useContext, useState } from "react";

const SavedBooksContext = createContext(null);

export function SavedBooksProvider({ children }) {
  const [savedBooks, setSavedBooks] = useState([]);
  const [loadingSavedBooks, setLoadingSavedBooks] = useState(false);
  const [hasLoadedSavedBooks, setHasLoadedSavedBooks] = useState(false);

  const loadSavedBooks = async () => {
    if (hasLoadedSavedBooks) return;

    try {
      setLoadingSavedBooks(true);

      const res = await fetch("http://localhost:8000/books/userbooks");
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
    try {
      setLoadingSavedBooks(true);

      const res = await fetch("http://localhost:8000/books/userbooks");
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
    setSavedBooks((prev) => {
      const alreadyExists = prev.some(
        (savedBook) => savedBook.google_volume_id === book.google_volume_id
      );

      if (alreadyExists) return prev;

      return [book, ...prev];
    });
  };

  const removeSavedBook = (bookId) => {
    setSavedBooks((prev) => prev.filter((book) => book.id !== bookId));
  };

  const updateSavedBookStatus = (bookId, newStatus) => {
    setSavedBooks((prev) =>
      prev.map((book) =>
        book.id === bookId ? { ...book, status: newStatus } : book
      )
    );
  };

  const isBookSaved = (googleVolumeId) => {
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
  const context = useContext(SavedBooksContext);

  if (!context) {
    throw new Error("useSavedBooks must be used inside a SavedBooksProvider");
  }

  return context;
}