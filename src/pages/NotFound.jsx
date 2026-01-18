import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Home, ArrowLeft, Gamepad2, Trophy, Play, RotateCcw, X, ArrowRight } from 'lucide-react';
import axios from 'axios';

const NotFound = () => {
    const [show404, setShow404] = useState(true);
    const [showGamePrompt, setShowGamePrompt] = useState(true);
    const [snakeStarted, setSnakeStarted] = useState(false);
    const [settings, setSettings] = useState({ company_name: 'Payment Hub' });

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
        <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col">
            <nav className="w-full max-w-[1400px] mx-auto px-6 py-8 flex justify-between items-center relative z-10">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-[#0f172a]" size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{settings.company_name}</span>
                </Link>
                <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
                    Back to Hub
                </Link>
            </nav>

            <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {show404 && !snakeStarted ? (
                    <div className="max-w-4xl w-full">
                        <div className="space-y-4 mb-12">
                            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Error 404</p>
                            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white">
                                Page <br />
                                <span className="text-slate-800 outline-text">Missing.</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium pt-4">The route you requested does not exist in our index.</p>
                        </div>

                        {showGamePrompt && (
                            <div className="bg-slate-900/30 border border-slate-800 p-8 md:p-12 rounded-[2rem] space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                                        <Gamepad2 size={32} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Lost in the Void?</h3>
                                        <p className="text-slate-500 font-medium">Score 20 points in Snake to unlock a shortcut back.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <button
                                        onClick={() => {
                                            setShowGamePrompt(false);
                                            setSnakeStarted(true);
                                        }}
                                        className="bg-emerald-500 text-[#0f172a] px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-all duration-500 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10"
                                    >
                                        <Play size={18} />
                                        Initiate Snake
                                    </button>
                                    <Link 
                                        to="/"
                                        className="bg-slate-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all border border-slate-800 flex items-center justify-center gap-3"
                                    >
                                        <Home size={18} />
                                        Return Home
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <SnakeGame onComplete={() => setShow404(false)} isStarted={snakeStarted} />
                )}
            </main>

            <footer className="w-full max-w-[1400px] mx-auto px-6 py-12 border-t border-slate-900/50 mt-auto">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest text-center md:text-left">
                    © {new Date().getFullYear()} {settings.company_name}. Secure Navigation.
                </p>
            </footer>

            <style jsx>{`
                .outline-text {
                    -webkit-text-stroke: 1px #334155;
                    color: transparent;
                }
                @media (min-width: 1024px) {
                    .outline-text {
                        -webkit-text-stroke: 2px #334155;
                    }
                }
            `}</style>
        </div>
    );
};

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

    useEffect(() => {
        if (isStarted && !gameOver && !won && !paused && (direction.x !== 0 || direction.y !== 0)) {
            const gameLoop = () => {
                setSnake(prevSnake => {
                    const head = prevSnake[0];
                    const newHead = {
                        x: head.x + directionRef.current.x,
                        y: head.y + directionRef.current.y
                    };

                    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                        setGameOver(true);
                        return prevSnake;
                    }

                    if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                        setGameOver(true);
                        return prevSnake;
                    }

                    const newSnake = [newHead, ...prevSnake];

                    if (newHead.x === food.x && newHead.y === food.y) {
                        setScore(prev => {
                            const newScore = prev + 1;
                            if (newScore >= WIN_SCORE) setWon(true);
                            return newScore;
                        });
                        setGrowing(true);
                        
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
                if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
            };
        }
    }, [isStarted, gameOver, won, paused, food, growing]);

    useEffect(() => {
        if (score > highScore) setHighScore(score);
    }, [score, highScore]);

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
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [won, gameOver]);

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

    if (won) {
        return (
            <div className="max-w-xl w-full text-center space-y-10 animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                    <Trophy size={48} className="text-[#0f172a]" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Victory!</h2>
                    <p className="text-xl text-slate-500 font-medium">You scored {score} points and escaped the void.</p>
                </div>
                <div className="flex justify-center">
                    <Link to="/" className="group bg-white text-[#0f172a] px-12 py-6 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-4 hover:bg-emerald-500 transition-all duration-500">
                        Escape to Home <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 items-center">
            <div className="relative bg-slate-900 border-4 border-slate-800 rounded-[2rem] p-4 shadow-2xl">
                <div 
                    className="relative grid bg-[#0f172a] rounded-xl overflow-hidden"
                    style={{
                        width: 'min(80vw, 400px)',
                        height: 'min(80vw, 400px)',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                    }}
                >
                    {snake.map((seg, i) => (
                        <div 
                            key={i}
                            className={`${i === 0 ? 'bg-emerald-500' : 'bg-emerald-500/50'} rounded-sm`}
                            style={{
                                gridColumnStart: seg.x + 1,
                                gridRowStart: seg.y + 1
                            }}
                        />
                    ))}
                    <div 
                        className="bg-red-500 rounded-full animate-pulse scale-75"
                        style={{
                            gridColumnStart: food.x + 1,
                            gridRowStart: food.y + 1
                        }}
                    />
                </div>

                {gameOver && (
                    <div className="absolute inset-0 bg-[#0f172a]/90 flex flex-col items-center justify-center rounded-[2rem] p-8 text-center space-y-6 animate-in fade-in duration-300">
                        <X className="text-red-500" size={48} />
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest">Game Over</h3>
                        <button onClick={restart} className="bg-emerald-500 text-[#0f172a] px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <RotateCcw size={16} /> Try Again
                        </button>
                    </div>
                )}

                {(direction.x === 0 && direction.y === 0 && !gameOver) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest animate-pulse">Press arrows to start</p>
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-8">
                <div className="space-y-2">
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Game Stats</p>
                    <div className="flex gap-12 pt-4">
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white">{score}</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Current Score</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white">{WIN_SCORE}</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Target Score</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2rem] space-y-4">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Instructions</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Use <span className="text-white font-bold">Arrow Keys</span> or <span className="text-white font-bold">WASD</span> to navigate the snake. Collect red nodes to grow. Do not hit the walls or yourself.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button onClick={restart} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                        <RotateCcw size={14} /> Reset
                    </button>
                    <Link to="/" className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-2">
                        <Home size={14} /> Quit Game
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
