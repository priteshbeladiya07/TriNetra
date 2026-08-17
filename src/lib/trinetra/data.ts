// TriNetra — Nagpur traffic risk simulation dataset (frontend mock layer)

export type RoadType = "arterial" | "collector" | "local";

export interface Junction {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  roadType: RoadType;
  laneCount: number;
  hasSignal: boolean;
  nearSchool: boolean;
  nearHospital: boolean;
  nearMarket: boolean;
  lighting: number; // 0..1 (1 = excellent)
  historicAccidents: number; // last 12 months
  baseFlow: number; // vehicles/hour at peak
}

export const JUNCTIONS: Junction[] = [
  { id: "J01", name: "Variety Square", zone: "Sitabuldi", lat: 21.1466, lon: 79.0821, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: true, lighting: 0.8, historicAccidents: 41, baseFlow: 5400 },
  { id: "J02", name: "Sitabuldi Main Road", zone: "Sitabuldi", lat: 21.1458, lon: 79.0776, roadType: "arterial", laneCount: 4, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: true, lighting: 0.75, historicAccidents: 33, baseFlow: 4800 },
  { id: "J03", name: "Sadar Bazaar Chowk", zone: "Sadar", lat: 21.1613, lon: 79.0776, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: true, nearHospital: false, nearMarket: true, lighting: 0.6, historicAccidents: 28, baseFlow: 3900 },
  { id: "J04", name: "Ram Jhula Junction", zone: "Central", lat: 21.1523, lon: 79.0885, roadType: "arterial", laneCount: 6, hasSignal: false, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.55, historicAccidents: 47, baseFlow: 6100 },
  { id: "J05", name: "Wardha Road / Ajni", zone: "Ajni", lat: 21.1265, lon: 79.0693, roadType: "arterial", laneCount: 8, hasSignal: true, nearSchool: false, nearHospital: true, nearMarket: false, lighting: 0.85, historicAccidents: 52, baseFlow: 7200 },
  { id: "J06", name: "Chhatrapati Square", zone: "Wardha Rd", lat: 21.1116, lon: 79.0567, roadType: "arterial", laneCount: 8, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.9, historicAccidents: 58, baseFlow: 7800 },
  { id: "J07", name: "Manish Nagar Crossing", zone: "Manish Nagar", lat: 21.0961, lon: 79.0489, roadType: "collector", laneCount: 4, hasSignal: false, nearSchool: true, nearHospital: false, nearMarket: false, lighting: 0.45, historicAccidents: 24, baseFlow: 2900 },
  { id: "J08", name: "Kamptee Road / Indora", zone: "North", lat: 21.1755, lon: 79.1046, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: true, lighting: 0.6, historicAccidents: 44, baseFlow: 5600 },
  { id: "J09", name: "Automotive Square", zone: "North", lat: 21.1836, lon: 79.0932, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.7, historicAccidents: 37, baseFlow: 5100 },
  { id: "J10", name: "Deekshabhoomi", zone: "South", lat: 21.1265, lon: 79.0546, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.8, historicAccidents: 21, baseFlow: 4300 },
  { id: "J11", name: "Law College Square", zone: "South", lat: 21.1301, lon: 79.0621, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: true, nearHospital: false, nearMarket: false, lighting: 0.7, historicAccidents: 19, baseFlow: 3400 },
  { id: "J12", name: "Panchsheel Square", zone: "Central", lat: 21.1386, lon: 79.0776, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: true, nearMarket: false, lighting: 0.8, historicAccidents: 35, baseFlow: 5200 },
  { id: "J13", name: "Medical Square", zone: "South East", lat: 21.1349, lon: 79.1010, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: true, nearMarket: true, lighting: 0.65, historicAccidents: 49, baseFlow: 5900 },
  { id: "J14", name: "Ajni Square", zone: "Ajni", lat: 21.1330, lon: 79.0721, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.7, historicAccidents: 26, baseFlow: 3700 },
  { id: "J15", name: "Zero Mile Chowk", zone: "Civil Lines", lat: 21.1498, lon: 79.0806, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.85, historicAccidents: 17, baseFlow: 3100 },
  { id: "J16", name: "Kadbi Chowk", zone: "North West", lat: 21.1690, lon: 79.0699, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: true, lighting: 0.55, historicAccidents: 40, baseFlow: 5000 },
  { id: "J17", name: "Gaddigodam Square", zone: "North", lat: 21.1738, lon: 79.0855, roadType: "collector", laneCount: 4, hasSignal: false, nearSchool: false, nearHospital: false, nearMarket: true, lighting: 0.4, historicAccidents: 31, baseFlow: 3300 },
  { id: "J18", name: "Pardi Naka", zone: "East", lat: 21.1611, lon: 79.1315, roadType: "arterial", laneCount: 6, hasSignal: false, nearSchool: false, nearHospital: false, nearMarket: true, lighting: 0.35, historicAccidents: 55, baseFlow: 6300 },
  { id: "J19", name: "Kalamna Market", zone: "East", lat: 21.1580, lon: 79.1450, roadType: "collector", laneCount: 4, hasSignal: false, nearSchool: false, nearHospital: false, nearMarket: true, lighting: 0.35, historicAccidents: 38, baseFlow: 3600 },
  { id: "J20", name: "Hingna T-Point", zone: "West", lat: 21.1064, lon: 78.9990, roadType: "arterial", laneCount: 6, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.6, historicAccidents: 43, baseFlow: 5500 },
  { id: "J21", name: "Trimurti Nagar Square", zone: "West", lat: 21.1173, lon: 79.0342, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: true, nearHospital: false, nearMarket: false, lighting: 0.7, historicAccidents: 22, baseFlow: 3200 },
  { id: "J22", name: "Dharampeth Square", zone: "Dharampeth", lat: 21.1417, lon: 79.0621, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: true, nearHospital: false, nearMarket: true, lighting: 0.8, historicAccidents: 25, baseFlow: 3800 },
  { id: "J23", name: "Futala Lake Road", zone: "West", lat: 21.1487, lon: 79.0466, roadType: "collector", laneCount: 4, hasSignal: false, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.45, historicAccidents: 18, baseFlow: 2600 },
  { id: "J24", name: "Jaripatka Square", zone: "North", lat: 21.1804, lon: 79.0713, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: true, nearHospital: false, nearMarket: true, lighting: 0.6, historicAccidents: 29, baseFlow: 3500 },
  { id: "J25", name: "Koradi Road / Auto Nagar", zone: "North", lat: 21.1962, lon: 79.0797, roadType: "arterial", laneCount: 6, hasSignal: false, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.4, historicAccidents: 34, baseFlow: 4600 },
  { id: "J26", name: "Besa Ring Road", zone: "South", lat: 21.0872, lon: 79.0664, roadType: "arterial", laneCount: 6, hasSignal: false, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.4, historicAccidents: 39, baseFlow: 4900 },
  { id: "J27", name: "Mankapur Square", zone: "North West", lat: 21.1873, lon: 79.0552, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: false, nearHospital: false, nearMarket: false, lighting: 0.65, historicAccidents: 20, baseFlow: 3000 },
  { id: "J28", name: "Rahate Colony Square", zone: "Central", lat: 21.1218, lon: 79.0678, roadType: "collector", laneCount: 4, hasSignal: true, nearSchool: false, nearHospital: true, nearMarket: false, lighting: 0.75, historicAccidents: 23, baseFlow: 3400 },
];

