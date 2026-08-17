import { useCallback, useRef, useState } from "react";
import { CheckCircle2, FileVideo, Loader2, RefreshCw, Trash2, TriangleAlert, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { hasBackend, uploadStreamVideo } from "@/lib/api";

const ACCEPTED = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
const ACCEPT_ATTR = ".mp4,.mov,.avi,.webm,video/*";
const MAX_BYTES = 512 * 1024 * 1024;

type Status = "idle" | "uploading" | "success" | "error";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

interface Props {
  /** called with the URI the pipeline should read once the upload succeeds */
  onUploaded: (payload: { file: File; sourceUri: string; persisted: boolean }) => void;
  onCleared?: () => void;
}

export function VideoDropzone({ onUploaded, onCleared }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    const okType = ACCEPTED.includes(f.type) || /\.(mp4|mov|avi|webm)$/i.test(f.name);
    if (!okType) return "Unsupported format — use mp4, mov, avi or webm.";
    if (f.size > MAX_BYTES) return `File is too large (${formatBytes(f.size)}). Limit is 512 MB.`;
    if (f.size === 0) return "That file is empty.";
    return null;
  };

  const startUpload = useCallback(
    async (f: File) => {
      const problem = validate(f);
      setFile(f);
      setProgress(0);
      if (problem) {
        setStatus("error");
        setError(problem);
        return;
      }
      setError(null);
      setStatus("uploading");
      try {
        const result = await uploadStreamVideo(f, setProgress);
        setStatus("success");
        setProgress(100);
        onUploaded({ file: f, sourceUri: result.source_uri, persisted: result.persisted });
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    },
    [onUploaded],
  );

  const clear = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onCleared?.();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void startUpload(f);
        }}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void startUpload(f);
          }}
          className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? "border-primary bg-accent"
              : "border-border bg-surface-2/60 hover:border-primary/60 hover:bg-accent/50"
          }`}
        >
          <UploadCloud className="size-6 text-primary" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Drag &amp; drop footage, or click to browse
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            mp4 / mov / avi / webm · max 512 MB
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {hasBackend() ? "→ backend /api/streams/upload" : "→ local pipeline ingest"}
          </p>
        </button>
      ) : (
        <div className="rounded-lg border border-border bg-surface-2/60 p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-primary">
              {status === "uploading" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle2 className="size-5 text-risk-low" />
              ) : status === "error" ? (
                <TriangleAlert className="size-5 text-destructive" />
              ) : (
                <FileVideo className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {formatBytes(file.size)}
                {status === "uploading" && ` · uploading ${progress}%`}
                {status === "success" && " · ready — streaming into the pipeline"}
              </p>
              {status === "uploading" && <Progress value={progress} className="mt-2 h-1.5" />}
              {status === "error" && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={status === "uploading"}
                aria-label="Replace file"
              >
                <RefreshCw className="size-4" />
                <span className="hidden sm:inline">Replace</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clear}
                disabled={status === "uploading"}
                aria-label="Remove file"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
