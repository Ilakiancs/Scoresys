
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface GameSetupProps {
  onStart: (gameData: {
    matchType: 'singles' | 'doubles';
    players: string[];
  }) => void;
}

export const GameSetup = ({ onStart }: GameSetupProps) => {
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles');
  const [players, setPlayers] = useState(['', '']);
  const [teamTwoPlayers, setTeamTwoPlayers] = useState(['', '']);

  const handleStart = () => {
    const allPlayers = matchType === 'singles' 
      ? players.slice(0, 2)
      : [...players, ...teamTwoPlayers];
    
    onStart({
      matchType,
      players: allPlayers,
    });
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">New Match Setup</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            variant={matchType === 'singles' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setMatchType('singles')}
          >
            Singles
          </Button>
          <Button
            variant={matchType === 'doubles' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setMatchType('doubles')}
          >
            Doubles
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {matchType === 'singles' ? 'Players' : 'Team 1'}
            </h3>
            <div className="space-y-2">
              <Input
                placeholder="Player 1"
                value={players[0]}
                onChange={(e) => setPlayers([e.target.value, players[1]])}
              />
              {matchType === 'doubles' && (
                <Input
                  placeholder="Player 2"
                  value={players[1]}
                  onChange={(e) => setPlayers([players[0], e.target.value])}
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              {matchType === 'singles' ? 'Player 2' : 'Team 2'}
            </h3>
            {matchType === 'singles' ? (
              <Input
                placeholder="Player 2"
                value={players[1]}
                onChange={(e) => setPlayers([players[0], e.target.value])}
              />
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Player 3"
                  value={teamTwoPlayers[0]}
                  onChange={(e) => setTeamTwoPlayers([e.target.value, teamTwoPlayers[1]])}
                />
                <Input
                  placeholder="Player 4"
                  value={teamTwoPlayers[1]}
                  onChange={(e) => setTeamTwoPlayers([teamTwoPlayers[0], e.target.value])}
                />
              </div>
            )}
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleStart}
          disabled={matchType === 'singles' 
            ? !players[0] || !players[1]
            : !players[0] || !players[1] || !teamTwoPlayers[0] || !teamTwoPlayers[1]}
        >
          Start Match
        </Button>
      </div>
    </Card>
  );
};
