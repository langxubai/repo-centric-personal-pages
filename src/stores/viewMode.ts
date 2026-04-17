import { atom } from 'nanostores';

/**
 * Global view mode toggle for project pages.
 * 'blueprint' = Presentation View (topology graph)
 * 'journey'   = Process View (commit timeline)
 */
export const viewMode = atom<'blueprint' | 'journey'>('blueprint');
