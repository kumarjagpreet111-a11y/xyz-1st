
export enum GameState {
  LOADING = 'LOADING',
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export type ModeType = 'LITE' | 'FLASH' | 'PRO';

export interface PipePair {
  x: number;
  gapTopY: number;
  passed: boolean;
}
