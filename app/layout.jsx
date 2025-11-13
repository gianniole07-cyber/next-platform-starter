import "./globals.css";

export const metadata = {
  title: "Italiaonline – GBP Rank Analyzer",
  description: "Analizzatore professionale del ranking locale su Google Maps",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gradient-to-br from-[#1B4ACB] to-[#9C1AA3] text-white">
        <header className="w-full py-4 shadow-lg bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
            {/* LOGO + BRAND */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1B4ACB]" />
              <div className="w-3 h-3 rounded-full bg-[#9C1AA3]" />
              <span className="font-bold text-lg tracking-wide">
                Italiaonline · GBP Analyzer
              </span>
            </div>

            {/* MENU */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <a href="/" className="hover:text-yellow-300 transition">Home</a>
              <a href="/rank" className="hover:text-yellow-300 transition">Analisi Ranking</a>
              <a href="https://www.italiaonline.it" target="_blank" className="hover:text-yellow-300 transition">
                Italiaonline
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
