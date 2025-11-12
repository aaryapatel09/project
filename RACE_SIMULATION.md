# Advanced Race Simulation Documentation

Complete guide to the lap-by-lap race simulation engine with tire strategy, weather effects, and realistic racing dynamics.

## Overview

The Advanced Race Simulation system provides a realistic, physics-based simulation of racing with:
- Lap-by-lap progression
- Tire wear and pit strategy
- Weather conditions and effects
- Driver skill and aggression stats
- Stochastic incidents and safety cars
- Overtaking dynamics
- Real-time commentary

## API Endpoint

### POST `/api/simulate-race`

Simulates a complete race with advanced parameters and returns detailed lap-by-lap data.

#### Request Body

```json
{
  "track": "Circuit Name",
  "drivers": [
    {
      "name": "Driver Name",
      "skill": 0.85,
      "aggression": 0.6
    }
  ],
  "weather": "dry",
  "safetyCarProbability": 0.05
}
```

#### Parameters

**track** (string, required)
- Name of the track to race on
- Must match an existing track in the database

**drivers** (array, required)
- List of driver objects with stats
- Minimum 2 drivers
- Can also accept simple string array of names (stats auto-generated)

**Driver Object:**
- `name` (string): Driver name
- `skill` (float, 0.0-1.0): Driving ability (default: 0.75)
  - 0.5-0.6: Rookie
  - 0.7-0.8: Mid-field
  - 0.85-0.95: Top tier
  - 0.95-1.0: Elite/Champion
- `aggression` (float, 0.0-1.0): Racing style (default: 0.5)
  - 0.0-0.3: Conservative
  - 0.4-0.6: Balanced
  - 0.7-0.9: Aggressive
  - 0.9-1.0: Very aggressive

**weather** (string, optional, default: 'dry')
- `'dry'`: Normal dry conditions
- `'rain'`: Wet conditions throughout
- `'variable'`: Dynamic weather changes during race

**safetyCarProbability** (float, optional, default: 0.05)
- Probability per lap of safety car deployment
- Range: 0.0-0.2 (0% to 20%)
- Higher values = more safety car periods

#### Response

```json
{
  "race_results": [
    {
      "position": 1,
      "driver": "Driver Name",
      "car_number": 1,
      "total_time": 5432.123,
      "gap_to_leader": 0.0,
      "lap_times": [90.123, 89.456, ...],
      "positions": [1, 1, 2, 1, ...],
      "gaps": [0.0, 0.0, 0.234, 0.0, ...],
      "pit_stops": 2,
      "final_tire": "soft",
      "status": "Finished"
    }
  ],
  "winner": "Driver Name",
  "winning_time": 5432.123,
  "total_laps": 60,
  "fastest_lap": 88.234,
  "fastest_lap_driver": "Driver Name",
  "commentary": [
    {
      "lap": 1,
      "text": "Race Start!",
      "type": "race_start"
    }
  ],
  "safety_car_periods": 1,
  "weather_summary": ["dry", "dry", "rain", ...],
  "track_name": "Circuit Name"
}
```

## Simulation Features

### 1. Tire Strategy

#### Tire Compounds

**Soft**
- Grip: 1.0 (highest)
- Wear Rate: 1.5x (fastest degradation)
- Optimal Laps: ~15
- Use: Qualifying, short stints, final push

**Medium**
- Grip: 0.85
- Wear Rate: 1.0x (baseline)
- Optimal Laps: ~25
- Use: Versatile, most races

**Hard**
- Grip: 0.7
- Wear Rate: 0.6x (longest lasting)
- Optimal Laps: ~40
- Use: Long stints, one-stop strategies

**Intermediate**
- Grip: 0.9
- Wear Rate: 0.8x
- Optimal Laps: ~30
- Use: Damp conditions

**Wet**
- Grip: 1.0 (in rain)
- Wear Rate: 0.5x
- Optimal Laps: ~35
- Use: Heavy rain

#### Tire Degradation

Tire condition decreases each lap based on:
- Base wear rate (compound-specific)
- Driver aggression (+20% wear for aggressive drivers)
- Track surface (simulated)
- Weather mismatch (2x wear for wrong tires)

Tire condition affects lap times:
- 100% condition: Full performance
- 70% condition: Slight degradation
- 50% condition: Noticeable slower
- 30% condition: Significant time loss

#### Pit Stop Strategy

Drivers will pit if:
- Tire condition < 40% (critical)
- Tire age > 20 laps and random trigger
- Weather change (switching to appropriate tires)
- Must pit at least once per race

Pit stop time loss: 20-25 seconds

### 2. Weather Effects