export type WeatherCondition = "clear" | "light-rain" | "heavy-rain" | "fog";

export interface CityEvent {
  id: string;
  name: string;
  type: "festival" | "sports" | "rally" | "vip" | "roadwork";
  junctionId: string;
  window: [number, number]; // hours
  crowd: number;
}

export const EVENTS: CityEvent[] = [
  { id: "E1", name: "Ganesh Visarjan Procession", type: "festival", junctionId: "J01", window: [17, 23], crowd: 25000 },
  { id: "E2", name: "Dhamma Chakra Gathering", type: "festival", junctionId: "J10", window: [9, 20], crowd: 40000 },
  { id: "E3", name: "VCA Stadium T20 Fixture", type: "sports", junctionId: "J06", window: [18, 23], crowd: 32000 },
  { id: "E4", name: "Metro Pillar Roadwork", type: "roadwork", junctionId: "J05", window: [0, 24], crowd: 0 },
  { id: "E5", name: "Farmers' Union Rally", type: "rally", junctionId: "J15", window: [10, 15], crowd: 6000 },
  { id: "E6", name: "VIP Convoy Movement", type: "vip", junctionId: "J09", window: [16, 18], crowd: 0 },
];

export interface Officer {
  id: string;
  name: string;
  rank: "Constable" | "Head Constable" | "Marshal" | "PSI";
  shift: "A (06-14)" | "B (14-22)" | "C (22-06)";
  postId: string;
  status: "available" | "deployed" | "break";
  fatigue: number; // 0..1
}

