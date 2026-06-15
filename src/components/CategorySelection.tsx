import React, { useState } from 'react';
import { Category, GameMode } from '../types';
import { INITIAL_CATEGORIES } from '../data';
import { PawPrint, MapPin, Apple, Orbit, Sparkles, Trophy, Play, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

// Dynamic helper to match icon names to Lucide icons
const IconMap: Record<string, React.ComponentType<any>> = {
  PawPrint,
  MapPin,
  Apple,
  Orbit,
};

interface CategorySelectionProps {
  onSelectCategory: (category: Category, mode: GameMode) => void;
  customCategories: Category[];
  onAddCustomCategory: (category: Category) => void;
  onShowHighScores: () => void;
}

export default function CategorySelection({
  onSelectCategory,
  customCategories,
  onAddCustomCategory,
  onShowHighScores,
}: CategorySelectionProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');
  const [selectedMode, setSelectedMode] = useState<GameMode>('multiple-choice');
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorInput, setErrorInput] = useState<string | null>(null);

  const categoriesToRender = activeTab === 'standard' ? INITIAL_CATEGORIES : customCategories;

  const handleGenerateCustomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setErrorInput(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/generate-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error of custom category generation');
      }

      const data = await res.json();
      if (data.category) {
        const newCat: Category = {
          ...data.category,
          id: `custom_${Date.now()}`,
          icon: 'Sparkles',
          isCustom: true,
        };
        onAddCustomCategory(newCat);
        setCustomTopic('');
        setErrorInput(null);
        // Transition and immediately launch it!
        onSelectCategory(newCat, selectedMode);
      } else {
        throw new Error('Malformed category returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorInput(err?.message || 'Failed connecting to the category generator. Try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Welcome Unit */}
      <div className="text-center mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          Professional Session Coach
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">
          FaceRecall <span className="text-blue-600 block sm:inline">Pro Matcher</span>
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base">
          An elevated visual training suite. Test pattern association using built-in corporate themes or enter topics to dynamically trigger Gemini live training sets!
        </p>
      </div>

      {/* Main Mode Picker Panel */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-8 mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center sm:text-left">
          Step 1: Choose Your Cognitive Mode
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* MULTIPLE CHOICE */}
          <button
            type="button"
            onClick={() => setSelectedMode('multiple-choice')}
            className={`flex flex-col items-center sm:items-start p-5 rounded-2xl border text-left transition-all duration-250 ${
              selectedMode === 'multiple-choice'
                ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                selectedMode === 'multiple-choice' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
              }`}>
                Classic Choice
              </span>
              <span className="text-xs text-slate-400">⏱️ Multi-Choice</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Multiple Choice</h4>
            <p className="text-xs text-slate-500 leading-normal text-center sm:text-left">
              Match images to labels from four choices. Ideal for quick round pacing.
            </p>
          </button>

          {/* SPELLING MODE */}
          <button
            type="button"
            onClick={() => setSelectedMode('spelling')}
            className={`flex flex-col items-center sm:items-start p-5 rounded-2xl border text-left transition-all duration-250 ${
              selectedMode === 'spelling'
                ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                selectedMode === 'spelling' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
              }`}>
                Spelling Coach
              </span>
              <span className="text-xs text-slate-400">⌨️ Keyboard Alpha</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Spelling Master</h4>
            <p className="text-xs text-slate-500 leading-normal text-center sm:text-left">
              Type correct name characters. Read clues and build exact vocabulary matches.
            </p>
          </button>

          {/* MEMORY GRID MATCH */}
          <button
            type="button"
            onClick={() => setSelectedMode('grid-match')}
            className={`flex flex-col items-center sm:items-start p-5 rounded-2xl border text-left transition-all duration-250 ${
              selectedMode === 'grid-match'
                ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                selectedMode === 'grid-match' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
              }`}>
                Memory Arena
              </span>
              <span className="text-xs text-slate-400">🎴 Pair Grid</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Memory Grid Pairs</h4>
            <p className="text-xs text-slate-500 leading-normal text-center sm:text-left">
              Flip to pair photos with complementary names. Exceptional for mental recall.
            </p>
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-150 gap-3">
          <div className="text-xs text-slate-500">
            Selected challenge setting: <strong className="text-blue-700 capitalize">{selectedMode.replace('-', ' ')}</strong>
          </div>
          <button
            type="button"
            onClick={onShowHighScores}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            View Game High Scores
          </button>
        </div>
      </div>

      {/* Categories Workspace */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        Step 2: Choose or Generate a Challenge Category
      </h3>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('standard')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'standard'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Play className="w-4 h-4" />
          Standard Categories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'custom'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          Dynamic AI Category Builder ({customCategories.length})
        </button>
      </div>

      {activeTab === 'custom' && (
        <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 md:p-8 mb-6 shadow-xs">
          <h4 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Custom Category Generator
          </h4>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Type any physical theme (e.g., <em>"Classic Sports Cars"</em>, <em>"Feline Companions"</em>, <em>"Tropical Fruits"</em>). Our server proxy triggers a Gemini API request to construct educational question clues, random multiple choice option pools, and specific photograph metadata instantly!
          </p>

          <form onSubmit={handleGenerateCustomCategory} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Type target quiz topic (e.g. World Architecture, Wild Cats...)"
                disabled={isGenerating}
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-850 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isGenerating || !customTopic.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>

            {errorInput && (
              <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2.5 mt-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorInput}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {categoriesToRender.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-white shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-800 mb-1">No Custom Challenge Packs Generated Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Type a topic concept inside the generator form above to generate your first custom session!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categoriesToRender.map((category) => {
            const IconComponent = IconMap[category.icon] || Sparkles;
            return (
              <motion.div
                key={category.id}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="bg-white border hover:border-gray-300 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-250 flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{category.name}</h4>
                      <span className="text-2xs text-blue-700 font-bold bg-blue-100/60 px-2 py-0.5 rounded">
                        {category.items.length} training items
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                </div>

                <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {category.isCustom ? '💎 AI Spec' : '📦 CORE SYSTEM'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(category, selectedMode)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-blue-100"
                  >
                    Start Training
                    <Play className="w-3 h-3 fill-blue-700 text-blue-700" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
