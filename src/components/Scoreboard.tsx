
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Score {
  points: number;
  sets: number[];
}

interface ScoreboardProps {
  matchType: 'singles' | 'doubles';
  players: string[];
  onMatchEnd?: (winner: number) => void;
}

export const Scoreboard = ({ matchType, players, onMatchEnd }: ScoreboardProps) => {
  const [scores, setScores] = useState<[Score, Score]>([
    { points: 0, sets: [] },
    { points: 0, sets: [] }
  ]);
  const [currentSet, setCurrentSet] = useState(1);
  const [serving, setServing] = useState(0);

  const updateScore = (team: number, increment: boolean) => {
    setScores(prev => {
      const newScores = [...prev] as [Score, Score];
      const currentScore = newScores[team].points;
      const otherScore = newScores[1 - team].points;
      
      if (increment && currentScore < 30) {
        newScores[team] = {
          ...newScores[team],
          points: currentScore + 1
        };
      } else if (!increment && currentScore > 0) {
        newScores[team] = {
          ...newScores[team],
          points: currentScore - 1
        };
      }

      // Check if set is won
      if (newScores[team].points >= 21 && newScores[team].points >= otherScore + 2 || newScores[team].points === 30) {
        newScores[0].sets = [...newScores[0].sets];
        newScores[1].sets = [...newScores[1].sets];
        newScores[team].sets.push(1);
        newScores[1 - team].sets.push(0);
        
        // Reset points for next set
        newScores[0].points = 0;
        newScores[1].points = 0;
        setCurrentSet(prev => prev + 1);

        // Check if match is won
        if (newScores[team].sets.filter(set => set === 1).length >= 2) {
          onMatchEnd?.(team);
        }
      }

      return newScores;
    });
  };

  const getTeamName = (index: number) => {
    if (matchType === 'singles') {
      return players[index];
    }
    return `${players[index * 2]} / ${players[index * 2 + 1]}`;
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map(team => (
          <Card key={team} className={`p-6 ${serving === team ? 'ring-2 ring-primary' : ''}`}>
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">{getTeamName(team)}</h2>
                <div className="text-5xl font-bold">{scores[team].points}</div>
              </div>
              
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateScore(team, false)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateScore(team, true)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-center">
                Sets: {scores[team].sets.filter(s => s === 1).length}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setServing(prev => 1 - prev)}
        >
          Change Server
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Set {currentSet} • Best of 3
      </div>
    </div>
  );
};
