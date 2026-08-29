export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 lg:p-20 selection:bg-primary selection:text-stone-950">
      {/* Decorative Gold Header Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-6 border-b border-border">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            Sacred Art & Classical Carnatic Music
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide mt-1 text-foreground">
            Lalita Kapilavai
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs tracking-wider">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Next.js 16 • React 19 • pgvector
          </span>
        </div>
      </header>

      {/* Main Hero & Architectural Showcase */}
      <main className="w-full max-w-6xl my-auto py-12 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium w-fit border border-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Infrastructure Initialized & Online
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
            Preserving Sacred Heritage Through{" "}
            <span className="text-primary underline decoration-primary/40 underline-offset-8">
              Gold Leaf & Ragas
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            A digital sanctum honoring traditional Indian Tanjore paintings with 22k gold foil, 
            Mysore classical styles, and sacred Carnatic vocal archives—linked via multi-modal 
            vector embeddings and relational knowledge graphs.
          </p>

          {/* Core Feature Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-lg bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
              <h3 className="font-serif font-semibold text-foreground text-sm">Tanjore & Mysore Art</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                High-resolution protected catalog with dynamic watermarking.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
              <h3 className="font-serif font-semibold text-foreground text-sm">Carnatic Recitals</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                Synesthetic audio player pairing visual motifs with melodic ragas.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
              <h3 className="font-serif font-semibold text-foreground text-sm">Graphify & pgvector</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                PostgreSQL 17 vector similarity for multi-modal exploration.
              </p>
            </div>
          </div>
        </div>

        {/* Traditional Visual Framing Card */}
        <div className="w-full max-w-md lg:max-w-sm rounded-xl p-6 bg-card border-2 border-primary/40 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[11px] uppercase tracking-widest text-primary font-semibold">
            Digital Archive Status
          </span>
          <h4 className="text-lg font-serif font-bold text-foreground mt-1">
            System & Database Matrix
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Framework:</span>
              <span className="font-mono text-foreground">Next.js 16.3 (App Router)</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>UI Runtime:</span>
              <span className="font-mono text-foreground">React 19.2</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Styling:</span>
              <span className="font-mono text-foreground">Tailwind CSS v4</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Database:</span>
              <span className="font-mono text-foreground">PostgreSQL 17 + pgvector</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Containerization:</span>
              <span className="font-mono text-foreground">Multi-stage Alpine Docker</span>
            </li>
            <li className="flex justify-between py-1">
              <span>Deployment:</span>
              <span className="font-mono text-foreground">Coolify Automated VPS</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <div>
          © {new Date().getFullYear()} Lalita Kapilavai. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span>Tanjore & Mysore Traditional Art</span>
          <span>•</span>
          <span>Carnatic Vocal Archive</span>
        </div>
      </footer>
    </div>
  );
}
