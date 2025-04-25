
import { useState } from 'react';
import { GameSetup } from '@/components/GameSetup';
import { Scoreboard } from '@/components/Scoreboard';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface GameState {
  matchType: 'singles' | 'doubles';
  players: string[];
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [matchEnded, setMatchEnded] = useState(false);

  const handleMatchEnd = (winner: number) => {
    setMatchEnded(true);
    const winningPlayers = gameState?.matchType === 'singles'
      ? gameState.players[winner]
      : `${gameState?.players[winner * 2]} and ${gameState?.players[winner * 2 + 1]}`;
    
    toast({
      title: "Match Complete!",
      description: `${winningPlayers} won the match!`,
    });
  };

  const startNewMatch = () => {
    setGameState(null);
    setMatchEnded(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-2xl">
        {!gameState ? (
          <GameSetup onStart={setGameState} />
        ) : (
          <div className="space-y-6">
            <Scoreboard
              matchType={gameState.matchType}
              players={gameState.players}
              onMatchEnd={handleMatchEnd}
            />
            
            {matchEnded && (
              <div className="text-center">
                <Button onClick={startNewMatch}>Start New Match</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
