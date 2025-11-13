"use client";

import { useState } from "react";

function baseSuggestions(category) {
  if (!category) return [];
  const c = category.toLowerCase();
  // suggerimenti semplici in base alla categoria
  if (c.includes("ristorante")) {
    return [
      "ristorante ",
      "ristorante di pesce",
      "ristorante carne",
      "trattoria",
      "osteria",
      "pizzeria"
    ];
  }
  if (c.includes("parrucchiere") || c.includes("hair")) {
    return [
      "parrucchiere",
      "parrucchiere uomo",
      "parrucchiere donna",
      "barbiere",
      "salone di bellezza"
    ];
  }
  if (c.includes("palestra") || c.includes("fitness")) {
    return [
      "palestra",
      "palestra 24 ore",
      "centro fitness",
      "personal trainer",
      "crossfit"
    ];
  }
  // fallback generico
  return [category, `${category} economico`, `${category} centro`, `${category} aperto ora`];
}

export default function RankAnalyzerPage() {
  const [city, setCity] = useState("Rimini");
  const [specificAddress, setSpecificAddress] = useState("");
  const [category, setCategory] = useState("ristorante");
  const [mainKeyword, setMainKeyword] = useState("ristorante di pesce");

  const [keywords, setKeywords] = useState(["ristorante di pesce"]);
  const [customKeyword, setCustomKeyword] = useState("");

  const [tab, setTab] = useState("category"); // category | single
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
    function handleExportPDF() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }


  function handleSuggestKeywords() {
    const base = baseSuggestions(category || mainKeyword || "");
    // togli duplicati
    const merged = Array.from(new Set([...keywords, ...base]));
    setKeywords(merged.filter(Boolean));
  }

  function handleAddKeyword() {
    const k = customKeyword.trim();
    if (!k) return;
    if (!keywords.includes(k)) {
      setKeywords([...keywords, k]);
    }
    setCustomKeyword("");
  }

  function handleRemoveKeyword(k) {
    setKeywords(keywords.filter((x) => x !== k));
  }

  async function handleQuickAnalyze() {
    if (!mainKeyword.trim()) return;
    setKeywords([mainKeyword.trim()]);
    await runAnalysis([mainKeyword.trim()]);
  }

  async function runAnalysis(keywordsToUse) {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/places/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywordsToUse,
          city: city.trim(),
          maxResults: 10
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error)
        );
      }
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalAnalysis() {
    const cleaned = keywords.map((k) => k.trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    await runAnalysis(cleaned);
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2 text-sm">
        <button
          className={`pb-2 ${
            tab === "category"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setTab("category")}
        >
          Analisi Categoria
        </button>
        <button
          className={`pb-2 ${
            tab === "single"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setTab("single")}
        >
          Analisi Attività Singola
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Colonna sinistra: form principale */}
        <div className="md:col-span-2 space-y-4">
          {tab === "category" && (
            <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 shadow-lg space-y-4 text-white">

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Città</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Indirizzo specifico (opzionale)
                  </label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={specificAddress}
                    onChange={(e) => setSpecificAddress(e.target.value)}
                    placeholder="es. Via Dante"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Categoria attività
                  </label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="es. ristorante, parrucchiere..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Keyword principale
                  </label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={mainKeyword}
                    onChange={(e) => setMainKeyword(e.target.value)}
                    placeholder="es. ristorante di pesce"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSuggestKeywords}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Suggerisci Keywords
                </button>
                <button
                  type="button"
                  onClick={handleQuickAnalyze}
                  className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white"
                  <button

                  disabled={loading}
                >
                  {loading ? "Analizzo..." : "Analizza con questa Keyword"}
                </button>
              </div>
            </div>
          )}

          {tab === "single" && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                Qui in futuro possiamo aggiungere l&apos;analisi di una singola
                attività (es. inserendo il nome o l&apos;indirizzo preciso e
                confrontandolo con i competitor). Per ora usa la scheda{" "}
                <strong>Analisi Categoria</strong>.
              </p>
            </div>
          )}

          {/* Perfeziona parole chiave */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Perfeziona le Parole Chiave</h2>
            <p className="text-sm text-gray-600">
              Rimuovi i suggerimenti non pertinenti o aggiungi le tue parole
              chiave per un&apos;analisi personalizzata.
            </p>

            <div className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleRemoveKeyword(k)}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs"
                >
                  <span>{k}</span>
                  <span className="text-blue-500">✕</span>
                </button>
              ))}
              {keywords.length === 0 && (
                <span className="text-sm text-gray-400">
                  Nessuna keyword selezionata.
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 rounded border px-3 py-2 text-sm"
                placeholder="Aggiungi una parola chiave personalizzata"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="rounded bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
              >
                Aggiungi
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinalAnalysis}
                className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={loading || keywords.length === 0}
              >
                {loading
                  ? "Analisi in corso..."
                  : `Avvia Analisi Finale su ${keywords.length} Keyword${
                      keywords.length > 1 ? "s" : ""
                    }`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setKeywords([]);
                  setAnalysis(null);
                }}
                className="rounded-full border px-4 py-2 text-sm text-gray-600"
              >
                Pulisci Cache
              </button>
              <button
  type="button"
  onClick={handleExportPDF}
  className="rounded-full border px-4 py-2 text-sm bg-white/10 text-gray-200 hover:bg-white/20 transition"
