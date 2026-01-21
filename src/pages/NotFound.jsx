import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Home, ArrowLeft, Gamepad2, Trophy, Play, RotateCcw, X, ArrowRight } from 'lucide-react';
import axios from 'axios';

const NotFound = () => {
    const getBaseUrl = () => {
        return window.location.hostname === 'localhost' 
            ? (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
            : '';
    };

    const [show404, setShow404] = useState(true);
    const [showGamePrompt, setShowGamePrompt] = useState(true);
    const [snakeStarted, setSnakeStarted] = useState(false);
    const [settings, setSettings] = useState({ company_name: 'Payment Hub' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${getBaseUrl()}/api/settings`);
                if (res.data.company_name) setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                // Keep default
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col">
            <nav className="w-full max-w-[1400px] mx-auto px-6 py-10 flex justify-between items-center relative z-10">
                <Link to="/" className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-[#f59e0b]"></div>
                    <span className="text-[12px] font-black uppercase tracking-[0.4em]">{settings.company_name}</span>
                </Link>
                <Link to="/" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                    <ArrowLeft size={14} /> REVERT TO HUB
                </Link>
            </nav>

            <main className="flex-grow flex items-center justify-center px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
                {/* Background Atmosphere */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#f59e0b]/5 blur-[140px] rounded-full pointer-events-none"></div>

                {show404 && !snakeStarted ? (
                    <div className="max-w-5xl w-full relative z-10">
                        <div className="space-y-12 mb-32">
                            <div className="flex items-center gap-6">
                                <div className="w-1 rounded-full h-12 bg-gradient-to-b from-[#f59e0b] to-transparent"></div>
                                <p className="text-[#f59e0b] text-[11px] font-black uppercase tracking-[0.6em]">ERROR_404</p>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-white uppercase">
                                Page <br />
                                <span className="text-white/5">Missing.</span>
                            </h1>
                            <p className="text-xl text-white/40 font-black uppercase tracking-tighter pt-8 max-w-2xl">The route you requested does not exist in our index. Connection terminated.</p>
                        </div>

                        {showGamePrompt && (
                            <div className="pt-24 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-start md:items-center gap-16 relative z-10">
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Lost in the Void?</h3>
                                    <p className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px]">Score 20 points in Snake to unlock a shortcut back.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-8 w-full md:w-auto">
                                    <button
                                        onClick={() => {
                                            setShowGamePrompt(false);
                                            setSnakeStarted(true);
                                        }}
                                        className="bg-[#10b981] text-black px-12 py-6 font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all duration-700 rounded-full shadow-[0_20px_40px_rgba(16,185,129,0.05)]"
                                    >
                                        Initiate Snake
                                    </button>
                                    <Link 
                                        to="/"
                                        className="bg-white/[0.05] text-white px-12 py-6 font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-black transition-all rounded-full text-center"
                                    >
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

            <footer className="w-full max-w-[1400px] mx-auto px-6 py-16 flex justify-between items-center border-t border-white/5 mt-auto">
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">
                    © {new Date().getFullYear()} {settings.company_name}. SECURE NAVIGATION.
                </p>
            </footer>
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
            <div className="max-w-xl w-full text-center space-y-16 animate-in zoom-in-95 duration-1000 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10b981]/10 blur-[100px] rounded-full animate-pulse"></div>
                <div className="w-1 rounded-full h-32 bg-gradient-to-b from-[#10b981] to-transparent mx-auto relative z-10"></div>
                <div className="space-y-8 relative z-10">
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Protocol Surmounted</h2>
                    <p className="text-xl text-white/20 font-black uppercase tracking-tighter">You scored {score} points and bypassed the void.</p>
                </div>
                <div className="flex justify-center relative z-10">
                    <Link to="/" className="bg-[#10b981] text-black px-16 py-8 font-black uppercase tracking-[0.4em] text-[12px] hover:bg-white transition-all duration-700 rounded-full shadow-[0_20px_40px_rgba(16,185,129,0.1)]">
                        Escape to Hub
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-32 items-center relative z-10">
            <div className="relative group">
                <div className="absolute -inset-10 bg-[#10b981]/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                <div 
                    className="relative grid bg-black overflow-hidden border border-white/[0.05] rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
                    style={{
                        width: 'min(90vw, 550px)',
                        height: 'min(90vw, 550px)',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                    }}
                >
                    {snake.map((seg, i) => (
                        <div 
                            key={i}
                            className={i === 0 ? 'bg-[#10b981]' : 'bg-[#10b981]/20'}
                            style={{
                                gridColumnStart: seg.x + 1,
                                gridRowStart: seg.y + 1,
                                borderRadius: i === 0 ? '4px' : '2px'
                            }}
                        />
                    ))}
                    <div 
                        className="bg-[#f59e0b] shadow-[0_0_15px_#f59e0b] animate-pulse rounded-sm"
                        style={{
                            gridColumnStart: food.x + 1,
                            gridRowStart: food.y + 1
                        }}
                    />
                </div>

                {gameOver && (
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center space-y-12 animate-in fade-in duration-500 rounded-[2.5rem]">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Execution Terminated</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">BUFFER_OVERFLOW_DETECTED</p>
                        </div>
                        <button onClick={restart} className="bg-[#f59e0b] text-white px-12 py-6 font-black uppercase tracking-widest text-[11px] flex items-center gap-6 hover:bg-white hover:text-black transition-all duration-700 rounded-full shadow-xl">
                            <RotateCcw size={18} /> Re-Initiate
                        </button>
                    </div>
                )}

                {(direction.x === 0 && direction.y === 0 && !gameOver) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.8em] animate-pulse">AWAITING_SIGNALS</p>
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-20">
                <div className="space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="w-1 rounded-full h-8 bg-gradient-to-b from-[#10b981] to-transparent"></div>
                        <p className="text-[#10b981] text-[11px] font-black uppercase tracking-[0.6em]">PROTOCOL_STATS</p>
                    </div>
                    <div className="flex gap-24">
                        <div className="space-y-4">
                            <p className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">{score}</p>
                            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">CURRENT_VAL</p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-6xl md:text-7xl font-black text-white/5 tracking-tighter leading-none">{WIN_SCORE}</p>
                            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">THRESHOLD</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="w-1 rounded-full h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.6em]">INPUT_INTERFACE</h4>
                    </div>
                    <p className="text-xl text-white/30 font-black uppercase tracking-tighter leading-relaxed max-w-md">
                        Utilize <span className="text-white/60">Arrow Keys</span> or <span className="text-white/60">WASD</span> to navigate the vector. Surmount the threshold to proceed.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-12 pt-12 border-t border-white/[0.03]">
                    <button onClick={restart} className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-all duration-500 flex items-center gap-5 group">
                        <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" /> RE_INITIALIZE
                    </button>
                    <Link to="/" className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-all duration-500 flex items-center gap-5 group">
                        <Home size={16} /> TERMINATE_SESSION
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
