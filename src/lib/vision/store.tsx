import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CHALLAN_EVENTS,
  CRITICAL_EVENTS,
  DISPATCH_UNITS,
  EVENT_LABEL,
  type Challan,
  type EventType,
  type PoliceDispatch,
  type StreamRecord,
  type TriEvent,
} from "./types";

/**
 * Browser-side mirror of the pipeline's local JSON stores
 * (streams.json / events.json / challans.json). No database anywhere:
 * each "table" is a single JSON blob, read → mutate → written atomically.
 */
const KEYS = {
  streams: "trinetra.streams.json",
  events: "trinetra.events.json",
  challans: "trinetra.challans.json",
  dispatches: "trinetra.dispatches.json",
};

const DEFAULT_STREAMS: StreamRecord[] = [
  {
    id: "stream_01",
    name: "MG Road Junction",
    source_uri: "/storage/uploads/stream_01/source.mp4",
    source_type: "uploaded_file",
    speed_limit_kmh: 40,
    created_at: "2026-08-16T09:00:00Z",
    settings: {
      fire_backend: "heuristic",
      modules_enabled: [
        "overspeed",
        "red_light",
        "triple_riding",
        "pedestrian_intrusion",
        "animal_on_road",
        "litter_suspected",
        "fire",
        "accident_suspected",
      ],
      confidence_threshold: 0.45,
      dwell_time_s: 2,
    },
  },
];

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — non-fatal for the demo */
  }
}

const PLATE_SERIES = ["MH-31-AB", "MH-12-CX", "KA-05-HK", "DL-8C-AF", "TN-09-BZ", "GJ-01-RT"];

function randomPlate() {
  const p = PLATE_SERIES[Math.floor(Math.random() * PLATE_SERIES.length)] ?? "MH-31-AB";
  return `${p}-${String(1000 + Math.floor(Math.random() * 8999))}`;
}

