/**
 * Backend API configuration.
 *
 * The TriNetra pipeline (backend/) can be exposed over HTTP. When
 * VITE_API_BASE_URL is set, uploads are streamed to it; otherwise the browser
 * pipeline ingests the file locally (fully offline demo mode).
 */
export const API_BASE_URL: string =
  ((import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? "").replace(/\/$/, "");

export const hasBackend = () => API_BASE_URL.length > 0;

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface UploadResult {
  /** URI the pipeline should read the footage from */
  source_uri: string;
  /** true when the file was persisted by the backend */
  persisted: boolean;
}

/**
 * Upload a video to the backend stream-ingest endpoint with real progress.
 * Falls back to a local object URL when no backend is configured.
 */
export function uploadStreamVideo(
  file: File,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  if (!hasBackend()) {
    return new Promise<UploadResult>((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      reader.onerror = () => reject(new Error("Could not read the selected file"));
      reader.onload = () => {
        onProgress(100);
        resolve({ source_uri: URL.createObjectURL(file), persisted: false });
      };
      signal?.addEventListener("abort", () => reader.abort());
      reader.readAsArrayBuffer(file);
    });
  }

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl("/api/streams/upload"));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Upload failed — is the backend running?"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText) as { source_uri?: string };
          resolve({
            source_uri: body.source_uri ?? URL.createObjectURL(file),
            persisted: true,
          });
        } catch {
          resolve({ source_uri: URL.createObjectURL(file), persisted: true });
        }
      } else {
        reject(new Error(`Upload rejected by backend (HTTP ${xhr.status})`));
      }
    };
    signal?.addEventListener("abort", () => xhr.abort());
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
