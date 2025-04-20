import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { HeadballScene } from './game/HeadBallScene';

const App: React.FC = () => {
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: HeadballScene
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center py-10 px-4">
      <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
        🧠 Headball Showdown
      </h1>

      <div
        id="game-container"
        className="w-[800px] h-[600px] rounded-xl overflow-hidden border-4 border-white shadow-2xl"
      />

      <div className="mt-10 max-w-xl text-white text-center">
        <h2 className="text-2xl font-semibold mb-4">⚽ How to Play</h2>
        <ul className="list-disc list-inside space-y-2 text-lg text-gray-200">
          <li>Use arrow keys to move left and right</li>
          <li>Press ↑ (up arrow) to jump</li>
          <li>Run into the ball to hit it</li>
          <li>Score more goals than the AI to win!</li>
        </ul>
      </div>
    </div>
  );
};

export default App;