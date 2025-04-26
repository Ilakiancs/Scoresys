import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Score {
  points: number;
  sets: number[];
}

interface PlayerPosition {
  playerIndex: number;  // Index of the player (0-3)
  court: 'left' | 'right';  // Which court they're standing on
  role: 'server' | 'receiver' | 'none';  // Current role
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
  const [servingTeam, setServingTeam] = useState(0); // Team currently serving (0 or 1)
  const [matchWinner, setMatchWinner] = useState<number | null>(null);
  
  // Track all players' positions and roles
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([
    // Team 0 players
    { playerIndex: 0, court: 'right', role: 'server' },    // Player 0 (right court, serving)
    { playerIndex: 1, court: 'left', role: 'none' },       // Player 1 (left court)
    // Team 1 players
    { playerIndex: 2, court: 'right', role: 'receiver' },  // Player 2 (right court, receiving)
    { playerIndex: 3, court: 'left', role: 'none' }        // Player 3 (left court)
  ]);

  // Initialize player positions and roles based on set
  useEffect(() => {
    // Reset positions for new set
    initializePositionsForSet(currentSet);
  }, [currentSet]);

  /**
   * Initialize player positions and roles for a new set
   * @param setNumber The set number (1, 2, or 3)
   */
  const initializePositionsForSet = (setNumber: number) => {
    let newServingTeam: number;
    
    // Determine which team serves first based on set number
    if (setNumber === 1) {
      newServingTeam = 0; // First team serves in first set
    } else if (setNumber === 2) {
      newServingTeam = 1; // Second team serves in second set
    } else {
      // In the third set, the team that won more sets serves first
      const team0Sets = scores[0].sets.filter(set => set === 1).length;
      const team1Sets = scores[1].sets.filter(set => set === 1).length;
      newServingTeam = team0Sets > team1Sets ? 0 : 1;
    }
    
    setServingTeam(newServingTeam);
    
    // Initialize player positions based on which team is serving
    const newPositions: PlayerPosition[] = [
      // Team 0 players
      { 
        playerIndex: 0, 
        court: 'right', 
        role: newServingTeam === 0 ? 'server' : 'none' 
      },
      { 
        playerIndex: 1, 
        court: 'left', 
        role: 'none' 
      },
      // Team 1 players
      { 
        playerIndex: 2, 
        court: 'right', 
        role: newServingTeam === 1 ? 'server' : 'receiver' 
      },
      { 
        playerIndex: 3, 
        court: 'left', 
        role: 'none' 
      }
    ];
    
    // If team 1 is serving, update receiver to be player 0
    if (newServingTeam === 1) {
      newPositions[0].role = 'receiver';
      newPositions[2].role = 'server';
    }
    
    setPlayerPositions(newPositions);
  };

  /**
   * Get the current server's player index
   * @returns The player index of the current server
   */
  const getCurrentServer = (): number => {
    const serverPlayer = playerPositions.find(p => p.role === 'server');
    return serverPlayer ? serverPlayer.playerIndex : -1;
  };

  /**
   * Get the current receiver's player index
   * @returns The player index of the current receiver
   */
  const getCurrentReceiver = (): number => {
    const receiverPlayer = playerPositions.find(p => p.role === 'receiver');
    return receiverPlayer ? receiverPlayer.playerIndex : -1;
  };

  /**
   * Get which team a player belongs to
   * @param playerIndex Player index (0-3)
   * @returns Team index (0 or 1)
   */
  const getPlayerTeam = (playerIndex: number): number => {
    return Math.floor(playerIndex / 2);
  };

  /**
   * Determine which court a player should be on based on team's score
   * @param teamIndex The team index (0 or 1)
   * @returns Which court the server should be on ('right' for even score, 'left' for odd)
   */
  const getServerCourtBasedOnScore = (teamIndex: number): 'left' | 'right' => {
    const teamScore = scores[teamIndex].points;
    return teamScore % 2 === 0 ? 'right' : 'left';
  };

