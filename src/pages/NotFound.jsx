import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Home, ArrowLeft, Gamepad2, Trophy, Play, RotateCcw, X } from 'lucide-react';

const NotFound = () => {
    const [show404, setShow404] = useState(true);
    const [showGamePrompt, setShowGamePrompt] = useState(true);
    const [snakeStarted, setSnakeStarted] = useState(false);
    const [settings, setSettings] = useState({ company_name: 'Service Platform' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
                const res = await axios.get(`${baseUrl}/api/settings`);
                if (res.data.company_name) setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                // Keep default
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Simple Header */}
            <nav className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-800">{settings.company_name}</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-all">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* 404 Content */}
            <main className="flex-grow py-16 px-6">
                {show404 && !snakeStarted ? (
                    <div className="max-w-4xl mx-auto">
                        {/* 404 Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-4">
                                404
                            </h1>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Oops! The page you're looking for doesn't exist or has been moved.
                            </p>
                        </div>

                        {/* Game Prompt */}
                        {showGamePrompt && (
                            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 text-center">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Gamepad2 size={40} className="text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">Lost in the Void?</h3>
                                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                    Instead of just going back, why not play a quick game of Snake? 
                                    Reach a score of 20 to unlock a shortcut back home!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            setShowGamePrompt(false);
                                            setSnakeStarted(true);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                    >
                                        <Play size={20} />
                                        Play Snake
                                    </button>
                                    <Link 
                                        to="/"
                                        className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                                    >
                                        <Home size={20} />
                                        Go Home
                                    </Link>
                                </div>
                            </div>
                        )}

                        {!showGamePrompt && (
                            <div className="text-center">
                                <button
                                    onClick={() => setSnakeStarted(true)}
                                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg"
                                >
                                    <Play size={20} />
                                    Start Snake
                                </button>
                            </div>
                        )}

                        {/* Help Links */}
                        <div className="mt-12 text-center">
                            <p className="text-slate-400 text-sm">
                                Need help? <Link to="/" className="text-emerald-600 hover:underline">Contact us</Link> or visit our <Link to="/" className="text-emerald-600 hover:underline">About us</Link>
                            </p>
                        </div>
                    </div>
                ) : (
                    <SnakeGame onComplete={() => setShow404(false)} isStarted={snakeStarted} />
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white pt-12 pb-8 border-t border-slate-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-600 p-1 rounded-lg text-white">
                                <ShieldCheck size={16} />
                            </div>
                            <span className="font-bold text-slate-800">{settings.company_name}</span>
                        </div>
                        <div className="flex gap-6 text-sm font-medium text-slate-400">
                            <Link to="/admin" className="hover:text-emerald-600">Admin</Link>
                            <Link to="/refund" className="hover:text-emerald-600">Refund Portal</Link>
                            <Link to="/privacy-policy" className="hover:text-emerald-600">Privacy Policy</Link>
                            <Link to="/terms-of-service" className="hover:text-emerald-600">Terms of Service</Link>
                        </div>
                    </div>
                    <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

// Snake Game Component
const SnakeGame = ({ onComplete, isStarted }) => {
    const GRID_SIZE = 20;
    const GAME_SPEED = 120;
    const WIN_SCORE = 20;

    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [paused, setPaused] = useState(false);
    const [won, setWon] = useState(false);
    const [growing, setGrowing] = useState(false);

    const gameLoopRef = useRef(null);
    const directionRef = useRef(direction);
    const lastDirectionRef = useRef({ x: 0, y: 0 });

    directionRef.current = direction;

    // Initialize game
    useEffect(() => {
        if (isStarted && !gameOver && !won && !paused && (direction.x !== 0 || direction.y !== 0)) {
            const gameLoop = () => {
                setSnake(prevSnake => {
                    const head = prevSnake[0];
                    const newHead = {
                        x: head.x + directionRef.current.x,
                        y: head.y + directionRef.current.y
                    };

                    // Check wall collision
                    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                        setGameOver(true);
                        return prevSnake;
                    }

                    // Check self collision
                    if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                        setGameOver(true);
                        return prevSnake;
                    }

                    const newSnake = [newHead, ...prevSnake];

                    // Check food collision
                    if (newHead.x === food.x && newHead.y === food.y) {
                        setScore(prev => {
                            const newScore = prev + 1;
                            if (newScore >= WIN_SCORE) {
                                setWon(true);
                            }
                            return newScore;
                        });
                        setGrowing(true);
                        
                        // Generate new food position
                        let newFood;
                        do {
                            newFood = {
                                x: Math.floor(Math.random() * GRID_SIZE),
                                y: Math.floor(Math.random() * GRID_SIZE)
                            };
                        } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
                        setFood(newFood);
                    } else if (!growing) {
                        newSnake.pop();
                    } else {
                        setGrowing(false);
                    }

                    return newSnake;
                });

                gameLoopRef.current = setTimeout(gameLoop, GAME_SPEED);
            };

            gameLoop();

            return () => {
                if (gameLoopRef.current) {
                    clearTimeout(gameLoopRef.current);
                }
            };
        }
    }, [isStarted, gameOver, won, paused, food, growing]);

    // Update high score
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
        }
    }, [score, highScore]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (won || gameOver) return;

            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    if (lastDirectionRef.current.y !== 1) {
                        setDirection({ x: 0, y: -1 });
                        lastDirectionRef.current = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    if (lastDirectionRef.current.y !== -1) {
                        setDirection({ x: 0, y: 1 });
                        lastDirectionRef.current = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    if (lastDirectionRef.current.x !== 1) {
                        setDirection({ x: -1, y: 0 });
                        lastDirectionRef.current = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    if (lastDirectionRef.current.x !== -1) {
                        setDirection({ x: 1, y: 0 });
                        lastDirectionRef.current = { x: 1, y: 0 };
                    }
                    break;
                case 'Space':
                    e.preventDefault();
                    if (!isStarted) {
                        setDirection({ x: 1, y: 0 });
                        lastDirectionRef.current = { x: 1, y: 0 };
                    }
                    break;
                case 'KeyP':
                    setPaused(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [won, gameOver, isStarted]);

    const restart = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 15, y: 15 });
        setDirection({ x: 0, y: 0 });
        setScore(0);
        setGameOver(false);
        setPaused(false);
        setWon(false);
        setGrowing(false);
        lastDirectionRef.current = { x: 0, y: 0 };
    };

    const startGame = () => {
        setDirection({ x: 1, y: 0 });
        lastDirectionRef.current = { x: 1, y: 0 };
    };

    if (won) {
        return (
            <div className="max-w-lg mx-auto text-center">
                <div className="bg-white rounded-3xl shadow-xl p-12 border border-slate-100">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Trophy size={48} className="text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">🎉 You Win!</h2>
                    <p className="text-slate-500 mb-6">
                        You reached a score of {score} and escaped the void!
                    </p>
                    <p className="text-emerald-600 font-medium mb-8">
                        Returning you to the homepage...
                    </p>
                    <Link 
                        to="/"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg"
                    >
                        <Home size={20} />
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
                {/* Game Board */}
                <div className="relative">
                    <div 
                        className="relative bg-slate-900 rounded-2xl p-4 shadow-2xl"
                        style={{
                            width: GRID_SIZE * 25 + 32,
                            height: GRID_SIZE * 25 + 32
                        }}
                    >
                        {/* Grid background */}
                        <div 
                            className="absolute inset-4 grid gap-px bg-slate-800/50"
                            style={{
                                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                            }}
                        >
                            {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, i) => (
                                <div key={i} className="bg-slate-800/30 rounded-sm" />
                            ))}
                        </div>

                        {/* Food */}
                        <div
                            className="absolute transition-all duration-100"
                            style={{
                                left: 16 + food.x * 25,
                                top: 16 + food.y * 25,
                                width: 21,
                                height: 21
                            }}
                        >
                            <div className="w-full h-full bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse">
                                <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full" />
                            </div>
                        </div>

                        {/* Snake */}
                        {snake.map((segment, index) => (
                            <div
                                key={index}
                                className="absolute transition-all duration-100"
                                style={{
                                    left: 16 + segment.x * 25,
                                    top: 16 + segment.y * 25,
                                    width: 21,
                                    height: 21
                                }}
                            >
                                <div 
                                    className={`w-full h-full rounded-sm ${
                                        index === 0 
                                            ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
                                            : `bg-emerald-${500 + Math.min(index * 20, 100)}`
                                    }`}
                                    style={{
                                        opacity: 1 - index * 0.03,
                                        borderRadius: index === 0 ? '6px' : '4px'
                                    }}
                                >
                                    {index === 0 && (
                                        <>
                                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full" />
                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/80 rounded-full" />
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Start overlay */}
                        {!isStarted && (
                            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                                <Gamepad2 size={48} className="text-emerald-400 mb-4 animate-bounce" />
                                <h3 className="text-white font-bold text-xl mb-2">Ready?</h3>
                                <p className="text-slate-400 text-sm mb-4">Press SPACE or START to begin</p>
                                <button
                                    onClick={startGame}
                                    className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-400 transition-all"
                                >
                                    <Play size={16} />
                                    START
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 w-full md:w-64">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Gamepad2 className="text-emerald-600" />
                        Snake
                    </h2>

                    {/* Stats */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <p className="text-sm text-slate-400">Score</p>
                            <p className="text-2xl font-bold text-slate-800">{score} / {WIN_SCORE}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">High Score</p>
                            <p className="text-2xl font-bold text-slate-800">{highScore}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Length</p>
                            <p className="text-2xl font-bold text-slate-800">{snake.length}</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <p className="text-sm text-slate-400 mb-2">Progress</p>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                                style={{ width: `${Math.min(100, (score / WIN_SCORE) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="text-sm text-slate-400 space-y-2">
                        <p className="font-medium text-slate-600">Controls:</p>
                        <p>← → Move</p>
                        <p>P Pause</p>
                        <p className="text-xs mt-2">Eat food to grow!</p>
                        <p className="text-xs">Reach 20 to win!</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 space-y-2">
                        <button
                            onClick={() => setPaused(!paused)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-all"
                        >
                            {paused ? <Play size={16} /> : '⏸'} {paused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            onClick={restart}
                            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-all"
                        >
                            <RotateCcw size={16} /> Restart
                        </button>
                        <Link 
                            to="/"
                            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-all"
                        >
                            <X size={16} /> Quit
                        </Link>
                    </div>
                </div>
            </div>

            {/* Game Over */}
            {gameOver && (
                <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">💀</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Game Over</h2>
                        <p className="text-slate-500 mb-4">You reached a score of {score}!</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={restart}
                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                            >
                                <RotateCcw size={18} />
                                Try Again
                            </button>
                            <Link 
                                to="/"
                                className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                            >
                                <Home size={18} />
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Paused Overlay */}
            {paused && !gameOver && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-40">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Paused</h2>
                        <p className="text-slate-500">Press P to resume</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotFound;
