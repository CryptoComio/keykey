import { useCallback, useEffect, useState } from 'react';
import { KeychainViewport } from './components/KeychainViewport';
import { HeroOverlay } from './components/HeroOverlay';
import type { ClaspFinish, KeyId, LightingPreset } from './data/keysCatalog';

function getInitialFocusFromQuery(): KeyId | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const focus = params.get('focus');
  if (focus === 'prince' || focus === 'artcode' || focus === 'icon') {
    return focus;
  }
  return null;
}

export default function App() {
  const [focusedKey, setFocusedKey] = useState<KeyId | null>(getInitialFocusFromQuery);
  const [hoveredKey, setHoveredKey] = useState<KeyId | null>(null);
  const [claspFinish, setClaspFinish] = useState<ClaspFinish>('gold');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('atelier');
  const [spread, setSpread] = useState<number>(0.2);
  const [autoSway, setAutoSway] = useState<boolean>(true);
  const [dockOpen, setDockOpen] = useState<boolean>(true);
  const [resetCounter, setResetCounter] = useState<number>(0);

  const handleReset = useCallback(() => {
    setFocusedKey(null);
    setHoveredKey(null);
    setSpread(0.2);
    setResetCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocusedKey(null);
      } else if (e.key === 'h' || e.key === 'H') {
        setDockOpen((prev) => !prev);
      } else if (e.key === '1') {
        setFocusedKey('prince');
      } else if (e.key === '2') {
        setFocusedKey('artcode');
      } else if (e.key === '3') {
        setFocusedKey('icon');
      } else if (e.key === '0') {
        setFocusedKey(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-neutral-100">
      <KeychainViewport
        focusedKey={focusedKey}
        hoveredKey={hoveredKey}
        claspFinish={claspFinish}
        lightingPreset={lightingPreset}
        spread={spread}
        autoSway={autoSway}
        resetCounter={resetCounter}
        onSelectKey={setFocusedKey}
        onHoverKey={setHoveredKey}
      />
      <HeroOverlay
        focusedKey={focusedKey}
        hoveredKey={hoveredKey}
        claspFinish={claspFinish}
        lightingPreset={lightingPreset}
        spread={spread}
        autoSway={autoSway}
        dockOpen={dockOpen}
        onSelectKey={setFocusedKey}
        onChangeClaspFinish={setClaspFinish}
        onChangeLighting={setLightingPreset}
        onChangeSpread={setSpread}
        onToggleAutoSway={() => setAutoSway((s) => !s)}
        onToggleDock={() => setDockOpen((d) => !d)}
        onReset={handleReset}
      />
    </main>
  );
}
