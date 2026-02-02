import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { ASSETS } from './constants';

const App: React.FC = () => {
  return (
    <main 
      className="w-screen h-screen overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${ASSETS.BACKGROUND})` }}
    >
        {/* Dark overlay to ensure game elements pop */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
        <GameCanvas />
    </main>
  );
};

export default App;