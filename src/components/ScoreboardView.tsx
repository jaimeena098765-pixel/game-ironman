import React, { useState, useEffect } from 'react';
import { GameMode, GameStats, HighScore } from '../types';
import { Trophy, RefreshCw, LogOut, Medal, Award, Calendar, ChevronRight, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ScoreboardViewProps {
  score: number;
  stats: GameStats;
  mode: GameMode;
  categoryName: string;
  onRestart: () => void;
  onGoToMenu: () => void;
}

export default function ScoreboardView({
  score,
  stats,
  mode,
  categoryName,
  onRestart,
  onGoToMenu,
}: ScoreboardViewProps) {
  const [userName, setUserName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<HighScore[]>([]);

  // Calculate stats percentage
  const totalAnswers = stats.correctAnswers + stats.wrongAnswers;
  const accuracyStr = totalAnswers > 0 
    ? `${Math.round((stats.correctAnswers / totalAnswers) * 100)}%`
    : '100%';

  // Load leaderboard entries
  useEffect(() => {
    const stored = localStorage.getItem('photo_name_leaderboard');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as HighScore[];
        // Sort highest scores first
        setLeaderboard(parsed.sort((a, b) => b.score - a.score));
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      }
    }
  }, [isSaved]);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = userName.trim() || 'Explorer';
    
    const newEntry: HighScore = {
      id: `score_${Date.now()}`,
      name: trimmedName,
      score,
      mode,
      categoryName,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };

    const currentScores = [...leaderboard, newEntry];
    localStorage.setItem('photo_name_leaderboard', JSON.stringify(currentScores));
    
    setIsSaved(true);
    setUserName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-4 rounded-full bg-amber-50 border border-amber-200 text-amber-500 mb-4 shadow"
        >
          <Trophy className="w-12 h-12" />
        </motion.div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Challenge Completed!
        </h2>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">
          Fantastic job completing the quiz. Here is a breakdown of your score and statistics:
        </p>
      </div>

      {/* Grid Split Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
        
        {/* Left Side: Performance Metrics */}
        <div className="bg-white rounded-3xl border border-gray-250 p-6 shadow-xl space-y-6">
          <h3 className="font-extrabold text-slate-800 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Performance Breakdown
          </h3>

          <div className="flex flex-col gap-4">
            {/* Total Points */}
            <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-100/80 text-center shadow-xs">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-widest block mb-1">
                Total Score
              </span>
              <span className="text-4xl font-black text-blue-950">
                {score} <span className="text-xs text-blue-600 font-semibold">pts</span>
              </span>
            </div>

            {/* Minor stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/70 rounded-xl p-3 border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase tracking-wider">Accuracy</span>
                <span className="text-base font-black text-slate-800">{accuracyStr}</span>
              </div>
              <div className="bg-slate-50/70 rounded-xl p-3 border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase tracking-wider">Top Streak</span>
                <span className="text-base font-black text-orange-600">🔥 {stats.highestStreak}</span>
              </div>
              <div className="bg-slate-50/70 rounded-xl p-3 border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase tracking-wider">Time Spent</span>
                <span className="text-base font-black text-slate-800">{stats.totalTimeSpent}s</span>
              </div>
              <div className="bg-slate-50/70 rounded-xl p-3 border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase tracking-wider">Arena Set</span>
                <span className="text-xs font-bold text-slate-700 truncate block mt-1 px-1">
                  {categoryName}
                </span>
              </div>
            </div>

            {/* Leaderboard user name input form */}
            {!isSaved ? (
              <form onSubmit={handleSaveScore} className="border-t border-gray-100 pt-4 mt-2">
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Enter your name to save your score:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter Explorer Name..."
                    maxLength={16}
                    className="flex-1 bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-md"
                  >
                    Save Rank
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-blue-50 border border-blue-150 p-3 rounded-xl flex items-center gap-2 text-blue-800 text-xs mt-2 font-semibold shadow-xs">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Your high score has been logged on the leaderboard!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Local Leaderboard Hall of Fame */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex flex-col justify-between self-stretch">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Leaderboard Hall of Fame
            </h3>

            {leaderboard.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 italic">Leaderboard is currently empty. Be the first to register!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {leaderboard.slice(0, 5).map((entry, idx) => {
                  const isTop3 = idx < 3;
                  const medalColors = ['text-amber-500', 'text-slate-400', 'text-orange-500'];

                  return (
                    <div 
                      key={entry.id || idx} 
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                    >
                      <div className="flex items-center gap-2.5">
                        {isTop3 ? (
                          <Medal className={`w-4 h-4 shrink-0 ${medalColors[idx]}`} />
                        ) : (
                          <span className="w-4 text-center text-[10px] font-bold text-slate-400">{idx + 1}</span>
                        )}
                        <div>
                          <strong className="text-xs text-slate-800 font-extrabold">{entry.name}</strong>
                          <span className="text-[9px] text-slate-400 block tracking-normal uppercase">
                            {entry.categoryName} • {entry.mode.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <strong className="text-xs font-black text-slate-900">{entry.score} pts</strong>
                        <span className="text-[8px] text-slate-400 flex items-center gap-0.5 justify-end mt-0.5">
                          <Calendar className="w-2 h-2" />
                          {entry.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-4 mt-2">
            Only top 5 absolute records shown. Score high to grab your gold!
          </div>
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          Play Challenge Again
        </button>

        <button
          type="button"
          onClick={onGoToMenu}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl border border-slate-250 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <LogOut className="w-4 h-4" />
          Return to Categories
        </button>
      </div>
    </div>
  );
}
