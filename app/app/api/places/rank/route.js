// app/api/places/rank/route.js
export async function POST(request) {
  try {
    const { query, location, radiusMeters } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Manca la query" }), {
        status: 400,
      });
    }

    const payload = {
      textQuery: query,
      languageCode: "it",
      regionCode: "IT",
    };

    if (location && radiusMeters) {
      payload.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: radiusMeters,
        },
      };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_MAPS_API_KEY non configurata" }),
        { status: 500 }
      );
    }

    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Errore interno" }),
      { status: 500 }
    );
  }
}
