export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return Response.json({ error: "Missing coordinates" }, { status: 400 });
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "safe-route-app",
        },
      }
    );

    if (!res.ok) {
      return Response.json({ error: "Geocode failed" }, { status: 500 });
    }

    const data = await res.json();

    return Response.json({
      address: data.display_name,
      addressParts: data.address,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}