  /**
   * Get the opposite court side
   * @param court Current court ('left' or 'right')
   * @returns Opposite court ('right' or 'left')
   */
  const getOppositeCourt = (court: 'left' | 'right'): 'left' | 'right' => {
    return court === 'left' ? 'right' : 'left';
  };

  /**
   * Update all player positions and roles after a point is scored
   * @param scoringTeam The team that scored the point
   */
  const updatePositionsAfterScoring = (scoringTeam: number): void => {
    if (matchType !== 'doubles') {
      // For singles, just update the serving team
      if (scoringTeam !== servingTeam) {
        setServingTeam(scoringTeam);
      }
      return;
    }
    
    // For doubles, apply the proper rules
    const currentServingTeam = servingTeam;
    const currentServerIndex = getCurrentServer();
    const currentReceiverIndex = getCurrentReceiver();
    
    // Create a copy of positions to modify
    const newPositions = [...playerPositions];
    
    if (scoringTeam === currentServingTeam) {
      // Case 1: Serving team scored - same player continues serving but switches sides
      
      // Find the current server and their teammate
      const currentServer = newPositions.find(p => p.role === 'server')!;
      const currentServerTeammate = newPositions.find(p => 
        getPlayerTeam(p.playerIndex) === getPlayerTeam(currentServer.playerIndex) && 
        p.playerIndex !== currentServer.playerIndex
      )!;
      
      // Switch server and teammate's courts
      const oldServerCourt = currentServer.court;
      currentServer.court = currentServerTeammate.court;
      currentServerTeammate.court = oldServerCourt;
      
      // Find the current receiver and their teammate
      const currentReceiver = newPositions.find(p => p.role === 'receiver')!;
      const receiverTeammate = newPositions.find(p => 
        getPlayerTeam(p.playerIndex) === getPlayerTeam(currentReceiver.playerIndex) && 
        p.playerIndex !== currentReceiver.playerIndex
      )!;
      
      // Calculate new server court based on updated score
      const newScore = scores[currentServingTeam].points + 1;
      const newServerCourt = newScore % 2 === 0 ? 'right' : 'left';
      
      // Ensure server is on the correct court based on the new score
      if (currentServer.court !== newServerCourt) {
        // Need to swap server with teammate
        const tempCourt = currentServer.court;
        currentServer.court = currentServerTeammate.court;
        currentServerTeammate.court = tempCourt;
      }
      
      // Adjust receiver side based on server position
      currentReceiver.court = getOppositeCourt(currentServer.court);
      
      // Serving team remains the same
      // setServingTeam(currentServingTeam); // No change needed
      
    } else {
      // Case 2: Receiving team scored - they become the new serving team
      const newServingTeam = 1 - currentServingTeam;
      setServingTeam(newServingTeam);
      
      // Find the current receiver (who becomes the new server)
      const currentReceiver = newPositions.find(p => p.role === 'receiver')!;
      const receiverTeammate = newPositions.find(p => 
        getPlayerTeam(p.playerIndex) === getPlayerTeam(currentReceiver.playerIndex) && 
        p.playerIndex !== currentReceiver.playerIndex
      )!;
      
      // Find the current server (who becomes the new receiver)
      const currentServer = newPositions.find(p => p.role === 'server')!;
      const serverTeammate = newPositions.find(p => 
        getPlayerTeam(p.playerIndex) === getPlayerTeam(currentServer.playerIndex) && 
        p.playerIndex !== currentServer.playerIndex
      )!;
      
      // Calculate new server court based on team's score
      const newScore = scores[newServingTeam].points + 1;
      const newServerCourt = newScore % 2 === 0 ? 'right' : 'left';
      
      // Reset roles
      currentServer.role = 'none';
      serverTeammate.role = 'none';
      currentReceiver.role = 'none';
      receiverTeammate.role = 'none';
      
      // According to rules, the player who did NOT serve last becomes the new server
      // This means the teammate of the previous receiver becomes the server
      receiverTeammate.role = 'server';
      currentServer.role = 'receiver';
      
      // Ensure server is on the correct court based on score
      if (receiverTeammate.court !== newServerCourt) {
        // Need to swap positions
        const tempCourt = receiverTeammate.court;
        receiverTeammate.court = currentReceiver.court;
        currentReceiver.court = tempCourt;
      }
      
      // Ensure receiver is on the opposite court from server
      if (currentServer.court !== getOppositeCourt(receiverTeammate.court)) {
        // Need to swap positions with teammate
        const tempCourt = currentServer.court;
        currentServer.court = serverTeammate.court;
        serverTeammate.court = tempCourt;
      }
    }
    
    // Update player positions
    setPlayerPositions(newPositions);
  };

