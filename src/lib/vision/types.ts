export type EventType =
  | "overspeed"
  | "red_light"
  | "no_helmet"
  | "triple_riding"
  | "pedestrian_intrusion"
  | "animal_on_road"
  | "litter_suspected"
  | "fire"
  | "smoke"
  | "accident_suspected";

export const CRITICAL_EVENTS: EventType[] = ["fire", "smoke", "accident_suspected"];
export const CHALLAN_EVENTS: EventType[] = [
  "overspeed",
  "red_light",
  "no_helmet",
  "triple_riding",
];
export const REVIEW_EVENTS: EventType[] = ["litter_suspected", "accident_suspected", "smoke"];

export interface TriEvent {
  id: string;
  stream_id: string;
  event_type: EventType;
  track_id: number;
  timestamp: string;
  confidence: number;
  metadata: Record<string, string | number | boolean>;
  evidence_snapshot_path: string;
  evidence_clip_path: string | null;
  reviewed: boolean;
  reviewer_note: string | null;
}

export type ChallanStatus = "auto_generated" | "pending_review" | "issued" | "disputed";

export interface Challan {
  id: string;
  event_id: string;
  plate_number: string;
  plate_confidence: number;
  violation_type: EventType;
  vehicle_class: string;
  evidence_snapshot_path: string;
  timestamp: string;
  location: string;
  status: ChallanStatus;
}

export interface StreamSettings {
  fire_backend: "heuristic" | "custom_model";
  modules_enabled: EventType[];
  confidence_threshold: number;
  dwell_time_s: number;
}

export interface StreamRecord {
  id: string;
  name: string;
  source_uri: string;
  source_type: "uploaded_file" | "rtsp" | "webcam" | "scenario";
  speed_limit_kmh: number;
  created_at: string;
  settings: StreamSettings;
}

export interface TrackBox {
  track_id: number;
  cls: string;
  x: number; // normalized 0..1
  y: number;
  w: number;
  h: number;
  speed_kmh?: number;
  flag?: EventType;
}

export const EVENT_LABEL: Record<EventType, string> = {
  overspeed: "Overspeed",
  red_light: "Red-light jump",
  no_helmet: "No helmet",
  triple_riding: "Triple riding",
  pedestrian_intrusion: "Pedestrian intrusion",
  animal_on_road: "Animal on road",
  litter_suspected: "Litter / abandoned object",
  fire: "Fire detected",
  smoke: "Smoke detected",
  accident_suspected: "Suspected accident",
};

/** Statutory fine slabs (INR) used by the e-challan generator. */
export const FINE_AMOUNTS: Partial<Record<EventType, number>> = {
  overspeed: 2000,
  red_light: 1000,
  no_helmet: 1000,
  triple_riding: 1000,
};

export type DispatchStatus = "pending" | "dispatched" | "on_scene" | "resolved";

export interface PoliceDispatch {
  id: string;
  event_id: string;
  event_type: EventType;
  stream_id: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: DispatchStatus;
  unit: string;
  eta_min: number;
  responders: string[];
  note: string | null;
}

export const DISPATCH_UNITS = [
  { unit: "PCR-07 Sitabuldi", eta: 4, responders: ["Patrol van", "2 constables"] },
  { unit: "PCR-12 Dharampeth", eta: 6, responders: ["Patrol van", "Traffic marshal"] },
  { unit: "FIRE-03 Civil Lines", eta: 7, responders: ["Fire tender", "Rescue crew"] },
  { unit: "AMB-21 GMCH", eta: 5, responders: ["Ambulance", "Paramedic"] },
];
