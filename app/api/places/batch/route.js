// app/api/places/batch/route.js
export async function POST(request) {
  try {
    const { keywords, city, maxResults = 10 } = await request.json();

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: "Nessuna keyword ricevuta" }), {
        status: 400,
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_MAPS_API_KEY non configurata" }),
        { status: 500 }
      );
    }

    const resultsPerKeyword = [];
    const leaderboardMap = new Map();

    for (const rawKeyword of keywords) {
      const trimmed = String(rawKeyword || "").trim();
      if (!trimmed) continue;

      // es: "ristorante di pesce Rimini"
      const query = city ? `${trimmed} ${city}` : trimmed;

      const payload = {
        textQuery: query,
        languageCode: "it",
        regionCode: "IT",
      };

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
        // non blocchiamo tutto, segnaliamo l'errore per quella keyword
        resultsPerKeyword.push({
          keyword: trimmed,
          error: data,
        });
        continue;
      }

      const places = (data.places || []).slice(0, maxResults);

      resultsPerKeyword.push({
        keyword: trimmed,
        places,
      });

      // aggiorna leaderboard aggregata
      places.forEach((p, index) => {
        const id = p.id;
        if (!leaderboardMap.has(id)) {
          leaderboardMap.set(id, {
            id,
            name: p.displayName?.text || "Senza nome",
            address: p.formattedAddress || "",
            appearances: 0,
            sumRank: 0,
            bestRank: Infinity,
            keywords: new Set(),
          });
        }
        const entry = leaderboardMap.get(id);
        const rank = index + 1;
        entry.appearances += 1;
        entry.sumRank += rank;
        entry.bestRank = Math.min(entry.bestRank, rank);
        entry.keywords.add(trimmed);
      });
    }

    // trasforma mappa in array e ordina per "appparitions" e poi bestRank
    const leaderboard = Array.from(leaderboardMap.values())
      .map((e) => ({
        ...e,
        avgRank: e.sumRank / e.appearances,
        keywords: Array.from(e.keywords),
      }))
      .sort((a, b) => {
        if (b.appearances !== a.appearances) {
          return b.appearances - a.appearances; // più apparizioni prima
        }
        return a.bestRank - b.bestRank; // a parità, chi ha rank migliore
      });

    return new Response(
      JSON.stringify({
        city,
        resultsPerKeyword,
        leaderboard,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Errore interno" }),
      { status: 500 }
    );
  }
}
