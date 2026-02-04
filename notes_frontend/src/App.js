import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "./api/notesApi";

/**
 * @typedef {{id:number,title:string,content:string,created_at:string,updated_at:string}} Note
 */

function normalizeError(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  return err.message || "Unknown error";
}

// PUBLIC_INTERFACE
function App() {
  /** Main Simple Notes App: list notes (left) + editor (right). */
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [editorMode, setEditorMode] = useState("empty"); // "empty" | "new" | "existing"
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorError, setEditorError] = useState("");

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  const editorNote = editorMode === "existing" ? selectedNote : null;

  const refreshNotes = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await listNotes();
      setNotes(Array.isArray(data) ? data : []);
      // If current selection no longer exists, clear it.
      setSelectedId((prev) => {
        if (prev == null) return prev;
        return data.some((n) => n.id === prev) ? prev : null;
      });
    } catch (err) {
      setListError(normalizeError(err));
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  useEffect(() => {
    // Keep editor mode consistent with selection when not drafting a new note.
    if (editorMode === "new") return;

    if (selectedId == null) setEditorMode("empty");
    else setEditorMode("existing");
  }, [selectedId, editorMode]);

  const handleSelect = useCallback((id) => {
    setEditorError("");
    setSelectedId(id);
  }, []);

  const handleCreateNew = useCallback(() => {
    setEditorError("");
    setSelectedId(null);
    setEditorMode("new");
  }, []);

  const handleCancelNew = useCallback(() => {
    setEditorError("");
    setEditorMode(selectedId == null ? "empty" : "existing");
  }, [selectedId]);

  const handleSaveNew = useCallback(
    async (payload) => {
      setEditorBusy(true);
      setEditorError("");
      try {
        const created = await createNote(payload);
        // Refresh list to preserve backend ordering (updated_at desc).
        await refreshNotes();
        setSelectedId(created.id);
        setEditorMode("existing");
      } catch (err) {
        setEditorError(normalizeError(err));
      } finally {
        setEditorBusy(false);
      }
    },
    [refreshNotes]
  );

  const handleSaveUpdate = useCallback(
    async (noteId, payload) => {
      setEditorBusy(true);
      setEditorError("");
      try {
        await updateNote(noteId, payload);
        await refreshNotes();
        setSelectedId(noteId);
        setEditorMode("existing");
      } catch (err) {
        setEditorError(normalizeError(err));
      } finally {
        setEditorBusy(false);
      }
    },
    [refreshNotes]
  );

  const handleDelete = useCallback(
    async (note) => {
      const ok = window.confirm(`Delete "${note.title}"? This cannot be undone.`);
      if (!ok) return;

      setEditorBusy(true);
      setEditorError("");
      setListError("");

      try {
        await deleteNote(note.id);
        await refreshNotes();

        setSelectedId((prev) => (prev === note.id ? null : prev));
        setEditorMode("empty");
      } catch (err) {
        const msg = normalizeError(err);
        // Show error near editor and list for visibility.
        setEditorError(msg);
        setListError(msg);
      } finally {
        setEditorBusy(false);
      }
    },
    [refreshNotes]
  );

  return (
    <div className="appRoot">
      <NotesList
        notes={notes}
        selectedId={selectedId}
        isLoading={listLoading}
        error={listError}
        onSelect={handleSelect}
        onCreateNew={handleCreateNew}
        onDelete={handleDelete}
      />

      <main className="mainPane">
        <NoteEditor
          mode={editorMode}
          note={editorNote}
          isBusy={editorBusy}
          error={editorError}
          onSaveNew={handleSaveNew}
          onSaveUpdate={handleSaveUpdate}
          onCancelNew={handleCancelNew}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

export default App;
