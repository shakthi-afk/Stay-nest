/**
 * Overpass API service — fetches REAL hostel data from OpenStreetMap.
 * Free, no API key required. Data is crowd-sourced and reflects actual
 * hostels, backpacker lodges and guesthouses registered in OSM.
 */

export interface RealHostel {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lon]
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  stars?: string;
  internet?: string;
  source: "osm"; // marks it as live data
}

// Bounding boxes for Indian regions (south, west, north, east)
export const INDIA_REGIONS: Record<string, { bbox: [number, number, number, number]; label: string }> = {
  "Tamil Nadu":         { bbox: [8.00, 76.00, 13.60, 80.50], label: "Tamil Nadu" },
  "Chennai":            { bbox: [12.90, 80.10, 13.25, 80.35], label: "Chennai" },
  "Madurai":            { bbox: [9.82, 77.98, 9.98, 78.22], label: "Madurai" },
  "Ooty":               { bbox: [11.35, 76.63, 11.47, 76.78], label: "Ooty" },
  "Kodaikanal":         { bbox: [10.18, 77.43, 10.28, 77.55], label: "Kodaikanal" },
  "Coimbatore":         { bbox: [10.93, 76.87, 11.08, 77.05], label: "Coimbatore" },
  "Kanyakumari":        { bbox: [8.05, 77.49, 8.15, 77.58], label: "Kanyakumari" },
  "Pondicherry":        { bbox: [11.85, 79.78, 11.98, 79.88], label: "Pondicherry" },
  "Goa":                { bbox: [14.89, 73.65, 15.78, 74.40], label: "Goa" },
  "Mumbai":             { bbox: [18.87, 72.77, 19.27, 72.98], label: "Mumbai" },
  "Delhi":              { bbox: [28.40, 76.84, 28.88, 77.35], label: "Delhi" },
  "Bangalore":          { bbox: [12.83, 77.46, 13.10, 77.75], label: "Bangalore" },
  "Jaipur":             { bbox: [26.80, 75.70, 27.00, 75.90], label: "Jaipur" },
  "Udaipur":            { bbox: [24.54, 73.65, 24.63, 73.74], label: "Udaipur" },
  "Manali":             { bbox: [32.20, 77.14, 32.30, 77.22], label: "Manali" },
  "Rishikesh":          { bbox: [30.07, 78.25, 30.12, 78.32], label: "Rishikesh" },
  "Kochi":              { bbox: [9.89, 76.23, 9.98, 76.32], label: "Kochi" },
  "Varanasi":           { bbox: [25.27, 82.93, 25.37, 83.04], label: "Varanasi" },
  "Agra":               { bbox: [27.14, 77.95, 27.22, 78.07], label: "Agra" },
  "India":              { bbox: [8.00, 68.00, 37.00, 97.00], label: "India" },
};

/**
 * Build an Overpass QL query for hostels/backpacker lodges in a bbox.
 */
function buildOverpassQuery(bbox: [number, number, number, number]): string {
  const [s, w, n, e] = bbox;
  const bboxStr = `${s},${w},${n},${e}`;
  return `
[out:json][timeout:20];
(
  node["tourism"="hostel"](${bboxStr});
  node["tourism"="guest_house"](${bboxStr});
  node["tourism"="backpacker"](${bboxStr});
  way["tourism"="hostel"](${bboxStr});
  way["tourism"="guest_house"](${bboxStr});
);
out center body;
`.trim();
}

/**
 * Parse Overpass API elements into our RealHostel shape.
 */
function parseElement(el: any): RealHostel | null {
  const tags = el.tags || {};
  const name = tags.name || tags["name:en"] || tags.brand;
  if (!name) return null;

  let lat: number, lon: number;
  if (el.type === "node") {
    lat = el.lat;
    lon = el.lon;
  } else if (el.type === "way" && el.center) {
    lat = el.center.lat;
    lon = el.center.lon;
  } else {
    return null;
  }

  const city =
    tags["addr:city"] ||
    tags["addr:town"] ||
    tags["addr:state"] ||
    "";
  const state = tags["addr:state"] || "";
  const location = [city, state].filter(Boolean).join(", ") || "India";

  const address = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    coordinates: [lat, lon],
    location,
    address: address || undefined,
    phone: tags.phone || tags["contact:phone"] || undefined,
    website: tags.website || tags["contact:website"] || undefined,
    stars: tags.stars || undefined,
    internet: tags["internet_access"] || undefined,
    source: "osm",
  };
}

// Simple in-memory cache: region key → { data, fetchedAt }
const cache = new Map<string, { data: RealHostel[]; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch real hostels from OpenStreetMap Overpass API.
 * @param regionKey  Key from INDIA_REGIONS, e.g. "Tamil Nadu" or "Goa"
 * @returns          Array of real hostel objects
 */
export async function fetchRealHostels(regionKey: string): Promise<RealHostel[]> {
  const cached = cache.get(regionKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const region = INDIA_REGIONS[regionKey] ?? INDIA_REGIONS["India"];
  const query = buildOverpassQuery(region.bbox);

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const json = await response.json();
  const elements: any[] = json.elements ?? [];

  const hostels: RealHostel[] = elements
    .map(parseElement)
    .filter((h): h is RealHostel => h !== null);

  cache.set(regionKey, { data: hostels, fetchedAt: Date.now() });
  return hostels;
}

/**
 * Find the best matching region key for a search string.
 * Falls back to "India" for broad searches.
 */
export function resolveRegion(searchTerm: string): string {
  if (!searchTerm) return "India";
  const lower = searchTerm.toLowerCase();
  const match = Object.keys(INDIA_REGIONS).find((key) =>
    lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)
  );
  return match ?? "India";
}