#### Dry Conditions
- Normal grip levels
- Standard tire strategies
- Predictable lap times

#### Rain Conditions
- Reduced grip for slick tires (25% slower)
- Optimal for wet/intermediate tires (5-8% slower)
- Increased incident probability (+1.5%)
- Mandatory tire change to wet-weather compounds

#### Variable Weather
- 10% chance per lap of weather change
- Dynamic strategy decisions
- Pit stop timing crucial
- Adds unpredictability

Weather affects:
- Lap times (factor applied)
- Tire choice decisions
- Incident probability
- Overtaking difficulty

### 3. Lap Time Calculation

Base lap time from track characteristics, modified by:

**Driver Skill** (-5% to +5%)
- Elite drivers consistently faster
- Skill reduces variance

**Tire Effect**
- Grip level (compound)
- Condition (wear state)
- Degradation accelerates over optimal window

**Weather Factor**
- Dry: 1.0x baseline
- Wrong tires in rain: 1.25x slower
- Correct wet tires: 1.05-1.08x slower
- Wrong tires in dry: 1.15x slower

**Safety Car**
- +30% lap time when active
- All drivers bunch up

**Track Difficulty**
- Incorporated from track metrics
- Technical circuits slower

**Random Variation**
- ±1.5% per lap
- Simulates micro-variations

Formula:
```
lap_time = base_time × skill_factor × tire_factor × weather_factor × difficulty_factor × random_factor
```

### 4. Overtaking Model

Overtaking attempts occur when:
- Drivers within 2 seconds
- Not under safety car

Overtaking probability based on:
- **Skill Difference** (30% weight)
  - Higher skill = more likely to overtake
- **Tire Condition Difference** (30% weight)
  - Fresher tires = advantage
- **Aggression** (20% weight)
  - Aggressive drivers attempt more
- **Track Characteristics** (20% weight)
  - More overtaking opportunities = easier
- **Random Factor** (-10% to +10%)

Successful overtake:
- Position swap
- Time advantage gained (0.3-0.8s)
- Commentary generated

### 5. Incidents & Reliability

#### Incident Types

**Spin**
- Time loss: 5-15 seconds
- Driver continues
- No safety car

**Puncture**
- Time loss: 5-15 seconds
- Forces pit stop
- Driver continues

**Collision**
- Time loss: 5-15 seconds
- Damage possible
- May trigger safety car (60% chance)

**Crash**
- Retirement (DNF)
- Safety car deployed (60% chance)
- Race ends for driver

**Mechanical Failure**
- Retirement (DNF)
- Lower safety car chance
- Race ends for driver

#### Incident Probability

Base probability: 0.5% per lap

Increased by:
- Driver aggression (+1% per 1.0 aggression)
- Poor tire condition (+2% if <40%)
- Rain conditions (+1.5%)

### 6. Safety Car

#### Deployment
- Random probability per lap (configurable)
- Triggered by major incidents (60% chance)
- Bunches field together

#### Effects
- All lap times +30% slower
- No overtaking
- Strategic pit window
- Lasts 2-4 laps
- Commentary generated

#### Clearing
- "Safety Car In" announcement
- Racing resumes
- Exciting restart battles

### 7. Race Commentary

Real-time commentary generated for:

**Race Start** 🏁
- Grid positions
- Race begins

**Pit Stops** 🔧
- Driver name
- Tire change
- Time loss

**Overtakes** 🏎️
- Position changes
- Exciting battles

**Incidents** ⚠️
- Spins, collisions
- Time penalties

**Retirements** 💥
- DNFs
- Reasons

**Safety Car** 🚨
- Deployment
- Clearing

**Weather Changes** 🌧️
- Condition updates
- Strategic implications

**Lap Summaries** 📢
- Every 5 laps
- Leader status
- Gaps

**Race Finish** 🏆
- Winner announcement
- Final results

## Output Data

### Race Results Array

Per-driver statistics:
- Final position
- Total race time
- Gap to leader
- All lap times (array)
- Position changes per lap (array)
- Gap evolution per lap (array)
- Number of pit stops
- Final tire compound
- DNF status and reason

### Fastest Lap
- Best single lap time
- Driver who set it
- Purple sector times

### Commentary
- Chronological event log
- Lap numbers
- Event types
- Descriptive text

### Weather Summary
- Conditions per lap
- Change points
- Strategic impacts

## Frontend Integration

### Driver Setup

Adjust driver statistics:
- **Skill slider**: 50-100%
- **Aggression slider**: 0-100%
- Add/remove drivers dynamically
- Pre-configured starting lineups

### Race Configuration

