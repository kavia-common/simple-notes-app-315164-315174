import React, { useEffect, useMemo, useState } from "react";

/**
 * @typedef {{id:number,title:string,content:string,created_at:string,updated_at:string}} Note
 */

// PUBLIC_INTERFACE
export default function NoteEditor({
  mode, // "empty" | "new" | "existing"
  note,
  isBusy,
  error,
  onSaveNew,
  onSaveUpdate,
  onCancelNew,
  onDelete,
}) {
  /** Right pane editor for a selected note, or a new note draft. */
  const initialTitle = useMemo(() => note?.title || "", [note]);
  const initialContent = useMemo(() => note?.content || "", [note]);

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTouched(false);
  }, [initialTitle, initialContent]);

  const canSave =
    title.trim().length > 0 && (!isBusy ? true : true) && (mode !== "empty");

  const hasChanges =
    mode === "new" ? true : title !== initialTitle || content !== initialContent;

  function handleSave() {
    if (!canSave) return;

    const payload = { title: title.trim(), content };
    if (mode === "new") {
      onSaveNew(payload);
    } else if (mode === "existing" && note) {
      onSaveUpdate(note.id, payload);
    }
  }

  if (mode === "empty") {
    return (
      <section className="editor" aria-label="Note editor">
        <div className="editorEmpty">
          <div className="editorEmptyTitle">Select a note</div>
          <div className="editorEmptyBody">
            Choose a note from the list, or create a new one.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="editor" aria-label="Note editor">
      <div className="editorHeader">
        <div className="editorHeaderLeft">
          <div className="editorTitle">
            {mode === "new" ? "New note" : "Edit note"}
          </div>
          {mode === "existing" && note ? (
            <div className="editorMeta">
              Updated {new Date(note.updated_at).toLocaleString()}
            </div>
          ) : (
            <div className="editorMeta">Not saved yet</div>
          )}
        </div>

        <div className="editorActions">
          {mode === "new" ? (
            <button
              type="button"
              className="btn btnGhost"
              onClick={onCancelNew}
              disabled={isBusy}
            >
              Cancel
            </button>
          ) : null}

          {mode === "existing" && note ? (
            <button
              type="button"
              className="btn btnDanger"
              onClick={() => onDelete(note)}
              disabled={isBusy}
            >
              Delete
            </button>
          ) : null}

          <button
            type="button"
            className="btn btnPrimary"
            onClick={handleSave}
            disabled={isBusy || !canSave || (mode === "existing" && !hasChanges)}
          >
            {isBusy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="callout calloutError" role="alert">
          <div className="calloutTitle">Something went wrong</div>
          <div className="calloutBody">{error}</div>
        </div>
      ) : null}

      <div className="editorBody">
        <label className="field">
          <div className="fieldLabel">Title</div>
          <input
            className="input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTouched(true);
            }}
            placeholder="Untitled"
            disabled={isBusy}
            maxLength={200}
          />
        </label>

        <label className="field fieldGrow">
          <div className="fieldLabel">Content</div>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setTouched(true);
            }}
            placeholder="Write something…"
            disabled={isBusy}
          />
        </label>

        {touched && title.trim().length === 0 ? (
          <div className="hint hintError">Title is required.</div>
        ) : null}
      </div>
    </section>
  );
}
