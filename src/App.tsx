import React, { useState, useEffect } from 'react';
import { Category, GameMode, GameStats, HighScore } from './types';
import CategorySelection from './components/CategorySelection';
import GameView from './components/GameView';
import ScoreboardView from './components/ScoreboardView';
import { Trophy, ArrowLeft, Trash2, Calendar, Medal, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [view, setView] = useState<'selection' | 'game' | 'scoreboard' | 'leaderboard'>('selection');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode>('multiple-choice');
  
  // Game scores & metrics
  const [finalScore, setFinalScore] = useState(0);
  const [finalStats, setFinalStats] = useState<GameStats>({
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeSpent: 0,
    highestStreak: 0,
  });

  // Client-persisted AI Categories
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [leaderboard, setLeaderboard] = useState<HighScore[]>([]);

  // Load categories and scoreboard from LocalStorage on mount
  useEffect(() => {
    const savedCustom = localStorage.getItem('photo_name_custom_categories');
    if (savedCustom) {
      try {
        setCustomCategories(JSON.parse(savedCustom));
      } catch (e) {
        console.error('Error parsing custom configurations:', e);
      }
    }

    const savedScores = localStorage.getItem('photo_name_leaderboard');
    if (savedScores) {
      try {
        setLeaderboard(JSON.parse(savedScores));
      } catch (e) {
        console.error('Error parsing scoreboard:', e);
      }
    }
  }, []);

  const handleSelectCategory = (category: Category, mode: GameMode) => {
    setActiveCategory(category);
    setActiveMode(mode);
    setView('game');
  };

  const handleAddCustomCategory = (newCat: Category) => {
    const list = [newCat, ...customCategories];
    setCustomCategories(list);
    localStorage.setItem('photo_name_custom_categories', JSON.stringify(list));
  };

  const handleFinishGame = (score: number, stats: GameStats) => {
    setFinalScore(score);
    setFinalStats(stats);
    setView('scoreboard');
    
    // Refresh high scores list
    const savedScores = localStorage.getItem('photo_name_leaderboard');
    if (savedScores) {
      try {
        setLeaderboard(JSON.parse(savedScores));
      } catch (e) {}
    }
  };

  const handleClearScores = () => {
    if (confirm('Are you absolute sure you want to clear the entire scoreboard? This action is irreversible.')) {
      localStorage.removeItem('photo_name_leaderboard');
      setLeaderboard([]);
    }
  };

  const handleClearCustomQuizzes = () => {
    if (confirm('Are you absolute sure you want to delete all dynamic custom categories?')) {
      localStorage.removeItem('photo_name_custom_categories');
      setCustomCategories([]);
    }
  };

  const handleRestartCurrent = () => {
    if (activeCategory) {
      setView('game');
    } else {
      setView('selection');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* Decorative Brand Top Bar */}
      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView('selection')}
            className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
          >
            <span className="text-xl">🎨</span>
            <div>
              <span className="font-extrabold text-sm md:text-base text-slate-950 tracking-tight block leading-none">
                Photo & Name Game
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-normal block mt-0.5">
                Enhanced Edition
              </span>
            </div>
          </button>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-3">
            {view === 'selection' && customCategories.length > 0 && (
              <button
                type="button"
                onClick={handleClearCustomQuizzes}
                className="text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-100 transition-colors cursor-pointer"
              >
                Clear Custom Quizzes
              </button>
            )}
            <button
              type="button"
              onClick={() => setView('leaderboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-250 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              Leaderboard
            </button>
          </div>
        </div>
      </header>

      {/* Primary Workspace Panel */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <CategorySelection
                onSelectCategory={handleSelectCategory}
                customCategories={customCategories}
                onAddCustomCategory={handleAddCustomCategory}
                onShowHighScores={() => setView('leaderboard')}
              />
            </motion.div>
          )}

          {view === 'game' && activeCategory && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <GameView
                category={activeCategory}
                mode={activeMode}
                onExit={() => setView('selection')}
                onFinish={handleFinishGame}
              />
            </motion.div>
          )}

          {view === 'scoreboard' && activeCategory && (
            <motion.div
              key="scoreboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ScoreboardView
                score={finalScore}
                stats={finalStats}
                mode={activeMode}
                categoryName={activeCategory.name}
                onRestart={handleRestartCurrent}
                onGoToMenu={() => setView('selection')}
              />
            </motion.div>
          )}

          {view === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto px-4 py-10"
            >
              <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-md">
                
                {/* Header detail */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setView('selection')}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Hall of Fame
                  </h3>

                  {leaderboard.length > 0 ? (
                    <button
                      type="button"
                      onClick={handleClearScores}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reset List
                    </button>
                  ) : (
                    <div className="w-12 h-4" />
                  )}
                </div>

                {/* Score list display */}
                {leaderboard.length === 0 ? (
                  <div className="text-center py-16">
                    <HelpCircle className="w-12 h-12 text-slate-350 mx-auto mb-4" />
                    <h4 className="font-extrabold text-slate-700 text-sm mb-1">No Records Registered Yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Choose any category matching mode, play rounds, and log your custom record scores here!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                    {leaderboard
                      .sort((a,b) => b.score - a.score)
                      .map((entry, idx) => {
                        const isTop3 = idx < 3;
                        const colors = ['bg-amber-100 text-amber-800 border-amber-300', 'bg-slate-100 text-slate-800 border-slate-300', 'bg-orange-100 text-orange-800 border-orange-300'];
                        const medalColors = ['text-amber-500', 'text-slate-400', 'text-orange-500'];

                        return (
                          <div 
                            key={entry.id || idx}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                              isTop3 ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50/50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isTop3 ? (
                                <div className={`p-1.5 rounded-full border ${colors[idx]}`}>
                                  <Medal className="w-4 h-4 shrink-0" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                                  {idx + 1}
                                </div>
                              )}
                              
                              <div>
                                <span className="font-extrabold text-xs md:text-sm text-slate-900 block leading-tight">
                                  {entry.name}
                                </span>
                                <span className="text-[10px] text-slate-500 capitalize tracking-wide block mt-0.5">
                                  Category: {entry.categoryName} • Mode: {entry.mode.replace('-', ' ')}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-slate-900 block leading-tight">
                                {entry.score} pts
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 justify-end">
                                <Calendar className="w-3 h-3" />
                                {entry.date}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Compact clean semantic footer matching Anti-Telemetry Guidelines */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Photo & Name Game Matcher • Learn vocabulary through interactive visual matching.
          </div>
          <div>
            Designed with high-contrast accessibility.
          </div>
        </div>
      </footer>
    </div>
  );
}