interface Ctx {
  streams: StreamRecord[];
  events: TriEvent[];
  challans: Challan[];
  dispatches: PoliceDispatch[];
  activeStream: StreamRecord;
  activeStreamId: string;
  setActiveStreamId: (id: string) => void;
  addEvent: (e: Omit<TriEvent, "id" | "reviewed" | "reviewer_note">) => TriEvent;
  updateEvent: (id: string, patch: Partial<TriEvent>) => void;
  updateChallan: (id: string, patch: Partial<Challan>) => void;
  updateDispatch: (id: string, patch: Partial<PoliceDispatch>) => void;
  dispatchTeam: (id: string, unit?: string) => void;
  updateStream: (id: string, patch: Partial<StreamRecord>) => void;
  addStream: (s: StreamRecord) => void;
  reset: () => void;
  exportCsv: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function TriNetraProvider({ children }: { children: ReactNode }) {
  const [streams, setStreams] = useState<StreamRecord[]>(DEFAULT_STREAMS);
  const [events, setEvents] = useState<TriEvent[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [dispatches, setDispatches] = useState<PoliceDispatch[]>([]);
  const [activeStreamId, setActiveStreamId] = useState("stream_01");
  const hydrated = useRef(false);

  useEffect(() => {
    setStreams(load(KEYS.streams, DEFAULT_STREAMS));
    setEvents(load(KEYS.events, []));
    setChallans(load(KEYS.challans, []));
    setDispatches(load(KEYS.dispatches, []));
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) save(KEYS.streams, streams);
  }, [streams]);
  useEffect(() => {
    if (hydrated.current) save(KEYS.events, events);
  }, [events]);
  useEffect(() => {
    if (hydrated.current) save(KEYS.challans, challans);
  }, [challans]);
  useEffect(() => {
    if (hydrated.current) save(KEYS.dispatches, dispatches);
  }, [dispatches]);

  const counter = useRef(0);

  const addEvent = useCallback<Ctx["addEvent"]>(
    (partial) => {
      counter.current += 1;
      const seq = String(Date.now() % 100000).padStart(5, "0") + counter.current;
      const event: TriEvent = {
        ...partial,
        id: `event_${seq}`,
        reviewed: false,
        reviewer_note: null,
      };
      setEvents((prev) => [event, ...prev].slice(0, 400));

      if (CHALLAN_EVENTS.includes(event.event_type)) {
        const conf = 0.55 + Math.random() * 0.44;
        setChallans((prev) =>
          [
            {
              id: `challan_${seq}`,
              event_id: event.id,
              plate_number: conf < 0.7 ? "UNREADABLE" : randomPlate(),
              plate_confidence: Number(conf.toFixed(2)),
              violation_type: event.event_type,
              vehicle_class: String(event.metadata['vehicle_class'] ?? "car"),
              evidence_snapshot_path: event.evidence_snapshot_path,
              timestamp: event.timestamp,
              location: `${event.stream_id} / ${
                streams.find((s) => s.id === event.stream_id)?.name ?? "unknown"
              }`,
              status: conf < 0.7 ? "pending_review" : "auto_generated",
            } satisfies Challan,
            ...prev,
          ].slice(0, 200),
        );
      }
      if (CRITICAL_EVENTS.includes(event.event_type)) {
        const preferred =
          event.event_type === "accident_suspected" ? DISPATCH_UNITS[3] : DISPATCH_UNITS[2];
        const unit = preferred ?? DISPATCH_UNITS[0]!;
        setDispatches((prev) =>
          [
            {
              id: `dispatch_${seq}`,
              event_id: event.id,
              event_type: event.event_type,
              stream_id: event.stream_id,
              location: `${event.stream_id} / ${
                streams.find((s) => s.id === event.stream_id)?.name ?? "unknown"
              }`,
              lat: 21.1458 + (Math.random() - 0.5) * 0.02,
              lng: 79.0882 + (Math.random() - 0.5) * 0.02,
              timestamp: event.timestamp,
              status: "pending",
              unit: unit.unit,
              eta_min: unit.eta,
              responders: unit.responders,
              note: null,
            } satisfies PoliceDispatch,
            ...prev,
          ].slice(0, 100),
        );
      }
      return event;
    },
    [streams],
  );

  const updateEvent = useCallback<Ctx["updateEvent"]>((id, patch) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);
  const updateChallan = useCallback<Ctx["updateChallan"]>((id, patch) => {
    setChallans((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);
  const updateDispatch = useCallback<Ctx["updateDispatch"]>((id, patch) => {
    setDispatches((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);
  const dispatchTeam = useCallback<Ctx["dispatchTeam"]>((id, unit) => {
    setDispatches((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "dispatched" as const, unit: unit ?? d.unit } : d,
      ),
    );
  }, []);
  const updateStream = useCallback<Ctx["updateStream"]>((id, patch) => {
    setStreams((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);
  const addStream = useCallback<Ctx["addStream"]>((s) => {
    setStreams((prev) => [...prev, s]);
  }, []);

  const reset = useCallback(() => {
    setEvents([]);
    setChallans([]);
    setDispatches([]);
  }, []);

  const exportCsv = useCallback(() => {
    const head = [
      "id",
      "stream_id",
      "event_type",
      "track_id",
      "timestamp",
      "confidence",
      "reviewed",
      "metadata",
    ];
    const rows = events.map((e) =>
      [
        e.id,
        e.stream_id,
        e.event_type,
        e.track_id,
        e.timestamp,
        e.confidence,
        e.reviewed,
        JSON.stringify(e.metadata).replaceAll('"', "'"),
      ].join(","),
    );
    const blob = new Blob([[head.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trinetra_events.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const value = useMemo<Ctx>(
    () => ({
      streams,
      events,
      challans,
      dispatches,
      activeStreamId,
      activeStream: (streams.find((s) => s.id === activeStreamId) ?? streams[0] ?? DEFAULT_STREAMS[0]) as StreamRecord,
      setActiveStreamId,
      addEvent,
      updateEvent,
      updateChallan,
      updateDispatch,
      dispatchTeam,
      updateStream,
      addStream,
      reset,
      exportCsv,
    }),
    [
      streams,
      events,
      challans,
      dispatches,
      activeStreamId,
      addEvent,
      updateEvent,
      updateChallan,
      updateDispatch,
      dispatchTeam,
      updateStream,
      addStream,
      reset,
      exportCsv,
    ],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useTriNetra() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useTriNetra must be used inside TriNetraProvider");
  return ctx;
}

export { EVENT_LABEL };
export type { EventType };