const FIRST = ["Ramesh", "Sunil", "Anil", "Prakash", "Vijay", "Nitin", "Rahul", "Sagar", "Pooja", "Sneha", "Kavita", "Manoj", "Deepak", "Ashwin", "Rohit", "Swapnil", "Girish", "Yogesh", "Nilesh", "Amol"];
const LAST = ["Deshmukh", "Kale", "Wankhede", "Bhoyar", "Ingle", "Patil", "Meshram", "Thakre", "Gawande", "Rane"];
const RANKS: Officer["rank"][] = ["Constable", "Constable", "Constable", "Head Constable", "Marshal", "PSI"];
const SHIFTS: Officer["shift"][] = ["A (06-14)", "B (14-22)", "C (22-06)"];

export const OFFICERS: Officer[] = Array.from({ length: 72 }, (_, i) => {
  const j = JUNCTIONS[i % JUNCTIONS.length]!;
  return {
    id: `OFF-${String(i + 101).padStart(3, "0")}`,
    name: `${FIRST[i % FIRST.length]!} ${LAST[(i * 3) % LAST.length]!}`,
    rank: RANKS[i % RANKS.length]!,
    shift: SHIFTS[i % 3]!,
    postId: j.id,
    status: (i % 11 === 0 ? "break" : i % 7 === 0 ? "available" : "deployed") as Officer["status"],
    fatigue: Number((((i * 37) % 100) / 100).toFixed(2)),
  };
});

export interface Incident {
  id: string;
  junctionId: string;
  type: "Accident" | "Breakdown" | "Waterlogging" | "Signal Failure" | "Crowd Surge";
  severity: "minor" | "major" | "critical";
  reportedAt: string;
  status: "open" | "responding" | "cleared";
  note: string;
}

export const SEED_INCIDENTS: Incident[] = [
  { id: "INC-4412", junctionId: "J18", type: "Accident", severity: "critical", reportedAt: "18:42", status: "open", note: "Two-wheeler vs truck, one lane blocked eastbound." },
  { id: "INC-4411", junctionId: "J05", type: "Waterlogging", severity: "major", reportedAt: "18:20", status: "responding", note: "Knee-deep water under metro pillar, service road shut." },
  { id: "INC-4409", junctionId: "J13", type: "Signal Failure", severity: "major", reportedAt: "17:55", status: "responding", note: "All-phase outage, manual regulation in progress." },
  { id: "INC-4405", junctionId: "J03", type: "Crowd Surge", severity: "minor", reportedAt: "17:31", status: "open", note: "Market overflow onto carriageway." },
  { id: "INC-4398", junctionId: "J20", type: "Breakdown", severity: "minor", reportedAt: "16:48", status: "cleared", note: "Stalled tempo removed by crane." },
];

export const VIOLATION_TYPES = ["No Helmet", "Over-speeding", "Red Light", "Wrong Side", "Triple Riding", "Illegal Parking"] as const;
