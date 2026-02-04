const DEFAULT_BASE_URL = "http://localhost:3001";

/**
 * Build a useful error message from a failed fetch Response.
 */
async function buildHttpError(response) {
  let detail = "";
  try {
    const data = await response.json();
    // FastAPI validation errors often live at `detail`
    if (data && typeof data === "object") {
      detail = data.detail ? JSON.stringify(data.detail) : JSON.stringify(data);
    } else if (data) {
      detail = String(data);
    }
  } catch {
    // ignore json parsing errors; fallback to status text below
  }

  const statusLine = `${response.status} ${response.statusText}`.trim();
  const message = detail ? `${statusLine}: ${detail}` : statusLine;
  return new Error(message || "Request failed");
}

function getBaseUrl() {
  // Optional override; not required by the prompt.
  // CRA exposes REACT_APP_* variables at build time.
  return process.env.REACT_APP_NOTES_API_BASE_URL || DEFAULT_BASE_URL;
}

async function request(path, options = {}) {
  const url = `${getBaseUrl()}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw await buildHttpError(response);
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** List all notes (GET /notes). */
  return request("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createNote(payload) {
  /** Create a note (POST /notes). payload: {title, content} */
  return request("/notes", { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function getNote(noteId) {
  /** Fetch a single note (GET /notes/{id}). */
  return request(`/notes/${noteId}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function updateNote(noteId, payload) {
  /** Update a note (PUT /notes/{id}). payload: {title?, content?} */
  return request(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(noteId) {
  /** Delete a note (DELETE /notes/{id}). */
  return request(`/notes/${noteId}`, { method: "DELETE" });
}
