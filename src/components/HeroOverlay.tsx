import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, RotateCcw, X } from 'lucide-react';
import {
  KEYS_CATALOG,
  getKeyById,
  type ClaspFinish,
  type KeyId,
  type LightingPreset,
} from '../data/keysCatalog';

export interface HeroOverlayProps {
  focusedKey: KeyId | null;
  hoveredKey: KeyId | null;
  claspFinish: ClaspFinish;
  lightingPreset: LightingPreset;
  spread: number;
  autoSway: boolean;
  dockOpen: boolean;
  onSelectKey: (keyId: KeyId | null) => void;
  onChangeClaspFinish: (finish: ClaspFinish) => void;
  onChangeLighting: (preset: LightingPreset) => void;
  onChangeSpread: (spread: number) => void;
  onToggleAutoSway: () => void;
  onToggleDock: () => void;
  onReset: () => void;
}

export function HeroOverlay({
  focusedKey,
  hoveredKey,
  claspFinish,
  lightingPreset,
  spread,
  autoSway,
  dockOpen,
  onSelectKey,
  onChangeClaspFinish,
  onChangeLighting,
  onChangeSpread,
  onToggleAutoSway,
  onToggleDock,
  onReset,
}: HeroOverlayProps) {
  const activeKeyData = focusedKey ? getKeyById(focusedKey) : null;
  const hoveredKeyData = hoveredKey && !focusedKey ? getKeyById(hoveredKey) : null;

  const cycleFocusedKey = (dir: -1 | 1) => {
    if (!focusedKey) {
      onSelectKey(KEYS_CATALOG[0].id);
      return;
    }
    const idx = KEYS_CATALOG.findIndex((k) => k.id === focusedKey);
    const nextIdx = (idx + dir + KEYS_CATALOG.length) % KEYS_CATALOG.length;
    onSelectKey(KEYS_CATALOG[nextIdx].id);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between">
      {/* Top Minimal Editorial Bar (3-zone contract echoing wildyriftian.com) */}
      <header className="pointer-events-auto flex w-full items-center justify-between gap-4 px-5 py-5 sm:px-10 sm:py-6">
        <button
          type="button"
          onClick={() => onSelectKey(null)}
          className="cursor-pointer whitespace-nowrap shrink-0 font-mono text-xs tracking-[0.22em] text-neutral-100 transition-colors hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        >
          ATELIER KEYS
        </button>

        <nav
          aria-label="Keychain collection navigation"
          className="hidden items-center gap-7 md:flex lg:gap-12"
        >
          {KEYS_CATALOG.map((item) => {
            const isSelected = focusedKey === item.id;
            const isHovered = hoveredKey === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectKey(isSelected ? null : item.id)}
                className={`cursor-pointer whitespace-nowrap shrink-0 border-b pb-0.5 font-mono text-[11px] tracking-[0.22em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
                  isSelected
                    ? 'border-amber-400 text-amber-300'
                    : isHovered
                    ? 'border-white/50 text-white'
                    : 'border-transparent text-neutral-300 hover:border-white/40 hover:text-white'
                }`}
              >
                {item.title.toUpperCase()}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer whitespace-nowrap shrink-0 font-mono text-[11px] tracking-[0.22em] text-neutral-300 transition-colors hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        >
          RESET VIEW
        </button>
      </header>

      {/* Mid-Height Side Captions (Exact wildyriftian.com framing) */}
      <div className="relative flex flex-1 items-center justify-between px-6 sm:px-10">
        {!focusedKey && (
          <p className="hidden select-none font-mono text-[11px] tracking-[0.22em] text-neutral-400 lg:block">
            A COLLECTION OF SCULPTED KEYS
          </p>
        )}

        {/* Subtle Hover Whisper below keychain when hovering a 3D key */}
        {hoveredKeyData && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
            <span className="font-mono text-[11px] tracking-[0.24em] text-amber-300/90">
              {hoveredKeyData.indexLabel} · {hoveredKeyData.title.toUpperCase()} — CLICK TO INSPECT
            </span>
          </div>
        )}

        {!focusedKey && (
          <p className="ml-auto hidden select-none font-mono text-[11px] tracking-[0.22em] text-neutral-400 lg:block">
            CURATED SERIES 2026
          </p>
        )}

        {/* Focused Key Detail Panel (Right flank on desktop, compact bottom drawer on mobile) */}
        {activeKeyData && (
          <aside
            aria-label={`${activeKeyData.title} inspection details`}
            className="pointer-events-auto ml-auto mt-auto w-full max-w-sm border border-white/12 bg-neutral-950/92 p-5 shadow-2xl sm:my-auto sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-amber-400">
                  {activeKeyData.indexLabel} · {activeKeyData.category}
                </p>
                <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-neutral-50">
                  {activeKeyData.title}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => onSelectKey(null)}
                aria-label="Close key inspection"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-white/12 text-neutral-300 transition-colors hover:border-amber-400/60 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              {activeKeyData.description}
            </p>

            <div className="mt-4 space-y-2 border-t border-white/10 pt-3.5 text-xs">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.18em] text-neutral-500">
                  SILHOUETTE
                </span>
                <span className="text-right text-neutral-200">
                  {activeKeyData.subtitle}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.18em] text-neutral-500">
                  FINISH
                </span>
                <span className="text-right text-neutral-200">
                  {activeKeyData.materials}
                </span>
              </div>
              <p className="pt-1 font-mono text-[10px] tracking-[0.14em] text-neutral-400">
                DRAG HORIZONTALLY TO ROTATE 360°
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => cycleFocusedKey(-1)}
                  aria-label="Previous key"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center border border-white/14 text-neutral-200 transition-colors hover:border-amber-400/60 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => cycleFocusedKey(1)}
                  aria-label="Next key"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center border border-white/14 text-neutral-200 transition-colors hover:border-amber-400/60 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSelectKey(null)}
                className="cursor-pointer whitespace-nowrap border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-amber-300 transition-colors hover:bg-amber-400/20 focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                ALL KEYS
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Zone: Subtle Cue + Collapsible Studio Control Dock */}
      <div className="pointer-events-none flex flex-col items-center pb-4 sm:pb-5">
        {!dockOpen && !focusedKey && (
          <p className="mb-2 select-none text-center font-mono text-[10px] tracking-[0.22em] text-neutral-400">
            DRAG TO SWING · CLICK A KEY TO INSPECT
          </p>
        )}

        <div className="pointer-events-auto flex flex-col items-center">
          <button
            type="button"
            onClick={onToggleDock}
            aria-expanded={dockOpen}
            className="flex cursor-pointer items-center gap-1.5 border border-white/12 bg-neutral-950/92 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.18em] text-neutral-300 transition-colors hover:border-amber-400/50 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            {dockOpen ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>HIDE CONTROLS</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>STUDIO CONTROLS</span>
              </>
            )}
          </button>

          {dockOpen && (
            <div
              role="region"
              aria-label="3D Keychain Studio Controls"
              className="mt-1.5 flex max-w-[94vw] flex-wrap items-center justify-center gap-x-5 gap-y-2.5 border border-white/12 bg-neutral-950/95 px-4 py-3 shadow-2xl sm:px-5"
            >
              {/* Quick Key Focus Tabs */}
              <div className="flex items-center gap-1 border border-white/10 bg-black/60 p-1">
                <button
                  type="button"
                  onClick={() => onSelectKey(null)}
                  className={`cursor-pointer whitespace-nowrap px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] transition-colors ${
                    focusedKey === null
                      ? 'bg-amber-400 text-black font-medium'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  ALL
                </button>
                {KEYS_CATALOG.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectKey(item.id)}
                    className={`cursor-pointer whitespace-nowrap px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                      focusedKey === item.id
                        ? 'bg-amber-400 text-black font-medium'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {item.indexLabel} {item.id === 'prince' ? 'PRINCE' : item.id === 'artcode' ? 'ART CODE' : 'ICONART'}
                  </button>
                ))}
              </div>

              {/* Key Spread Slider */}
              <label className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.16em] text-neutral-300">
                <span className="whitespace-nowrap">SPREAD</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(spread * 100)}
                  onChange={(e) => onChangeSpread(Number(e.target.value) / 100)}
                  aria-label="Key spread angle"
                  className="studio-slider w-20 sm:w-24"
                />
                <span className="w-7 text-right tabular-nums text-neutral-400">
                  {Math.round(spread * 100)}%
                </span>
              </label>

              {/* Clasp Finish Toggle */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] tracking-[0.16em] text-neutral-400">
                  CLASP
                </span>
                <div className="flex border border-white/10 bg-black/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeClaspFinish('chrome')}
                    className={`cursor-pointer whitespace-nowrap px-2 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                      claspFinish === 'chrome'
                        ? 'bg-neutral-200 text-black font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    CHROME
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeClaspFinish('gold')}
                    className={`cursor-pointer whitespace-nowrap px-2 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                      claspFinish === 'gold'
                        ? 'bg-amber-400 text-black font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    BRONZE
                  </button>
                </div>
              </div>

              {/* Lighting Preset Toggle */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] tracking-[0.16em] text-neutral-400">
                  LIGHT
                </span>
                <div className="flex border border-white/10 bg-black/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeLighting('atelier')}
                    className={`cursor-pointer whitespace-nowrap px-2 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                      lightingPreset === 'atelier'
                        ? 'bg-neutral-200 text-black font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ATELIER
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeLighting('noir')}
                    className={`cursor-pointer whitespace-nowrap px-2 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                      lightingPreset === 'noir'
                        ? 'bg-neutral-200 text-black font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    NOIR
                  </button>
                </div>
              </div>

              {/* Auto-Sway & Reset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleAutoSway}
                  aria-pressed={autoSway}
                  className={`cursor-pointer whitespace-nowrap border px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] transition-colors ${
                    autoSway
                      ? 'border-amber-400/50 bg-amber-400/12 text-amber-300'
                      : 'border-white/12 text-neutral-400 hover:text-white'
                  }`}
                >
                  SWAY {autoSway ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  aria-label="Reset keychain swing and camera"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center border border-white/12 text-neutral-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
