"use client";

import { useState } from "react";

export default function RankPage() {
  const [query, setQuery] = useState("parrucchiere Rimini");
  const [myPlaceName, setMyPlaceName] = useState("");
  const [results, setResults] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRank(null);
    setResults([]);

    try {
      const res = await fetch("/api/places/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          // se vuoi in futuro puoi aggiungere:
          // location: { lat: 44.059, lng: 12.568 },
          // radiusMeters: 5000,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error)
        );
      }

      const places = data.places || [];
      setResults(places);

      if (myPlaceName) {
        const idx = places.findIndex((p) =>
          (p.displayName?.text || "")
            .toLowerCase()
            .includes(myPlaceName.toLowerCase())
        );
        if (idx !== -1) setRank(idx + 1);
        else setRank(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Monitor classifica Google Maps
      </h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Keyword + città (es. “parrucchiere Rimini”)
          </label>
          <input
            className="w-full rounded border px-3 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Nome della tua attività (per trovare il rank nella lista)
          </label>
          <input
            className="w-full rounded border px-3 py-2"
            value={myPlaceName}
            onChange={(e) => setMyPlaceName(e.target.value)}
            placeholder='Es. "PTS Impianti"'
          />
        </div>

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sto cercando..." : "Calcola classifica"}
        </button>
      </form>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {myPlaceName && rank && (
        <p className="mb-4 font-semibold">
          <span className="font-bold">{myPlaceName}</span> è in posizione{" "}
          <span className="font-bold">#{rank}</span> per questa ricerca.
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h2 className="mb-2 font-semibold">Risultati trovati</h2>
          {results.map((p, i) => (
            <div
              key={p.id}
              className="flex justify-between rounded border p-3"
            >
              <div>
                <div className="font-medium">
                  #{i + 1} {p.displayName?.text}
                </div>
                <div className="text-sm text-gray-600">
                  {p.formattedAddress}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