  /**
   * Update the score and player positions when a team scores
   * @param team The team that scored (0 or 1)
   */
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

  /**
   * Handle a player scoring a point
   * @param playerIndex The player who scored (0-3)
   */
  const handlePlayerScore = (playerIndex: number) => {
    if (matchType === 'singles') {
      // For singles, just update the score for the player's team
      updateScore(playerIndex);
    } else {
      // For doubles, determine which team the player belongs to
      const team = getPlayerTeam(playerIndex);
      
      // Update the score
      updateScore(team);
    }
  };

  /**
   * Get the current court side label for a player
   * @param playerIndex The player index (0-3)
   * @returns Court side label
   */
  const getPlayerCourtLabel = (playerIndex: number): string => {
    if (matchType === 'singles') return '';
    
    const playerPos = playerPositions.find(p => p.playerIndex === playerIndex);
    if (!playerPos) return '';
    
    return `(${playerPos.court === 'left' ? 'Left' : 'Right'} Court)`;
  };

  /**
   * Check if a player is currently serving
   * @param playerIndex The player index (0-3)
   * @returns True if the player is serving
   */
  const isPlayerServing = (playerIndex: number): boolean => {
    if (matchType === 'singles') {
      return playerIndex === servingTeam;
    } else {
      const playerPos = playerPositions.find(p => p.playerIndex === playerIndex);
      return playerPos?.role === 'server';
    }
  };

  /**
   * Check if a player is currently receiving
   * @param playerIndex The player index (0-3)
   * @returns True if the player is receiving
   */
  const isPlayerReceiving = (playerIndex: number): boolean => {
    if (matchType === 'singles') {
      return playerIndex === (1 - servingTeam);
    } else {
      const playerPos = playerPositions.find(p => p.playerIndex === playerIndex);
      return playerPos?.role === 'receiver';
    }
  };

  /**
   * Get the court side the server is currently on
   * @returns 'Right' or 'Left'
   */
  const getServerCourtSide = (): string => {
    if (matchType === 'singles') {
      const score = scores[servingTeam].points;
      return score % 2 === 0 ? 'Right' : 'Left';
    } else {
      const serverPlayer = playerPositions.find(p => p.role === 'server');
      return serverPlayer?.court === 'right' ? 'Right' : 'Left';
    }
  };

  /**
   * Get team name display
   * @param index The team index (0 or 1)
   * @returns Team display name
   */
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
          <Card key={team} className={`p-6 ${servingTeam === team ? 'ring-2 ring-green-500 border-green-500' : ''}`}>
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">{getTeamName(team)}</h2>
                {servingTeam === team && (
                  <div className="text-xs text-green-600 font-bold mb-1">
                    SERVING TEAM ({getServerCourtSide()} Court)
                  </div>
                )}
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
                      <div className="flex-1">
                        <span>{players[playerIndex]}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {getPlayerCourtLabel(playerIndex)}
                        </span>
                        {isPlayerServing(playerIndex) && (
                          <span className="ml-2 text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                            SERVING
                          </span>
                        )}
                        {isPlayerReceiving(playerIndex) && (
                          <span className="ml-2 text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                            RECEIVING
                          </span>
                        )}
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
            onClick={() => setServingTeam(prev => 1 - prev)}
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