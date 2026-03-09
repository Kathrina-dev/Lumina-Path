export interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Fetch autocomplete suggestions from server API
 */
export async function suggest(query: string, limit = 5, signal?: AbortSignal): Promise<Suggestion[]> {
  if (query.length < 1) return [];
  const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}&limit=${limit}`, { signal });
  if (!res.ok) return [];
  const data: Suggestion[] = await res.json();
  return data;
}

/**
 * Geocode a single address to coordinates
 */
export async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}&limit=1`);
  if (!res.ok) return null;
  const data: Suggestion[] = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

/**
 * Reverse geocode coordinates to an address string
 */
export async function reverseGeocode(lat: number, lon: number): Promise<any> {
  const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data;
}