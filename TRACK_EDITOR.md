# Interactive Track Editor Documentation

Complete guide for using the advanced track editor in the Racing App.

## Overview

The Interactive Track Editor is a powerful SVG-based tool for designing custom race tracks with drag-and-drop functionality, real-time metrics, and professional-grade features.

## Features

### 🎨 Visual Editor

#### SVG Canvas
- 800x600 viewBox with responsive scaling
- Grid background for alignment
- Start/Finish line indicator
- Smooth drag-and-drop interaction
- Visual feedback for selection and hover states

#### Track Elements
- **Straights**: Linear track sections
- **Corner Left**: Left-turning curves
- **Corner Right**: Right-turning curves

Each element is visually represented with:
- Color-coded paths (Blue for normal, Green for DRS)
- Thickness variation on hover/selection
- Control points for selected elements
- Sector markers
- DRS zone labels

### 🛠️ Element Properties

#### Length (50-1000m)
Controls the distance of the track section
- Affects lap time calculations
- Influences overtaking opportunities
- Impacts overall track flow

#### Width (10-30m)
Sets the track width
- Standard F1 width: 12-15m
- Wider tracks enable more racing lines
- Affects safety calculations

#### Banking (0-30°)
Cornering angle for high-speed sections
- 0°: Flat corner
- 10-15°: Moderate banking (typical oval)
- 20-30°: High banking (superspeedway style)
- Reduces lap time in corners
- Increases safety for high-speed turns

#### Elevation (-50m to +50m)
Vertical position change
- Negative values: Downhill sections
- Positive values: Uphill sections
- Affects difficulty score
- Impacts driver fatigue
- Creates dramatic racing moments

#### DRS Zone Toggle
Drag Reduction System activation
- Available on straights and corners
- Provides speed advantage
- Increases overtaking opportunities
- Shown in green on track

#### Sector Marking (1-3)
Timing sector assignment
- Divide track into 3 sectors
- Used for sector times in racing
- Helps analyze track performance

### 📊 Real-Time Metrics

#### Total Length
- Calculated sum of all element lengths
- Displayed in kilometers
- Typical F1 tracks: 3-7 km

#### Estimated Lap Time
Formula:
```
Base Time = Element Length / Speed
Speed = 50 m/s (straights), 30 m/s (corners)
Banking Reduction = Banking° × 1%
DRS Bonus = +40% speed on straights
Elevation Penalty = |Elevation| × 0.05s
```

Displayed in MM:SS.S format

#### Difficulty Score (0-100)
Calculated from:
- Corner count (×2 points each)
- Elevation change (÷10 × 3 points)
- Total length (÷1000 × 1 point)
- DRS zones (-2 points each)

Labels:
- 0-24: Easy
- 25-49: Medium
- 50-74: Hard
- 75-100: Extreme

#### Possible Overtakes
Calculated from:
- Long straights (>300m) before corners: +1
- DRS zones: +1
- Low-banking corners (<5°): +0.5

More overtakes = more exciting racing

#### Safety Rating (0-100)
Reduced by:
- High-speed corners (>200m): -5
- Low banking in fast corners: -3
- Steep elevation (>20m): -4

Labels:
- 80-100: Very Safe
- 60-79: Safe
- 40-59: Moderate
- 20-39: Risky
- 0-19: Dangerous

#### Elevation Change
- Maximum elevation - Minimum elevation
- Measures vertical track variation
- Famous examples: Spa (104m), COTA (41m)

#### Element Counts
- Number of corners
- Number of straights
- Number of DRS zones

### ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last change |
| `Ctrl+Y` | Redo change |
| `Delete` | Delete selected element |
| `Drag` | Move selected element |
| `Click` | Select/deselect element |

### 🔄 Undo/Redo System

- Maintains history of last 50 states
- Each action creates a new history entry
- Can navigate backward (undo) and forward (redo)
- Visual indicators show undo/redo availability
- History preserved until page refresh

### 💾 Save & Load

#### Export Track (JSON)
Downloads complete track data including:
- Track name and settings
- All element properties
- Calculated metrics
- Timestamp

Example format:
```json
{
  "name": "My Track",
  "elements": [
    {
      "id": "element-1234567890",
      "type": "straight",
      "x": 400,
      "y": 100,
      "length": 300,
      "width": 15,
      "banking": 0,
      "elevation": 0,
      "isDRS": true,
      "sectorNumber": 1
    }
  ],
  "difficulty": "medium",
  "laps": 3,
  "metrics": { ... }
}
```

