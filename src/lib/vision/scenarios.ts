import type { EventType } from "./types";

export interface Scenario {
  id: string;
  name: string;
  clip: string;
  description: string;
  duration_s: number;
  expects: EventType[];
}

/** Mirrors /demo/scenarios/manifest.json in the Python pipeline repo. */
export const SCENARIOS: Scenario[] = [
  {
    id: "sc_helmet",
    name: "Helmet-less rider",
    clip: "/demo/scenarios/helmet_rider.mp4",
    description: "Two-wheeler passes the gantry without a helmet. Requires custom helmet weights.",
    duration_s: 22,
    expects: ["no_helmet", "overspeed"],
  },
  {
    id: "sc_signal",
    name: "Signal jump at MG Road",
    clip: "/demo/scenarios/signal_jump.mp4",
    description: "Car crosses the stop-line while the signal state is RED.",
    duration_s: 18,
    expects: ["red_light", "overspeed"],
  },
  {
    id: "sc_fire",
    name: "Roadside fire plume",
    clip: "/demo/scenarios/roadside_fire.mp4",
    description: "Three-signal heuristic (colour + flicker + turbulent flow) sustained over 2s.",
    duration_s: 26,
    expects: ["fire", "smoke"],
  },
  {
    id: "sc_crash",
    name: "Rear-end collision",
    clip: "/demo/scenarios/rear_end.mp4",
    description: "Sudden deceleration plus abrupt bbox IoU spike between two vehicle tracks.",
    duration_s: 30,
    expects: ["accident_suspected"],
  },
  {
    id: "sc_animal",
    name: "Cattle on carriageway",
    clip: "/demo/scenarios/cattle_crossing.mp4",
    description: "Animal ground-contact point dwells inside road_zone beyond the dwell threshold.",
    duration_s: 24,
    expects: ["animal_on_road", "pedestrian_intrusion"],
  },
  {
    id: "sc_triple",
    name: "Triple riding + litter",
    clip: "/demo/scenarios/triple_riding.mp4",
    description: "Three person tracks associated to one motorcycle bbox over 15 frames.",
    duration_s: 28,
    expects: ["triple_riding", "litter_suspected"],
  },
];
