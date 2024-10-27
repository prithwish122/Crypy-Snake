"use client";

import { KeyboardEvent, useEffect, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Wallet, Timer, Target, Gamepad2 } from "lucide-react";
import { BrowserProvider, ethers } from "ethers";
import SnakeABI from "../contractsData/SnakeABI.json";
import address from "../contractsData/address.json"

declare global {
  interface Window {
    ethereum?: any; // Declare the ethereum object
  }
}

const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const INITIAL_DIRECTION: Direction = "DOWN";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

interface ModalProps {
  children: ReactNode;
  isVisible: boolean;
}

interface GameStats {
  score: number;
  highScore: number;
  gameTime: number;
}

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ children, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 p-8 rounded-xl max-w-md w-full border border-purple-500/20"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const Button: React.FC<ButtonProps> = ({ onClick, disabled, className, children }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    {children}
  </motion.button>
);

export default function Home(): JSX.Element {
  const [snake, setSnake] = useState<Point[]>([]);
  const [food, setFood] = useState<Point>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  // const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  // const [isConnected, setIsConnected] = useState<boolean>(false);
  // const [account, setAccount] = useState<string>("reset");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [quest, setQuest] = useState<ethers.Contract | undefined>(undefined);
  // const [account, setAccount] = useState<string>("reset");

  const handleWithdraw = async () => {
    // Withdraw logic here (You can call your contract function or any other logic)


    alert('Withdraw function triggered! Implement your logic here.');

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner()
    const questContract = new ethers.Contract(address.address, SnakeABI.abi, signer)
    setQuest(questContract);
    // mint();
    // console.log(balance, "========inside withdraw===")

    await (await questContract.mint(walletAddress, ethers.parseUnits(parseInt(5).toString(), 18))).wait();
    alert('Withdraw your earned AIA coins!');

  };




  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const moveSnake = (): void => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE ||
      newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 10);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  useEffect(() => {
    if (!gameOver && isGameStarted && !isPaused) {
      const interval = setInterval(moveSnake, 60);
      return () => clearInterval(interval);
    }
  }, [snake, direction, isGameStarted, isPaused]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!gameOver && isGameStarted && !isPaused) {
      timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameOver, isGameStarted, isPaused]);

  const initGame = (): void => {
    const initialSnake: Point[] = [];
    for (let i = INITIAL_SNAKE_LENGTH - 1; i >= 0; i--) {
      initialSnake.push({ x: i, y: 0 });
    }
    setSnake(initialSnake);
    setScore(0);
    setGameTime(0);
    setGameOver(false);
    setIsPaused(false);
    setDirection(INITIAL_DIRECTION);
    setIsGameStarted(true);
    generateFood();
  };

  const generateFood = (): void => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!isGameStarted && !showInstructions) {
      initGame();
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        if (direction !== "DOWN") setDirection("UP");
        break;
      case "ArrowDown":
        if (direction !== "UP") setDirection("DOWN");
        break;
      case "ArrowLeft":
        if (direction !== "RIGHT") setDirection("LEFT");
        break;
      case "ArrowRight":
        if (direction !== "LEFT") setDirection("RIGHT");
        break;
      case " ":
        setIsPaused(prev => !prev);
        break;
    }
  };

  // const connectWallet = async (): Promise<void> => {
  //   setIsWalletConnected(true);
  // };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startNewGame = (): void => {
    setShowInstructions(false);
    initGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="flex justify-between items-center p-4 bg-black bg-opacity-40 backdrop-blur-md border-b border-purple-500/20"
      >
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-purple-400" />
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-white"
          >
            Crypy Snake
          </motion.h1>
        </div>
        {!walletConnected ? (
        <Button
          onClick={connectWallet}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center gap-2"
        >
          <Wallet className="w-5 h-5" />
            Connect Wallet
        </Button>
        ) : (
          <button className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center gap-2">
          <span >{walletAddress.slice(0, 5) + '...' + walletAddress.slice(-4)}</span>
          </button>
        )}
      </motion.nav>

      {/* Game Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Game Stats */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-4">Game Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>Score: {score}</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Target className="w-5 h-5 text-red-400" />
                  <span>High Score: {highScore}</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Timer className="w-5 h-5 text-blue-400" />
                  <span>Time: {formatTime(gameTime)}</span>
                </div>
              </div>
            </div>
            <div className="text-white text-sm">
              <p>Press Space to Pause</p>
              <p>Use Arrow Keys to Move</p>
              {!isGameStarted && !showInstructions && (
                <p>Click on the Grid then <br/>Press any arrow key to start</p>
              )}
            </div>
          </motion.div>

          {/* Game Board */}
          <div
            className="relative outline-none"
            onKeyDown={handleKeyPress}
            tabIndex={0}
            autoFocus
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="grid grid-cols-20 grid-rows-20 bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 border border-purple-500/20"
            >
              {Array.from({ length: GRID_SIZE }).map((_, y) => (
                <div key={y} className="flex">
                  {Array.from({ length: GRID_SIZE }).map((_, x) => (
                    <motion.div
                      key={x}
                      className={`w-5 h-5 rounded-sm
                        ${snake.some((segment) => segment.x === x && segment.y === y) 
                          ? 'bg-gradient-to-br from-purple-400 to-pink-400' 
                          : 'border border-purple-900/20'}
                        ${food.x === x && food.y === y && 'bg-gradient-to-br from-red-400 to-orange-400'}
                      `}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  ))}
                </div>
              ))}
              
              {isPaused && !gameOver && isGameStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    PAUSED
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <Modal isVisible={showInstructions}>
            <h2 className="text-3xl font-bold mb-6 text-white text-center">Welcome to Crypto Snake</h2>
            <div className="space-y-4 mb-6">
              <p className="text-purple-200 text-center">
                Collect tokens and earn rewards in this crypto-themed snake game!
              </p>
              <div className="bg-black bg-opacity-40 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">How to Play:</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Use arrow keys to navigate</li>
                  <li>• Collect red tokens to grow</li>
                  <li>• Avoid walls and yourself</li>
                  <li>• Press space to pause</li>
                  <li>• Connect wallet to claim rewards</li>
                </ul>
              </div>
            </div>
            <Button
              onClick={() => setShowInstructions(false)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg"
            >
              Got it!
            </Button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <Modal isVisible={gameOver}>
            <h2 className="text-3xl font-bold mb-2 text-white text-center">Game Over!</h2>
            <div className="space-y-6 mb-6">
              <div className="flex justify-center">
                <Trophy className="w-16 h-16 text-yellow-400" />
              </div>
              <div className="space-y-2">
                <p className="text-xl text-center text-white">Final Score: {score}</p>
                <p className="text-center text-purple-200">Time: {formatTime(gameTime)}</p>
                {score > highScore && (
                  <p className="text-center text-yellow-400 font-semibold">New High Score!</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={initGame}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold"
              >
                Play Again
              </Button>
              <button
                             
                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={handleWithdraw}     
              
              >
                Claim Rewards
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )}