# Badminton Score App

A modern, responsive web application for tracking badminton scores in both singles and doubles matches, following official badminton rules.

![Badminton Score App](https://via.placeholder.com/800x400?text=Badminton+Score+App)

## Features

- **Match Types**: Support for both singles and doubles matches
- **Official Rules**: Implements official badminton scoring and serving rules
- **Real-time Scoring**: Track points, sets, and match progress
- **Player Tracking**: For doubles matches, track player positions and serving/receiving roles
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with visual indicators

## Doubles Match Rules

The app implements the official badminton doubles rules:

### Initial Serve
- At 0-0, the serving team always starts from the right side
- First team serves in the first set
- Second team serves in the second set
- In the third set, the team that won more sets serves first

### Side Rule
- If the team's score is even, serve from the right court
- If the score is odd, serve from the left court

### Server Rotation
- If the serving team wins the point:
  - The same player continues serving but switches sides
- If the receiving team wins the point:
  - Serve switches to the other team
  - The player who did not serve last on that team becomes the server

### Player Tracking
- Each team has 2 players
- Tracks who is serving, from which side, and who is receiving
- Visual indicators show serving and receiving players

## Singles Match Rules

- Standard badminton scoring rules apply
- First to 21 points with a 2-point lead
- Maximum score of 30 points
- Best of 3 sets

## Technical Details

### Built With
- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components

### Project Structure
- `src/components/` - React components
  - `Scoreboard.tsx` - Main scoring and game logic
  - `GameSetup.tsx` - Match setup and player configuration
- `src/pages/` - Page components
  - `Index.tsx` - Main application page
- `src/components/ui/` - UI components

### State Management
- Uses React's useState and useEffect hooks
- Tracks scores, player positions, and match state

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/badminton-score-app.git
cd badminton-score-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

1. **Start a New Match**
   - Select match type (singles or doubles)
   - Enter player names
   - Click "Start Match"

2. **Scoring**
   - Click the up arrow to add a point
   - Click the down arrow to subtract a point (if needed)
   - For doubles, click the "Point" button next to the player who scored

3. **Match Progress**
   - The app automatically tracks sets and determines the winner
   - When a match ends, you can start a new match

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Badminton World Federation for the official rules
- Shadcn UI for the component library
- The React and TypeScript communities