>
  Esporta in PDF
</button>

            </div>
          </div>
        </div>

        {/* Colonna destra: spiegazione + risultati */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold">Benvenuto!</h2>
            <p className="text-sm text-gray-700">
              Questa applicazione ti aiuta a scoprire quali attività
              commerciali compaiono più spesso nei primi risultati di Google
              Maps per un determinato settore e una determinata area.
            </p>
            <h3 className="text-sm font-semibold">Come funziona (flusso iterativo)</h3>
            <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
              <li>
                <strong>Suggerimento:</strong> inserisci città, categoria e
                keyword principale. L&apos;app genera alcune keyword correlate.
              </li>
              <li>
                <strong>Analisi:</strong> perfeziona la lista (aggiungi/togli) e
                lancia l&apos;analisi finale.
              </li>
              <li>
                <strong>Affinamento:</strong> in base ai risultati, modifica le
                keyword e ripeti l&apos;analisi.
              </li>
            </ol>
            <h3 className="text-sm font-semibold">Cosa ottieni?</h3>
            <p className="text-sm text-gray-700">
              Una classifica dei leader locali basata sulle keyword scelte:
              quante volte compaiono, miglior posizione e posizione media.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Errore: {error}
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              {/* Leaderboard */}
              <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
                <h2 className="text-md font-semibold">
                  Leader locali ({analysis.city || city})
                </h2>
                <p className="text-xs text-gray-500">
                  Ordinati per numero di apparizioni e miglior posizione tra le
                  keyword analizzate.
                </p>
                <div className="mt-2 space-y-2 max-h-72 overflow-auto pr-1">
                  {analysis.leaderboard.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Nessun risultato trovato per le keyword selezionate.
                    </p>
                  )}
                  {analysis.leaderboard.map((b, idx) => (
                    <div
                      key={b.id}
                      className="rounded border px-3 py-2 text-sm flex justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold">
                          #{idx + 1} {b.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {b.address}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Keyword: {b.keywords.join(", ")}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-700">
                        <div>
                          Apparizioni:{" "}
                          <span className="font-semibold">
                            {b.appearances}
                          </span>
                        </div>
                        <div>
                          Miglior rank:{" "}
                          <span className="font-semibold">
                            #{b.bestRank}
                          </span>
                        </div>
                        <div>
                          Rank medio:{" "}
                          <span className="font-semibold">
                            {b.avgRank.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dettaglio per keyword */}
              <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
                <h2 className="text-md font-semibold">
                  Dettaglio per keyword
                </h2>
                <p className="text-xs text-gray-500">
                  Risultati grezzi per ogni keyword (prime 10 attività).
                </p>
                <div className="space-y-4 max-h-80 overflow-auto pr-1">
                  {analysis.resultsPerKeyword.map((entry) => (
                    <div key={entry.keyword} className="space-y-1">
                      <div className="font-semibold text-sm">
                        {entry.keyword}
                      </div>
                      {entry.error && (
                        <div className="text-xs text-red-600">
                          Errore per questa keyword
                        </div>
                      )}
                      {!entry.error &&
                        (entry.places || []).map((p, i) => (
                          <div
                            key={p.id}
                            className="flex justify-between rounded border px-3 py-1 text-xs"
                          >
                            <div>
                              <div className="font-medium">
                                #{i + 1} {p.displayName?.text}
                              </div>
                              <div className="text-[11px] text-gray-600">
                                {p.formattedAddress}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
