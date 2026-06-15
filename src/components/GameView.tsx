import React, { useState, useEffect, useRef } from 'react';
import { Category, GameMode, GameItem, GameStats } from '../types';
import { 
  playCorrectSound, 
  playWrongSound, 
  playFanfareSound 
} from '../utils/audio';
import { 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Timer, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  HelpCircle as HintIcon,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Memory match card interface
interface GridCard {
  id: string; // unique card element id, e.g. "photo_a1" or "name_a1"
  itemId: string; // match item reference id
  type: 'photo' | 'name';
  content: string; // image URL or Name string
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameViewProps {
  category: Category;
  mode: GameMode;
  onExit: () => void;
  onFinish: (score: number, stats: GameStats) => void;
}

export default function GameView({
  category,
  mode,
  onExit,
  onFinish,
}: GameViewProps) {
  const items = category.items;
  
  // Basic states for quiz modes
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Phase states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintsUsedThisRound, setHintsUsedThisRound] = useState(0);
  const [showHintText, setShowHintText] = useState(false);

  // Spelling mode states
  const [spellingInput, setSpellingInput] = useState<string[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  // Memory matching mode state
  const [gridCards, setGridCards] = useState<GridCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]); // index of clicked cards
  const [matchesCount, setMatchesCount] = useState(0);

  // Timing metrics
  const [timeLeft, setTimeLeft] = useState(30); // 30s per question or for memory match
  const maxTime = mode === 'grid-match' ? 90 : 30; // More time for memory puzzle
  const timeAllocated = useRef(maxTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeSpent = useRef(0);

  const currentItem = items[currentIndex];

  // Initialize Timer per Round
  useEffect(() => {
    setTimeLeft(mode === 'grid-match' ? 90 : 30);
    timeAllocated.current = mode === 'grid-match' ? 90 : 30;

    // Reset round states
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setShowHintText(false);
    setHintsUsedThisRound(0);

    if (currentItem && mode === 'spelling') {
      setSpellingInput(Array(currentItem.name.length).fill(''));
      setRevealedIndices([]);
    }

    // Set countdown interval
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        totalTimeSpent.current += 1;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, mode]);

  // Handle timeout
  const handleTimeOut = () => {
    if (mode === 'grid-match') {
      // End full game
      playWrongSound();
      handleGameComplete();
    } else {
      // Fail current question
      playWrongSound();
      setIsAnswered(true);
      setIsCorrect(false);
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
    }
  };

  // Keyboard support for spelling mode
  useEffect(() => {
    if (mode !== 'spelling' || isAnswered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      // Only single alphabetic characters or space
      if (/^[A-Z0-9 ]$/.test(char) && char.length === 1) {
        fillNextEmptySlot(char);
      } else if (e.key === 'Backspace') {
        removeLastFilledSlot();
      } else if (e.key === 'Enter') {
        handleSubmitSpelling();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spellingInput, mode, isAnswered, currentIndex]);

  // Setup Grid Match card matrix
  useEffect(() => {
    if (mode !== 'grid-match') return;

    // Duplicate list items to create separate visual photo and textual name cards
    const cards: GridCard[] = [];
    items.forEach((item) => {
      cards.push({
        id: `photo_${item.id}`,
        itemId: item.id,
        type: 'photo',
        content: item.imageUrl,
        isFlipped: false,
        isMatched: false,
      });
      cards.push({
        id: `name_${item.id}`,
        itemId: item.id,
        type: 'name',
        content: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    setGridCards(cards);
    setMatchesCount(0);
    setSelectedCards([]);
  }, [mode, currentIndex]);

  // Fill next empty character box in spelling mode
  const fillNextEmptySlot = (char: string) => {
    const nextInput = [...spellingInput];
    const targetIdx = nextInput.findIndex((val, idx) => val === '' && !revealedIndices.includes(idx));
    if (targetIdx !== -1) {
      nextInput[targetIdx] = char;
      setSpellingInput(nextInput);
    }
  };

  // Delete last letter
  const removeLastFilledSlot = () => {
    const nextInput = [...spellingInput];
    // Find last slot filled manually (not auto-revealed as a hint)
    for (let i = nextInput.length - 1; i >= 0; i--) {
      if (nextInput[i] !== '' && !revealedIndices.includes(i)) {
        nextInput[i] = '';
        setSpellingInput(nextInput);
        break;
      }
    }
  };

  // Check Multiple Choice selection
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);
    
    if (timerRef.current) clearInterval(timerRef.current);

    const isOptionCorrect = option.toLowerCase() === currentItem.name.toLowerCase();
    setIsCorrect(isOptionCorrect);

    if (isOptionCorrect) {
      playCorrectSound();
      setCorrectAnswers(prev => prev + 1);
      
      // Calculate score with streak multiplier and remaining time reward
      const streakMultiplier = 1 + Math.min(Math.floor(streak / 2) * 0.2, 1);
      const timeBonus = Math.floor(timeLeft / 2);
      const pointAccrued = Math.max(10, Math.floor((100 + timeBonus) * streakMultiplier));
      
      setScore(prev => prev + pointAccrued);
      setStreak(prev => {
        const next = prev + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });
    } else {
      playWrongSound();
      setWrongAnswers(prev => prev + 1);
      setStreak(0);
    }
  };

  // Submit spelling block guess
  const handleSubmitSpelling = () => {
    if (isAnswered) return;

    const sanitizedAnswer = spellingInput.join('').toLowerCase().trim();
    const sanitizedTarget = currentItem.name.toLowerCase().trim();

    if (sanitizedAnswer === '') return; // Guard against empty input submission

    setIsAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const isWordCorrect = sanitizedAnswer === sanitizedTarget;
    setIsCorrect(isWordCorrect);

    if (isWordCorrect) {
      playCorrectSound();
      setCorrectAnswers(prev => prev + 1);
      
      const streakMultiplier = 1 + Math.min(Math.floor(streak / 2) * 0.2, 1.2);
      const timeBonus = Math.floor(timeLeft * 1.5);
      const pointAccrued = Math.max(20, Math.floor((150 + timeBonus) * streakMultiplier));

      setScore(prev => prev + pointAccrued);
      setStreak(prev => {
        const next = prev + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });
    } else {
      playWrongSound();
      setWrongAnswers(prev => prev + 1);
      setStreak(0);
    }
  };

  // Grid memory click handler
  const handleCardClick = (clickedIndex: number) => {
    const clickedCard = gridCards[clickedIndex];
    if (clickedCard.isMatched || clickedCard.isFlipped || selectedCards.length >= 2) return;

    // Flip Card Visually
    const nextCards = [...gridCards];
    nextCards[clickedIndex].isFlipped = true;
    setGridCards(nextCards);

    const newSelections = [...selectedCards, clickedIndex];
    setSelectedCards(newSelections);

    // Act if we have two selections
    if (newSelections.length === 2) {
      const [idx1, idx2] = newSelections;
      const card1 = gridCards[idx1];
      const card2 = gridCards[idx2];

      const isMatch = card1.itemId === card2.itemId && card1.type !== card2.type;

      if (isMatch) {
        // Correct Match Pair
        setTimeout(() => {
          playCorrectSound();
          const updatedCards = [...gridCards];
          updatedCards[idx1].isMatched = true;
          updatedCards[idx2].isMatched = true;
          setGridCards(updatedCards);
          setSelectedCards([]);
          
          setMatchesCount((prev) => {
            const next = prev + 1;
            // Reward immediately
            setScore(prevScore => prevScore + 150);
            setCorrectAnswers(prevC => prevC + 1);

            // Double win condition check
            if (next === items.length) {
              if (timerRef.current) clearInterval(timerRef.current);
              playFanfareSound();
              // Auto-conclude after short celebration
              setTimeout(() => {
                handleGameComplete();
              }, 1200);
            }
            return next;
          });
        }, 550);
      } else {
        // Discrepancy
        setTimeout(() => {
          playWrongSound();
          const updatedCards = [...gridCards];
          updatedCards[idx1].isFlipped = false;
          updatedCards[idx2].isFlipped = false;
          setGridCards(updatedCards);
          setSelectedCards([]);
          setWrongAnswers(prevW => prevW + 1);
        }, 1100);
      }
    }
  };

  // Provide educational hint/definition
  const useClueHint = () => {
    if (showHintText) return;
    setShowHintText(true);
    setHintsUsedThisRound(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 15)); // light penalty for hints
  };

  // Reveal a letter slot on Spelling Mode
  const handleRevealLetter = () => {
    if (mode !== 'spelling') return;
    
    // Find character indices we haven't revealed yet
    const unrevealed = [];
    for (let i = 0; i < currentItem.name.length; i++) {
      if (!revealedIndices.includes(i)) {
        unrevealed.push(i);
      }
    }

    if (unrevealed.length > 0) {
      // Pick random index
      const randIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      
      const newReveals = [...revealedIndices, randIdx];
      setRevealedIndices(newReveals);

      const nextInput = [...spellingInput];
      nextInput[randIdx] = currentItem.name[randIdx].toUpperCase();
      setSpellingInput(nextInput);

      setHintsUsedThisRound(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 25)); // slight hint cost
    }
  };

  // Advance to next photo setup
  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playFanfareSound();
      handleGameComplete();
    }
  };

  // Conclude level metrics
  const handleGameComplete = () => {
    onFinish(score, {
      correctAnswers,
      wrongAnswers,
      totalTimeSpent: totalTimeSpent.current,
      highestStreak: Math.max(highestStreak, streak)
    });
  };

  // Progress ratio visual calculation
  const widthRatio = (timeLeft / timeAllocated.current) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Dynamic Header Frame */}
      <div className="flex items-center justify-between bg-white text-slate-800 rounded-3xl p-5 md:p-6 mb-6 shadow-md border border-gray-200">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-gray-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit Game
        </button>

        <div className="text-center">
          <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest block">
            {category.name}
          </span>
          <span className="text-sm font-bold text-slate-700">
            {mode === 'grid-match' ? 'Memory Arena Matching' : `Task ${currentIndex + 1} of ${items.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Acquired Score</span>
            <span className="text-base font-black text-blue-600">{score}</span>
          </div>
        </div>
      </div>

      {/* Round stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-4 bg-white rounded-2xl p-4 border border-gray-200 text-center text-xs text-slate-600 shadow-xs">
        <div>
          🔥 Streak multiplier: <strong className="text-orange-500 font-black">{streak}</strong>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <Timer className="w-4 h-4 text-blue-500" />
          Clock: <strong className={`${timeLeft < 8 ? 'text-red-500 animate-pulse font-extrabold text-sm' : 'text-slate-700 font-bold'}`}>{timeLeft}s</strong>
        </div>
        <div>
          🎯 Correct matches: <strong className="text-blue-700 font-extrabold">{correctAnswers} / {items.length}</strong>
        </div>
      </div>

      {/* Countdown Progress Slider with High-Glow Sapphire Style */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden shadow-inner">
        <div 
          className={`h-full transition-all duration-1000 ${
            timeLeft < 8 ? 'bg-red-500 animate-pulse' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
          }`}
          style={{ width: `${widthRatio}%` }}
        />
      </div>

      {/* RENDER MODES WORKSPACE */}
      
      {/* 🔴 MULTIPLE CHOICE MODE */}
      {mode === 'multiple-choice' && currentItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left panel: Image on Premium Silhouette Ambient Glow Grid */}
          <div className="bg-white rounded-3xl border border-gray-250 overflow-hidden shadow-xl p-6 flex flex-col justify-between min-h-[460px]">
            
            {/* Silhouette Frame */}
            <div className="relative group mb-8 flex justify-center py-6">
              <div className="absolute inset-x-0 -inset-y-4 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
              <div className="relative w-60 h-60 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={currentItem.imageUrl}
                  alt="Match guess graphic"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Hint Drawer Style */}
            <div className="bg-slate-50/70 border border-gray-150 p-4.5 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <HintIcon className="w-4 h-4 text-blue-600" />
                  Cognitive Hint Notes
                </span>
                
                {!showHintText && (
                  <button
                    type="button"
                    onClick={useClueHint}
                    className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors border border-blue-100"
                  >
                    Unlock Clue (-15 pts)
                  </button>
                )}
              </div>

              {showHintText ? (
                <p className="text-xs text-slate-700 leading-normal italic">
                  "{currentItem.clue}"
                </p>
              ) : (
                <p className="text-2xs text-gray-400 italic">
                  Clue drawer is locked. Click unlock to review contextual helper details.
                </p>
              )}
            </div>
          </div>

          {/* Options side */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Who is this team member?</h2>
              <p className="text-xs text-slate-500">Select the correct matching name option from below.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(currentItem.choices || []).map((choice, index) => {
                const isSelected = selectedOption === choice;
                const isCorrectOption = choice.toLowerCase() === currentItem.name.toLowerCase();
                const letterCode = String.fromCharCode(65 + index); // A, B, C, D
                
                let btnStyle = 'border-gray-205 border hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 bg-white shadow-xs';
                let indicatorStyle = 'bg-gray-100 text-gray-400 group-hover:bg-blue-200 group-hover:text-blue-600';
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    btnStyle = 'border-2 border-blue-600 bg-blue-50/70 text-blue-900 shadow-md font-bold';
                    indicatorStyle = 'bg-blue-600 text-white';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = 'border-2 border-red-500 bg-red-50 text-red-900';
                    indicatorStyle = 'bg-red-500 text-white';
                  } else {
                    btnStyle = 'border-gray-200 bg-slate-100 text-slate-400 opacity-55';
                    indicatorStyle = 'bg-gray-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(choice)}
                    className={`py-4 px-6 rounded-2xl transition-all flex items-center gap-3.5 group cursor-pointer text-left ${btnStyle}`}
                  >
                    <span className={`w-8 h-8 rounded-full text-xs flex items-center justify-center shrink-0 transition-colors ${indicatorStyle}`}>
                      {letterCode}
                    </span>
                    <span className="font-semibold text-sm">{choice}</span>
                    
                    <div className="ml-auto">
                      {isAnswered && isCorrectOption && (
                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 animate-bounce" />
                      )}
                      {isAnswered && isSelected && !isCorrectOption && (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer feedback status */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl text-center border font-bold text-sm flex flex-col items-center gap-2.5 shadow-sm ${
                  isCorrect 
                    ? 'bg-blue-50/70 text-blue-900 border-blue-200' 
                    : 'bg-red-50 text-red-950 border-red-200'
                }`}
              >
                <span>
                  {isCorrect 
                    ? '🎉 Outstanding recall! Correct answers award streak points.' 
                    : `❌ Matching mismatch. The target answer is "${currentItem.name}".`
                  }
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-1.5 flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-2xl hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg transition-all"
                >
                  {currentIndex + 1 < items.length ? 'Confirm & Next' : 'Finish Session'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ⌨️ SPELLING MODE */}
      {mode === 'spelling' && currentItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left panel: Image on Premium Silhouette Ambient Glow Grid */}
          <div className="bg-white rounded-3xl border border-gray-250 overflow-hidden shadow-xl p-6 flex flex-col justify-between min-h-[460px]">
            
            {/* Silhouette Frame */}
            <div className="relative group mb-8 flex justify-center py-6">
              <div className="absolute inset-x-0 -inset-y-4 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
              <div className="relative w-60 h-60 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={currentItem.imageUrl}
                  alt="Spelling Match preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Hints Box */}
            <div className="bg-slate-50/70 border border-gray-150 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-2xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <HintIcon className="w-4 h-4 text-blue-600" />
                  Cognitive Hint Notes
                </span>
                
                <div className="flex gap-2">
                  {!showHintText && (
                    <button
                      type="button"
                      onClick={useClueHint}
                      className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors border border-blue-100"
                    >
                      Unlock Clue (-15 pts)
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={revealedIndices.length === currentItem.name.length}
                    onClick={handleRevealLetter}
                    className="text-[10px] font-bold text-slate-700 bg-slate-200 hover:bg-slate-250 disabled:bg-slate-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors border border-slate-300"
                  >
                    Solve Letter (-25 pts)
                  </button>
                </div>
              </div>

              {showHintText && (
                <p className="text-xs text-slate-700 leading-relaxed italic border-t border-slate-200 pt-2 px-1">
                  "{currentItem.clue}"
                </p>
              )}
            </div>
          </div>

          {/* Right panel: Letter Block Builder & Inputs */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Type correct name characters</h2>
              <p className="text-xs text-slate-500">
                Arrange letter blocks inside the slots. Built-in physical computer keyboard input is fully live!
              </p>
            </div>

            {/* Letter Slots */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-6 px-4 bg-slate-50 border border-gray-200 rounded-3xl min-h-[100px]">
              {currentItem.name.split('').map((letter, idx) => {
                const char = spellingInput[idx] || '';
                const isSpace = letter === ' ';
                const isAutoHidden = revealedIndices.includes(idx);

                if (isSpace) {
                  return <div key={idx} className="w-6 h-12 border-b-4 border-dashed border-slate-300" />;
                }

                return (
                  <div
                    key={idx}
                    className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-black text-lg transition-all ${
                      char !== ''
                        ? isAutoHidden
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                          : 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-300 bg-white text-slate-400'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {/* On-screen Visual Keyboard */}
            {!isAnswered && (
              <div className="bg-white p-4.5 rounded-3xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-10 gap-1.5 mb-2 justify-center">
                  {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => fillNextEmptySlot(key)}
                      className="bg-slate-100 hover:bg-slate-250 text-slate-800 font-bold py-2.5 rounded-lg text-xs text-center cursor-pointer active:scale-90 transition-transform"
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-1.5 mb-2 justify-center px-2">
                  {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => fillNextEmptySlot(key)}
                      className="bg-slate-100 hover:bg-slate-255 text-slate-800 font-bold py-2.5 rounded-lg text-xs text-center cursor-pointer active:scale-90 transition-transform"
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-10 gap-1.5 justify-center">
                  <button
                    type="button"
                    onClick={removeLastFilledSlot}
                    className="col-span-2 bg-slate-205 hover:bg-slate-300 text-slate-800 font-extrabold py-2.5 rounded-lg text-2xs text-center cursor-pointer"
                  >
                    ⌫ Back
                  </button>
                  {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => fillNextEmptySlot(key)}
                      className="bg-slate-100 hover:bg-slate-250 text-slate-800 font-bold py-2.5 rounded-lg text-xs text-center cursor-pointer active:scale-90 transition-transform"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSubmitSpelling}
                    className="col-span-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-lg text-xs text-center cursor-pointer"
                  >
                    ↵
                  </button>
                </div>
                
                <div className="text-center text-[10px] text-gray-400 mt-3 font-medium">
                  💡 Tip: Simply spell via actual physical hardware elements for high velocity!
                </div>
              </div>
            )}

            {/* spelling check confirmation */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl text-center border font-bold text-sm flex flex-col items-center gap-2.5 shadow-sm ${
                  isCorrect 
                    ? 'bg-blue-50/70 text-blue-900 border-blue-200' 
                    : 'bg-red-50 text-red-950 border-red-200'
                }`}
              >
                <span>
                  {isCorrect 
                    ? '🎉 Spelled with ultimate mastery!' 
                    : `❌ Core mismatch error. Target spell value was "${currentItem.name.toUpperCase()}".`
                  }
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-1.5 flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-905 text-white px-5 py-3 rounded-2xl hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg transition-all"
                >
                  {currentIndex + 1 < items.length ? 'Confirm & Next' : 'Finish Session'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* 🎴 MEMORY MATCHING MODE */}
      {mode === 'grid-match' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xl">
          <div className="text-center mb-6">
            <h3 className="font-extrabold text-slate-800 text-lg mb-1">Visual & Label Pair Arena</h3>
            <p className="text-xs text-slate-500 leading-normal max-w-md mx-auto">
              Match card photo patterns with coordinate written titles. Uncover board matching pairs to clean grid boards.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {gridCards.map((card, idx) => {
              const isSelected = selectedCards.includes(idx);
              const isMatched = card.isMatched;
              const isFlipped = card.isFlipped || isMatched || isSelected;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 text-center ${
                    isMatched
                      ? 'border-blue-600 bg-blue-50/40 opacity-40 scale-95 shadow-none'
                      : isSelected
                        ? 'border-blue-500 ring-4 ring-blue-100 scale-95 shadow-md'
                        : isFlipped
                          ? 'border-gray-300 bg-white shadow-sm'
                          : 'border-blue-200 hover:border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-750 hover:to-indigo-850 shadow-md cursor-pointer'
                  }`}
                >
                  {/* Card Front (Hidden) */}
                  {!isFlipped && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-white">
                      <span className="text-2xl mb-1 text-white">🎴</span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-blue-100">MATCH</span>
                    </div>
                  )}

                  {/* Card Back (Flipped) */}
                  {isFlipped && (
                    <div className="absolute inset-0 flex items-center justify-center p-2.5 bg-white">
                      {card.type === 'photo' ? (
                        <img
                          src={card.content}
                          alt="Matching photo"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-xs font-extrabold text-slate-700 leading-tight block truncate max-w-full">
                          {card.content}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Matched overlay tag */}
                  {isMatched && (
                    <div className="absolute top-1.5 right-1.5 bg-blue-600 rounded-full p-1 shadow-md text-white">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3.5 pt-6 border-t border-gray-100">
            <div className="text-xs text-slate-500 font-bold">
              Progress status: <span className="text-blue-700 font-black">{matchesCount * 2} of {gridCards.length} matching grid modules resolved</span>
            </div>

            <button
              type="button"
              onClick={handleGameComplete}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Conclude Matching Panel & Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