Set race parameters:
- Track selection
- Weather conditions
- Safety car probability
- Laps (from track data)

### Results Display

**Summary Cards**
- Winner
- Total laps
- Fastest lap + driver
- Safety car periods

**Classification Table**
- Position (with medals)
- Driver name
- Total time
- Gap to leader
- Pit stops
- Final tire
- Status (Finished/DNF)

**Race Commentary**
- Scrollable event log
- Icons per event type
- Lap numbers
- Full race story

**Lap Charts** (Future)
- Position changes
- Gap evolution
- Lap time comparison

## Strategy Examples

### One-Stop Strategy
```
Start: Medium tires (lap 1)
Pit: Lap 30 → Soft tires
Finish: Soft tires (lap 60)
```
Low wear, consistent pace

### Two-Stop Strategy
```
Start: Soft tires (lap 1)
Pit 1: Lap 20 → Medium tires
Pit 2: Lap 45 → Soft tires
Finish: Soft tires (lap 60)
```
Higher peak pace, more stops

### Rain Strategy
```
Start: Soft tires (dry)
Pit 1: Lap 15 → Intermediate (rain starts)
Pit 2: Lap 35 → Soft (track drying)
Finish: Soft tires
```
Reactive to conditions

## Performance Characteristics

### Simulation Speed
- ~50-100ms per lap
- 60-lap race: ~5 seconds
- Real-time generation

### Accuracy
- Based on F1 physics models
- Simplified for performance
- Realistic outcomes

### Randomness
- Seeded per race
- Reproducible with same inputs
- Balanced variance

## Advanced Tips

### Driver Pairing
- Mix skill levels for variety
- High aggression = exciting but risky
- Elite drivers dominate

### Weather Selection
- **Dry**: Pure skill/strategy battle
- **Rain**: Chaos and opportunity
- **Variable**: Maximum unpredictability

### Safety Car Tuning
- 0%: Clean, processional races
- 5%: Realistic F1 frequency
- 10%+: Action-packed, mixed strategies

### Track Selection
- Long tracks = more tire deg
- Technical tracks = skill advantage
- High overtaking = aggressive styles benefit

## Troubleshooting

### All drivers DNF
- Reduce safety car probability
- Lower aggression levels
- Check track data validity

### No overtaking
- Increase driver skill variance
- Higher aggression
- Select tracks with overtaking opportunities

### Unrealistic lap times
- Verify track base lap time
- Check difficulty score
- Weather effects may be stacked

## Future Enhancements

Planned features:
- [ ] Fuel strategy
- [ ] Engine modes
- [ ] Team orders
- [ ] Formation laps
- [ ] Virtual safety car
- [ ] Penalty system
- [ ] Damage simulation
- [ ] Qualifying sessions
- [ ] Championship points
- [ ] Telemetry data
- [ ] Replay system
- [ ] 3D visualization

## Technical Details

### Architecture
```
race_simulator.py
├── TireCompound (static data)
├── Driver (state management)
└── RaceSimulator (main engine)
    ├── simulate_race()
    ├── simulate_lap()
    ├── calculate_lap_time()
    ├── update_tire_condition()
    ├── simulate_overtakes()
    ├── check_for_incidents()
    └── generate_results()
```

### Performance
- O(drivers × laps) complexity
- Memory efficient
- Stateful simulation
- Event-driven architecture

### Testing
Test with:
- 2 drivers, 10 laps (baseline)
- 20 drivers, 60 laps (stress test)
- Various weather conditions
- Different track types

## API Usage Examples

### Basic Simulation
```python
POST /api/simulate-race
{
  "track": "Monaco",
  "drivers": ["Hamilton", "Verstappen"]
}
```

### Advanced Configuration
```python
POST /api/simulate-race
{
  "track": "Spa-Francorchamps",
  "drivers": [
    {"name": "Hamilton", "skill": 0.95, "aggression": 0.6},
    {"name": "Verstappen", "skill": 0.93, "aggression": 0.8},
    {"name": "Leclerc", "skill": 0.88, "aggression": 0.7}
  ],
  "weather": "variable",
  "safetyCarProbability": 0.08
}
```

### Rain Race
```python
POST /api/simulate-race
{
  "track": "Silverstone",
  "drivers": [...],
  "weather": "rain",
  "safetyCarProbability": 0.12
}
```

## Conclusion

The Advanced Race Simulation provides a comprehensive, realistic racing experience with detailed lap-by-lap data, strategic depth, and exciting unpredictability. Perfect for:
- Testing track designs
- Strategy analysis
- Entertainment
- Racing game development
- Statistical modeling

