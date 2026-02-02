
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  PLAYER, 
  OBSTACLE, 
  GROUND_HEIGHT, 
  AUDIO_PATHS,
  GROUND_COLOR,
  ASSETS,
  MODES,
} from '../constants';
import { GameState, PipePair, ModeType } from '../types';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentMode, setCurrentMode] = useState<ModeType>('LITE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('speed_highscore')) || 0);

  const stateRef = useRef({
    playerY: window.innerHeight / 2,
    playerVy: 0,
    pipes: [] as PipePair[],
    score: 0,
    frames: 0,
    config: MODES.LITE,
    trail: [] as {y: number, x: number, opacity: number}[]
  });

  const requestRef = useRef<number>(0);
  const audioSuiRef = useRef<HTMLAudioElement | null>(null);
  const audioBarkRef = useRef<HTMLAudioElement | null>(null);
  const audioGameOverRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const pipeTopImgRef = useRef<HTMLImageElement | null>(null);
  const pipeBottomImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    audioSuiRef.current = new Audio(AUDIO_PATHS.SUI);
    audioBarkRef.current = new Audio(AUDIO_PATHS.BARK);
    audioGameOverRef.current = new Audio(AUDIO_PATHS.GAME_OVER);
    
    const assetsToLoad = [
      { key: 'player', url: ASSETS.PLAYER },
      { key: 'pipeTop', url: ASSETS.PIPE_TOP },
      { key: 'pipeBottom', url: ASSETS.PIPE_BOTTOM },
      { key: 'bg', url: ASSETS.BACKGROUND },
      { key: 'go', url: ASSETS.GAME_OVER }
    ];
    
    let loadedCount = 0;
    const total = assetsToLoad.length;

    const checkComplete = () => {
      loadedCount++;
      const progress = Math.floor((loadedCount / total) * 100);
      setLoadingProgress(progress);
      if (loadedCount >= total) {
        setGameState(GameState.START);
      }
    };

    // Timeout fallback: Force start if loading takes too long
    const timeout = setTimeout(() => {
      if (gameState === GameState.LOADING) setGameState(GameState.START);
    }, 5000);

    assetsToLoad.forEach(asset => {
      const img = new Image();
      img.onload = checkComplete;
      img.onerror = checkComplete; // Count errors as complete to prevent stuck loading
      img.src = asset.url;
      
      if (asset.key === 'player') playerImgRef.current = img;
      if (asset.key === 'pipeTop') pipeTopImgRef.current = img;
      if (asset.key === 'pipeBottom') pipeBottomImgRef.current = img;
    });

    return () => clearTimeout(timeout);
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    [audioSuiRef, audioBarkRef, audioGameOverRef].forEach(ref => {
      if (ref.current) {
        ref.current.play().then(() => {
          ref.current!.pause();
          ref.current!.currentTime = 0;
        }).catch(() => {});
      }
    });
    audioUnlockedRef.current = true;
  }, []);

  const playSound = useCallback((type: 'SUI' | 'BARK' | 'GAME_OVER') => {
    if (!audioUnlockedRef.current) return;
    const audio = type === 'SUI' ? audioSuiRef.current : type === 'BARK' ? audioBarkRef.current : audioGameOverRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  const resetGame = useCallback((mode: ModeType = currentMode) => {
    if (audioGameOverRef.current) {
      audioGameOverRef.current.pause();
      audioGameOverRef.current.currentTime = 0;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const modeConfig = MODES[mode];
    stateRef.current = {
      playerY: canvas.height / 2,
      playerVy: modeConfig.jump,
      pipes: [],
      score: 0,
      frames: 0,
      config: modeConfig,
      trail: []
    };
    
    setScore(0);
    setCurrentMode(mode);
    setGameState(GameState.PLAYING);
    unlockAudio();
    playSound('SUI');
  }, [currentMode, playSound, unlockAudio]);

  const jump = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    stateRef.current.playerVy = stateRef.current.config.jump;
    if (Math.random() > 0.7) playSound('BARK');
  }, [gameState, playSound]);

  useEffect(() => {
    const handleInput = (e: any) => {
      if (gameState === GameState.PLAYING) {
        jump();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleInput(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleInput);
      window.removeEventListener('touchstart', handleInput);
    };
  }, [gameState, jump]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    const groundY = canvas.height - GROUND_HEIGHT;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background Ground
    ctx.fillStyle = GROUND_COLOR;
    ctx.fillRect(0, groundY, canvas.width, GROUND_HEIGHT);
    ctx.strokeStyle = '#00eaff33';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, groundY, canvas.width, 2);

    if (gameState === GameState.PLAYING) {
      state.playerVy += state.config.gravity;
      state.playerY += state.playerVy;

      // Update Trail
      state.trail.push({ x: PLAYER.START_X + PLAYER.SIZE/2, y: state.playerY + PLAYER.SIZE/2, opacity: 1 });
      state.trail = state.trail.map(t => ({ ...t, x: t.x - state.config.speed, opacity: t.opacity - 0.05 })).filter(t => t.opacity > 0);

      const lastPipe = state.pipes[state.pipes.length - 1];
      if (!lastPipe || (canvas.width - lastPipe.x >= OBSTACLE.SPAWN_DISTANCE)) {
        const minGapY = 100;
        const maxGapY = groundY - state.config.gap - 100;
        const randomY = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
        state.pipes.push({ x: canvas.width, gapTopY: randomY, passed: false });
      }

      state.pipes.forEach(pipe => { pipe.x -= state.config.speed; });
      if (state.pipes.length > 0 && state.pipes[0].x < -OBSTACLE.WIDTH) state.pipes.shift();

      const playerL = PLAYER.START_X + 15;
      const playerR = PLAYER.START_X + PLAYER.SIZE - 15;
      const playerT = state.playerY + 15;
      const playerB = state.playerY + PLAYER.SIZE - 15;

      if (playerB >= groundY || playerT <= 0) {
        setGameState(GameState.GAME_OVER);
        playSound('GAME_OVER');
      }

      for (const pipe of state.pipes) {
        if (playerR > pipe.x && playerL < pipe.x + OBSTACLE.WIDTH) {
          if (playerT < pipe.gapTopY || playerB > pipe.gapTopY + state.config.gap) {
            setGameState(GameState.GAME_OVER);
            playSound('GAME_OVER');
          }
        }
        if (!pipe.passed && playerL > pipe.x + OBSTACLE.WIDTH) {
          pipe.passed = true;
          state.score += 1;
          setScore(state.score);
          if (state.score > highScore) {
            setHighScore(state.score);
            localStorage.setItem('speed_highscore', String(state.score));
          }
          playSound('SUI');
        }
      }
    }

    // Draw Trail
    state.trail.forEach(t => {
      ctx.beginPath();
      ctx.arc(t.x, t.y, PLAYER.SIZE/3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 234, 255, ${t.opacity * 0.3})`;
      ctx.fill();
    });

    state.pipes.forEach(pipe => {
      // Pipes Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = state.config.color;
      
      // TOP PIPE
      if (pipeTopImgRef.current?.complete) {
        ctx.save();
        ctx.translate(pipe.x + OBSTACLE.WIDTH / 2, pipe.gapTopY / 2);
        ctx.scale(1, -1);
        ctx.drawImage(pipeTopImgRef.current, -OBSTACLE.WIDTH / 2, -pipe.gapTopY / 2, OBSTACLE.WIDTH, pipe.gapTopY);
        ctx.restore();
      }

      // BOTTOM PIPE
      if (pipeBottomImgRef.current?.complete) {
        const bottomPipeY = pipe.gapTopY + state.config.gap;
        ctx.drawImage(pipeBottomImgRef.current, pipe.x, bottomPipeY, OBSTACLE.WIDTH, groundY - bottomPipeY);
      }
      ctx.shadowBlur = 0;
    });

    // Draw Player
    const rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (state.playerVy * 0.1)));
    ctx.save();
    ctx.translate(PLAYER.START_X + PLAYER.SIZE / 2, state.playerY + PLAYER.SIZE / 2);
    ctx.rotate(rot);
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'cyan';
    if (playerImgRef.current?.complete && playerImgRef.current.naturalWidth > 0) {
      ctx.drawImage(playerImgRef.current, -PLAYER.SIZE / 2, -PLAYER.SIZE / 2, PLAYER.SIZE, PLAYER.SIZE);
    } else {
      ctx.fillStyle = PLAYER.COLOR;
      ctx.fillRect(-PLAYER.SIZE / 2, -PLAYER.SIZE / 2, PLAYER.SIZE, PLAYER.SIZE);
    }
    ctx.restore();

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, playSound, highScore]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full touch-none" />
      
      {gameState === GameState.PLAYING && (
        <div className="absolute top-12 left-0 w-full flex flex-col items-center pointer-events-none">
          <div className="text-white font-black text-8xl neon-text drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            {score}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="text-cyan-400 font-bold tracking-widest text-sm bg-black/40 px-3 py-1 rounded border border-cyan-400/30">MODE: {currentMode}</div>
            <div className="text-pink-500 font-bold tracking-widest text-sm bg-black/40 px-3 py-1 rounded border border-pink-500/30">BEST: {highScore}</div>
          </div>
        </div>
      )}

      {gameState === GameState.LOADING && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="text-6xl font-black text-white italic mb-4 animate-pulse neon-text">LOADING...</div>
          <div className="w-80 h-4 bg-gray-900 rounded-full overflow-hidden border border-white/20">
            <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
          </div>
          <div className="mt-4 text-cyan-300 font-mono text-sm uppercase tracking-[0.3em]">Preparing Speed {loadingProgress}%</div>
        </div>
      )}

      {gameState === GameState.START && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl z-40 p-4">
          <h1 className="text-6xl md:text-8xl font-black text-white italic mb-2 neon-text text-center tracking-tighter">IShowSpeed</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-12 italic tracking-widest">NEON RUNNER</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {(Object.keys(MODES) as ModeType[]).map((mode) => (
              <button
                key={mode}
                onClick={() => resetGame(mode)}
                className="group relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl transition-all hover:scale-105 hover:bg-white/10 shadow-2xl overflow-hidden"
              >
                <div className="text-4xl font-black mb-3" style={{ color: MODES[mode].color }}>{mode}</div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] text-center leading-relaxed">
                  Velocity: {MODES[mode].speed}X<br/>Obstacle Gap: {MODES[mode].gap}PX
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 group-hover:bg-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
          
          <div className="mt-16 flex flex-col items-center text-white/30 font-bold uppercase tracking-widest text-sm animate-bounce">
            <span>Tap to Jump / Bark</span>
          </div>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-2xl z-50 p-6 text-center animate-zoom">
          <div className="relative mb-8">
            <div className="w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-[0_0_80px_rgba(255,0,0,1)] bg-black">
               <img src={ASSETS.GAME_OVER} alt="GameOver" className="w-full h-full object-cover grayscale brightness-125" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 font-black italic skew-x-[-12deg] text-2xl shadow-xl">
              GOD IS GOOD
            </div>
          </div>
          
          <h2 className="text-7xl font-black text-white mb-2 italic drop-shadow-xl tracking-tighter">WASTED</h2>
          
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="bg-black/50 px-12 py-3 rounded-2xl border border-red-500/40">
              <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">SCORE</div>
              <div className="text-white text-5xl font-black">{score}</div>
            </div>
            {score >= highScore && score > 0 && (
              <div className="text-yellow-400 font-black italic animate-pulse text-xl">NEW HIGH SCORE! SEWEY!</div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => resetGame()} 
              className="px-10 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              RETRY
            </button>
            <button 
              onClick={() => setGameState(GameState.START)} 
              className="px-10 py-4 bg-transparent text-white border-2 border-white/40 font-black text-xl rounded-full hover:bg-white/10 transition-all"
            >
              MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
