import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_STATE, type WorldState } from "./engine";
import { SEED_INCIDENTS, type Incident } from "./data";

export interface AppState {
  world: WorldState;
  incidents: Incident[];
  decisions: Record<string, "accepted" | "rejected" | "modified">;
}

let state: AppState = {
  world: DEFAULT_STATE,
  incidents: SEED_INCIDENTS,
  decisions: {},
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  const get = useCallback(() => selector(state), [selector]);
  return useSyncExternalStore(subscribe, get, get);
}

export const actions = {
  setWorld(patch: Partial<WorldState>) {
    state = { ...state, world: { ...state.world, ...patch } };
    emit();
  },
  setManualOfficers(junctionId: string, count: number) {
    state = {
      ...state,
      world: {
        ...state.world,
        manualOfficers: { ...state.world.manualOfficers, [junctionId]: Math.max(0, count) },
      },
    };
    emit();
  },
  addIncident(inc: Incident, pressure: number) {
    state = {
      ...state,
      incidents: [inc, ...state.incidents],
      world: {
        ...state.world,
        incidentPressure: {
          ...state.world.incidentPressure,
          [inc.junctionId]: Math.max(state.world.incidentPressure[inc.junctionId] ?? 0, pressure),
        },
      },
    };
    emit();
  },
  clearIncident(id: string) {
    const inc = state.incidents.find((i) => i.id === id);
    const pressure = { ...state.world.incidentPressure };
    if (inc) delete pressure[inc.junctionId];
    state = {
      ...state,
      incidents: state.incidents.map((i) => (i.id === id ? { ...i, status: "cleared" } : i)),
      world: { ...state.world, incidentPressure: pressure },
    };
    emit();
  },
  decide(junctionId: string, decision: "accepted" | "rejected" | "modified") {
    state = { ...state, decisions: { ...state.decisions, [junctionId]: decision } };
    emit();
  },
};
