export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const limit = searchParams.get("limit") || "5";

  try {
    if (query) {
      // forward geocoding / suggestions
      const url =
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=${limit}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "safe-route-app" },
      });
      if (!res.ok) {
        return Response.json({ error: "geocode failed" }, { status: 502 });
      }
      const data = await res.json();
      return Response.json(data);
    }

    if (lat && lon) {
      const url =
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "safe-route-app" },
      });
      if (!res.ok) {
        return Response.json({ error: "reverse geocode failed" }, { status: 502 });
      }
      const data = await res.json();
      return Response.json(data);
    }

    return Response.json({ error: "missing parameters" }, { status: 400 });
  } catch (err) {
    console.error("geocode API error", err);
    return Response.json({ error: "server error" }, { status: 500 });
  }
}