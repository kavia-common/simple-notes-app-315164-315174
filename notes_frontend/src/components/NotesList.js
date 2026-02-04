import React from "react";

/**
 * @typedef {{id:number,title:string,content:string,created_at:string,updated_at:string}} Note
 */

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedId,
  isLoading,
  error,
  onSelect,
  onCreateNew,
  onDelete,
}) {
  /** Left pane list of notes with actions. */
  return (
    <aside className="sidebar" aria-label="Notes list">
      <div className="sidebarHeader">
        <div>
          <div className="appTitle">Simple Notes</div>
          <div className="appSubtitle">Create, edit, and organize your notes</div>
        </div>

        <button className="btn btnPrimary" onClick={onCreateNew} type="button">
          New note
        </button>
      </div>

      {error ? (
        <div className="callout calloutError" role="alert">
          <div className="calloutTitle">Couldn’t load notes</div>
          <div className="calloutBody">{error}</div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="placeholder" aria-busy="true">
          Loading notes…
        </div>
      ) : null}

      {!isLoading && notes.length === 0 ? (
        <div className="placeholder">
          No notes yet. Create one to get started.
        </div>
      ) : null}

      <ul className="notesList" role="list">
        {notes.map((note) => {
          const isSelected = note.id === selectedId;
          const preview =
            note.content?.trim().slice(0, 80) || "No content yet…";

          return (
            <li key={note.id} className="notesListItem">
              <button
                type="button"
                className={`noteRow ${isSelected ? "noteRowSelected" : ""}`}
                onClick={() => onSelect(note.id)}
                aria-current={isSelected ? "true" : "false"}
              >
                <div className="noteRowTop">
                  <div className="noteTitle">{note.title}</div>
                  <div className="noteMeta">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="notePreview">{preview}</div>
              </button>

              <button
                type="button"
                className="iconBtn"
                onClick={() => onDelete(note)}
                aria-label={`Delete note "${note.title}"`}
                title="Delete"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
