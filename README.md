# CatchFishy
This is the CatchFishy fishing game for JHGambling.

A deep-sea fishing adventure where players cast their lines into the depths to catch valuable fish. The deeper you go, the more valuable the fish, but beware of the sharks that might steal your catch!

## Features

- **Dynamic Fishing Mechanics**: Charge your cast to reach different depths
- **Fish Rarity System**: Common, Rare, Epic, and Legendary fish with varying values
- **Shark Encounters**: Dangerous sharks that can steal your caught fish
- **Depth-Based Gameplay**: Deeper waters contain more valuable fish
- **Real-time Movement**: Control your fishing line while returning to surface
- **Casino SDK Integration**: Full wallet management and transaction processing

## Development

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Asset Structure
All game assets (images, styles) are located in the `public/` directory:
- `public/images/fish/` - Fish sprites and shark image
- `public/images/logo.png` - Game logo
- `public/style.css` - Game styles

Vite automatically copies these assets to the build output.

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Docker

Build and run with Docker:
```bash
docker build -t catchfishy .
docker run -p 8080:80 catchfishy
```

## Game Rules

### How to Play
1. **Charging**: Press and hold SPACE to charge your cast (watch the green bar)
2. **Casting**: Release SPACE to cast your line - higher charge = deeper cast
3. **Descending**: Your hook automatically descends to the target depth
4. **Fishing**: Fish will try to avoid your hook - catch them by getting close
5. **Returning**: Use LEFT/RIGHT arrow keys to control your line while ascending
6. **Sharks**: Watch out for sharks that can steal your caught fish!

### Fish Types & Values
- **Common Fish**: 5-15 credits (frequent spawns)
- **Rare Fish**: 20-40 credits (uncommon spawns)
- **Epic Fish**: 50-80 credits (rare spawns)
- **Legendary Fish**: 100-150 credits (very rare spawns)

### Costs
- **Cast Cost**: 5 credits per fishing attempt
- **Shark Penalty**: Lose the value of stolen fish

## SDK Integration

The game integrates with the JHGambling Casino SDK for:
- User authentication
- Wallet management and real-time balance updates
- Transaction processing for costs and winnings
- Session handling

### URL Parameters
- `wsUrl`: WebSocket URL for casino server
- `token`: Authentication token
- `session`: Session ID
- `usesdk`: Enable SDK integration

Example: `?usesdk=1&wsUrl=ws://localhost:9000&token=dev&session=123`

## Controls

- **SPACE**: Charge and cast fishing line
- **LEFT ARROW**: Move line left while returning
- **RIGHT ARROW**: Move line right while returning

## Game Mechanics

### Depth System
- Maximum depth: 10,000 units
- Charge bar determines cast strength (0-100%)
- Water gets darker as you go deeper
- Fish become more valuable at greater depths

### Fish Behavior
- Fish drift naturally in the water
- Fish avoid the fishing hook when it gets close
- Higher value fish are harder to catch (more avoidance)
- Fish spawn randomly throughout the water column

### Shark System
- Sharks spawn randomly during the return phase
- Sharks target your fishing line
- If a shark reaches your hook, it steals the first caught fish
- Stolen fish value is deducted from your credits