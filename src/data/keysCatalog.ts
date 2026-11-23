export type KeyId = 'prince' | 'artcode' | 'icon';
export type ClaspFinish = 'chrome' | 'gold';
export type LightingPreset = 'atelier' | 'noir';

export interface KeyCatalogItem {
  id: KeyId;
  indexLabel: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  materials: string;
  craftsmanship: string;
  description: string;
  restAngleZ: number;
  restTwistY: number;
  restDepthZ: number;
  ringAttachAngle: number;
}

export const KEYS_CATALOG: KeyCatalogItem[] = [
  {
    id: 'prince',
    indexLabel: '01',
    title: 'Prince Art Gallery',
    subtitle: 'Circular Seal Medallion Key',
    category: 'Fine Art & Curation',
    year: 'N° 01',
    materials: 'Burnished Bronze · Guilloché Enamel · Spiral Column Stem',
    craftsmanship: 'Grand circular coin medallion with cardinal pearl studs and spiral-fluted shaft.',
    description:
      'A grand circular seal medallion sculpted in burnished bronze around a baked obsidian guilloché enamel crest, finished with cardinal pearl studs, a spiral-fluted shaft, and pierced baroque bit.',
    restAngleZ: -0.74,
    restTwistY: 0.04,
    restDepthZ: 0.14,
    ringAttachAngle: -0.66,
  },
  {
    id: 'artcode',
    indexLabel: '02',
    title: 'Art Code',
    subtitle: "Casa d'Aste · Capsule Key",
    category: "Casa d'Aste",
    year: 'N° 02',
    materials: 'Satin Black Slate · Turned Gavel Bolster · Baluster Stem',
    craftsmanship: 'Rounded architectural stadium capsule with clamping waist lugs and scrolled key bit.',
    description:
      'A sleek stadium-capsule architectural key for Art Code Casa d’Aste, crowned with a compact auctioneer’s gavel bolster and brushed bronze rail framing a satin blackened slate plaque.',
    restAngleZ: 0.02,
    restTwistY: 0.0,
    restDepthZ: 0.0,
    ringAttachAngle: 0.0,
  },
  {
    id: 'icon',
    indexLabel: '03',
    title: 'IconArt Magazine',
    subtitle: 'Special Issue N°01 Key',
    category: 'Editorial & Publishing',
    year: 'N° 03',
    materials: 'Woven Charcoal Linen · Raised Bauhaus Relief · Bronze Corners',
    craftsmanship: 'Broad rectilinear folio silhouette with riveted bronze corners, masthead foil, and comb bit.',
    description:
      'A broad hardcover special issue forged in woven charcoal linen and burnished bronze, paired with a compact 3D Cubist relief emblem, riveted corner armor plates, and architectural comb teeth.',
    restAngleZ: 0.72,
    restTwistY: -0.04,
    restDepthZ: -0.14,
    ringAttachAngle: 0.64,
  },
];

export function getKeyById(id: KeyId): KeyCatalogItem {
  return KEYS_CATALOG.find((item) => item.id === id) ?? KEYS_CATALOG[0];
}
