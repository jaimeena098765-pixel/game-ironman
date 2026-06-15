export type GameMode = 'multiple-choice' | 'spelling' | 'grid-match';

export interface GameItem {
  id: string;
  name: string;
  imageUrl: string;
  clue: string;
  choices?: string[]; // Multiple choice options
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string; // Name of lucide-react icon
  items: GameItem[];
  isCustom?: boolean;
}

export interface HighScore {
  id: string;
  name: string;
  score: number;
  mode: GameMode;
  categoryName: string;
  date: string;
}

export interface GameStats {
  correctAnswers: number;
  wrongAnswers: number;
  totalTimeSpent: number;
  highestStreak: number;
}
