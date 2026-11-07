import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { IdentifyResult, Idea, Img, VerifyResult } from './api';
import { levelFor, saplingsFor } from './levels';

export type Choice = 'upcycle' | 'recycle' | 'trash';

export interface SavedItem {
  id: string;
  at: number;
  name: string;
  material: string;
  materialLabel: string;
  choice: Choice;
  avoidedG: number;
  waterL: number;
  ideaTitle?: string;
}

interface Flow {
  photo: Img | null;           // kısa ömürlü; kalıcı depoya yazılmaz
  scan: IdentifyResult | null;
  idea: Idea | null;
  preview: Img | null;
  verify: VerifyResult | null;
  lastAwardG: number;
  lastAwardL: number;
  levelBefore: number;
  saplingsBefore: number;
}

interface State extends Flow {
  items: SavedItem[];
  avoidedG: number;
  waterL: number;
  name: string;
  joinedAt: number;
  setName: (n: string) => void;
  setFlow: (p: Partial<Flow>) => void;
  resetFlow: () => void;
  record: (choice: Choice) => SavedItem | null;
  /** Seçimi tamamlar: seviye/fidan önceki durumunu saklar ve eşyayı kaydeder. */
  complete: (choice: Choice) => void;
  clearAll: () => void;
}

const emptyFlow: Flow = { photo: null, scan: null, idea: null, preview: null, verify: null, lastAwardG: 0, lastAwardL: 0, levelBefore: 1, saplingsBefore: 0 };

export function awardFor(scan: IdentifyResult, choice: Choice) {
  if (choice === 'upcycle') return { g: scan.carbon.avoided.upcycleG, l: scan.carbon.water.savedUpcycleL };
  if (choice === 'recycle') return { g: scan.carbon.avoided.recycleG, l: scan.carbon.water.savedRecycleL };
  return { g: 0, l: 0 };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...emptyFlow,
      items: [],
      avoidedG: 0,
      waterL: 0,
      name: '',
      joinedAt: Date.now(),
      setName: (n) => set({ name: n.slice(0, 32) }),
      setFlow: (p) => set(p),
      resetFlow: () => set(emptyFlow),
      record: (choice) => {
        const scan = get().scan;
        if (!scan) return null;
        const a = awardFor(scan, choice);
        const item: SavedItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          at: Date.now(),
          name: scan.item.name,
          material: scan.item.material,
          materialLabel: scan.carbon.materialLabel,
          choice,
          avoidedG: a.g,
          waterL: a.l,
          ideaTitle: choice === 'upcycle' ? get().idea?.title_tr : undefined,
        };
        set((s) => ({ items: [item, ...s.items].slice(0, 300), avoidedG: s.avoidedG + a.g, waterL: Math.round((s.waterL + a.l) * 10) / 10, lastAwardG: a.g, lastAwardL: a.l }));
        return item;
      },
      complete: (choice) => {
        const g = get().avoidedG;
        set({ verify: null, levelBefore: levelFor(g).n, saplingsBefore: saplingsFor(g), lastAwardG: 0, lastAwardL: 0 });
        get().record(choice);
      },
      clearAll: () => set({ ...emptyFlow, items: [], avoidedG: 0, waterL: 0, joinedAt: Date.now() }),
    }),
    {
      name: 'adacik-v1',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items, avoidedG: s.avoidedG, waterL: s.waterL, name: s.name, joinedAt: s.joinedAt }),
      migrate: (persisted) => {
        const p = (persisted ?? {}) as { items?: Partial<SavedItem>[]; avoidedG?: number; waterL?: number; name?: string; joinedAt?: number };
        const items = (p.items ?? []).map((i) => ({ waterL: 0, materialLabel: i.material ?? '', ...i })) as SavedItem[];
        return { items, avoidedG: p.avoidedG ?? 0, waterL: p.waterL ?? 0, name: p.name ?? '', joinedAt: p.joinedAt ?? Date.now() } as unknown as State;
      },
    },
  ),
);