#### Import Track (JSON)
- Click "Import" button
- Select .json file
- Track loads with all settings
- Validates file format
- Shows success/error message

#### Save to Database
- Stores track in backend
- Requires track name
- Requires at least 1 element
- Accessible in Simulate Race
- Includes full track data for future editing

### 🎯 Usage Workflow

#### 1. Start Design
```
Click "Straight" or "Corner" buttons
→ Element appears on canvas
→ Drag to position
```

#### 2. Customize Element
```
Select element
→ Adjust properties in left panel
→ See real-time metric updates
```

#### 3. Build Track
```
Add more elements
→ Position them in sequence
→ Mark sectors
→ Add DRS zones
```

#### 4. Optimize
```
Check metrics panel
→ Adjust for desired difficulty
→ Balance overtaking opportunities
→ Ensure adequate safety
```

#### 5. Save
```
Enter track name
→ Set number of laps
→ Click "Save Track to Database"
→ Track available for racing
```

## Best Practices

### Track Design Tips

1. **Start-Finish Straight**
   - Make it long (400-800m)
   - Perfect for DRS zone
   - Leads to first corner

2. **Corner Variety**
   - Mix fast and slow corners
   - Vary banking angles
   - Different lengths for character

3. **Elevation Strategy**
   - Gradual changes feel natural
   - Steep sections add drama
   - Balance ups and downs

4. **DRS Placement**
   - Long straights before corners
   - Maximum 2-3 zones per lap
   - Creates overtaking opportunities

5. **Sector Division**
   - Sector 1: First third
   - Sector 2: Middle section
   - Sector 3: Final third
   - Helps identify track strengths

### Metric Targets

**For Balanced Racing:**
- Difficulty: 40-60
- Safety Rating: 60-80
- Overtake Points: 3-5
- Length: 4-6 km
- Elevation: 20-50m

**For Technical Tracks:**
- Difficulty: 60-80
- More corners than straights
- Lower banking angles
- Significant elevation

**For Speed Tracks:**
- Difficulty: 20-40
- Long straights
- High banking in corners
- Multiple DRS zones

## Troubleshooting

### Performance Issues
- Limit elements to <50 for smooth performance
- Clear browser cache if sluggish
- Use Chrome/Firefox for best SVG performance

### Import Errors
- Ensure JSON is valid
- Check file isn't corrupted
- Verify all required fields present
- Use exported files as templates

### Save Failures
- Check track name is unique
- Ensure elements exist
- Verify backend is running
- Check network connection

## Advanced Techniques

### Banking Optimization
- High-speed corners: 10-20° banking
- Low-speed corners: 0-5° banking
- Oval-style sections: 25-30° banking

### Elevation Profiles
- Uphill before corners: Increases braking challenge
- Downhill after corners: Aids acceleration
- Crest: Reduces downforce, exciting but risky

### Sector Strategy
- Sector 1: Technical section
- Sector 2: High-speed section
- Sector 3: Mixed for final push

### Real-World Inspiration
- Monaco: Tight, technical, low speed
- Monza: High speed, low downforce
- Spa: Elevation, fast corners, challenging
- COTA: Mix of everything

## Keyboard Power User Tips

```
1. Ctrl+Z repeatedly to compare versions
2. Drag + Delete for quick repositioning
3. Export before major changes
4. Import to create track variations
5. Use grid for alignment
```

## Export Use Cases

1. **Backup**: Save work in progress
2. **Sharing**: Send tracks to others
3. **Versioning**: Keep multiple iterations
4. **Templates**: Create base layouts
5. **Analysis**: Review metrics offline

## Future Enhancement Ideas

- Copy/paste elements
- Mirror track sections
- Auto-connect elements
- 3D preview
- Track validation rules
- AI suggestions
- Weather simulation
- Track surface types
- Pit lane design
- Marshal post placement

## Technical Details

### Canvas Coordinate System
- Origin (0,0) at top-left
- X-axis: Left to right (0-800)
- Y-axis: Top to bottom (0-600)
- Preserved aspect ratio on resize

### Element Rendering
- SVG path elements
- Stroke-based visualization
- Transform for positioning
- CSS transitions for smoothness

### State Management
- React useState for current state
- Custom hook for history
- Immutable state updates
- Efficient re-rendering

### Metrics Calculation
- Pure functions, no side effects
- Cached calculations
- Real-time updates
- Accurate physics models

