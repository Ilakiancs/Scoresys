
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Score {
  points: number;
  sets: number[];
}

interface PlayerPosition {
  left: number;  // Index of the player in the left position
  right: number; // Index of the player in the right position
  server: number; // Index of the player currently serving
  receiver: number; // Index of the player currently receiving
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
  const [serving, setServing] = useState(0); // Team serving
  const [matchWinner, setMatchWinner] = useState<number | null>(null);
  
  // For doubles: track player positions and servers
  const [teamPositions, setTeamPositions] = useState<[PlayerPosition, PlayerPosition]>([
    { left: 1, right: 0, server: 0, receiver: 2 },  // Team 0: player0 right (server), player1 left
    { left: 3, right: 2, server: 2, receiver: 0 }   // Team 1: player2 right (receiver), player3 left
  ]);

  // Initialize server based on set
  useEffect(() => {
    if (currentSet === 1) {
      setServing(0); // First team serves in first set
      
      // Initialize positions for first set
      setTeamPositions([
        { left: 1, right: 0, server: 0, receiver: 2 },
        { left: 3, right: 2, server: 2, receiver: 0 }
      ]);
    } else if (currentSet === 2) {
      setServing(1); // Second team serves in second set
      
      // Initialize positions for second set
      setTeamPositions([
        { left: 1, right: 0, server: 0, receiver: 2 },
        { left: 3, right: 2, server: 2, receiver: 0 }
      ]);
    } else if (currentSet === 3) {
      // In the third set, the team that won more sets serves first
      const team0Sets = scores[0].sets.filter(set => set === 1).length;
      const team1Sets = scores[1].sets.filter(set => set === 1).length;
      setServing(team0Sets > team1Sets ? 0 : 1);
      
      // Initialize positions for third set
      setTeamPositions([
        { left: 1, right: 0, server: 0, receiver: 2 },
        { left: 3, right: 2, server: 2, receiver: 0 }
      ]);
    }
  }, [currentSet, scores]);

  // Function to rotate players in doubles
  const rotatePlayersAfterServeChange = (team: number) => {
    if (matchType !== 'doubles') return;
    
    setTeamPositions(prev => {
      const newPositions = [...prev] as [PlayerPosition, PlayerPosition];
      
      // Swap positions within the team that's now serving
      const temp = newPositions[team].left;
      newPositions[team].left = newPositions[team].right;
      newPositions[team].right = temp;
      
      // Update server and receiver
      newPositions[team].server = newPositions[team].right;
      newPositions[1-team].receiver = newPositions[1-team].right;
      
      return newPositions;
    });
  };

  // Function to update player positions in doubles after scoring
  const updatePositionsAfterScoring = (scoringTeam: number) => {
    if (matchType !== 'doubles') return;
    
    // Only rotate positions if the serving team scores
    if (scoringTeam === serving) {
      if (scores[scoringTeam].points % 2 === 1) {
        // If points are odd, switch positions within serving team
        setTeamPositions(prev => {
          const newPositions = [...prev] as [PlayerPosition, PlayerPosition];
          const temp = newPositions[scoringTeam].left;
          newPositions[scoringTeam].left = newPositions[scoringTeam].right;
          newPositions[scoringTeam].right = temp;
          
          // Update server to be the one on the right
          newPositions[scoringTeam].server = newPositions[scoringTeam].right;
          return newPositions;
        });
      }
    } else {
      // If receiving team scores, they become the serving team
      setServing(scoringTeam);
      rotatePlayersAfterServeChange(scoringTeam);
    }
  };

  // Main function for updating score when a team wins a point
  const updateScore = (team: number) => {
    if (matchWinner !== null) return;
    
    setScores(prev => {
      const newScores = [...prev] as [Score, Score];
      newScores[team] = {
        ...newScores[team],
        points: newScores[team].points + 1
      };
      
      // Check if the set is won
      const currentScore = newScores[team].points;
      const otherScore = newScores[1 - team].points;
      
      if ((currentScore >= 21 && currentScore >= otherScore + 2) || currentScore === 30) {
        // Set is won
        const newSets0 = [...newScores[0].sets];
        const newSets1 = [...newScores[1].sets];
        
        newSets0.push(team === 0 ? 1 : 0);
        newSets1.push(team === 1 ? 1 : 0);
        
        newScores[0].sets = newSets0;
        newScores[1].sets = newSets1;
        
        // Reset points for next set
        newScores[0].points = 0;
        newScores[1].points = 0;
        
        setTimeout(() => {
          // Check if match is won
          const team0SetsWon = newSets0.filter(set => set === 1).length;
          const team1SetsWon = newSets1.filter(set => set === 1).length;
          
          if (team0SetsWon >= 2) {
            setMatchWinner(0);
            onMatchEnd?.(0);
          } else if (team1SetsWon >= 2) {
            setMatchWinner(1);
            onMatchEnd?.(1);
          } else {
            // Move to next set
            setCurrentSet(prev => prev + 1);
          }
        }, 100);
      }
      
      return newScores;
    });
    
    // Update positions based on who scored
    updatePositionsAfterScoring(team);
  };

  // Handle when a specific player scores (for doubles mode)
  const handlePlayerScore = (playerIndex: number) => {
    // Determine which team the player belongs to
    const team = matchType === 'singles' 
      ? playerIndex 
      : Math.floor(playerIndex / 2);
    
    updateScore(team);
  };

  // Get current player position name
  const getPlayerPosition = (playerIndex: number): string => {
    if (matchType === 'singles') return '';
    
    const team = Math.floor(playerIndex / 2);
    const teamPosition = teamPositions[team];
    
    if (teamPosition.left === playerIndex) return '(Left)';
    if (teamPosition.right === playerIndex) return '(Right)';
    return '';
  };
  
  // Determine if a player is currently serving
  const isPlayerServing = (playerIndex: number): boolean => {
    if (matchType === 'singles') {
      return playerIndex === serving;
    } else {
      const team = Math.floor(playerIndex / 2);
      return team === serving && teamPositions[team].server === playerIndex;
    }
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
                  onClick={() => {
                    if (scores[team].points > 0) {
                      setScores(prev => {
                        const newScores = [...prev] as [Score, Score];
                        newScores[team] = {
                          ...newScores[team],
                          points: newScores[team].points - 1
                        };
                        return newScores;
                      });
                    }
                  }}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateScore(team)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-center">
                Sets: {scores[team].sets.filter(s => s === 1).length}
              </div>
              
              {matchType === 'doubles' && (
                <div className="space-y-2">
                  {[team * 2, team * 2 + 1].map(playerIndex => (
                    <div key={playerIndex} className="flex items-center justify-between">
                      <div>
                        <span>{players[playerIndex]}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {getPlayerPosition(playerIndex)}
                          {isPlayerServing(playerIndex) ? ' (Serving)' : ''}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlayerScore(playerIndex)}
                      >
                        Point
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {matchType === 'singles' && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setServing(prev => 1 - prev)}
          >
            Change Server
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Set {currentSet} • Best of 3
        {matchWinner !== null && (
          <div className="text-lg font-bold text-primary mt-2">
            {getTeamName(matchWinner)} wins the match!
          </div>
        )}
      </div>
    </div>
  );
};
