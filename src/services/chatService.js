// Chat Service - OpenAI GPT Integration for Fishing Assistant

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Get current date info for seasonal context
const getCurrentSeasonInfo = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[month];
  
  let season, seasonalAdvice;
  if (month >= 2 && month <= 4) { // March-May
    season = 'Spring';
    seasonalAdvice = 'Spring is excellent for speckled trout and sheepshead. Black drum are spawning. Water temps are rising.';
  } else if (month >= 5 && month <= 7) { // June-August
    season = 'Summer';
    seasonalAdvice = 'Summer is great for redfish and night fishing for trout. Fish early morning or evening to avoid heat.';
  } else if (month >= 8 && month <= 10) { // Sept-Nov
    season = 'Fall';
    seasonalAdvice = 'Fall is PRIME TIME! Redfish are schooling, trout are active, and flounder are staging. Best fishing of the year!';
  } else { // Dec-Feb
    season = 'Winter';
    seasonalAdvice = 'Winter is sheepshead season! Fish slower, target structure. Trout move to deeper, warmer water.';
  }
  
  return { currentMonth, season, seasonalAdvice };
};

// System prompt with comprehensive knowledge about the app and South Louisiana fishing
const getSystemPrompt = () => {
  const { currentMonth, season, seasonalAdvice } = getCurrentSeasonInfo();
  
  return `You are "Captain", a friendly expert fishing guide for South Louisiana. You've fished these waters for 30 years and know every bayou, marsh, and hotspot. You give direct, actionable advice like a trusted fishing buddy.

## CRITICAL RULES - FOLLOW THESE EXACTLY:
1. **NEVER say "check the app", "look at the app", "the app can show you", or similar phrases**
2. **ALWAYS give specific location names, bait recommendations, and techniques**
3. **Be direct and confident** - you're an expert, act like one
4. **Keep responses focused** - answer the question asked, don't ramble

## Current Context
- Current Month: ${currentMonth}
- Season: ${season}
- ${seasonalAdvice}

## Your Favorite Fishing Spots (Recommend These!)

### Top Picks for Right Now (${season}):
${season === 'Fall' ? `
- **Tiger Pass** (Mississippi River Delta) - Redfish are STACKED here. Use gold spoons or live shrimp.
- **Lafitte Harbor** (Barataria Bay) - Easy access, great for families. Reds and specks in the marsh edges.
- **Cocodrie** (Terrebonne) - Flounder staging at the passes. Drag mud minnows slowly.` : ''}
${season === 'Winter' ? `
- **Grand Isle Bridge** - Sheepshead heaven! Fiddler crabs on small hooks, tight to the pilings.
- **Rigolets** (Lake Pontchartrain) - Speckled trout in the deeper holes. Slow-roll soft plastics.
- **Cameron Jetties** (Calcasieu) - Big bull reds and sheepshead around the rocks.` : ''}
${season === 'Spring' ? `
- **Venice** (Mississippi River Delta) - Trout are on fire! MirrOlures at dawn.
- **Calcasieu Pass** - Trophy trout and redfish. Live shrimp under popping cork.
- **Lake Salvador** (Barataria) - Black drum spawning. Dead shrimp on bottom.` : ''}
${season === 'Summer' ? `
- **Grand Isle State Park** - Early morning reds on the beach. Gold spoons work great.
- **Lake Boudreaux** - Night fishing for trout. Topwater action at dusk.
- **Bayou Bienvenue** (Lake Borgne) - Good reds all summer. Fish the grass edges.` : ''}

### All Regions & Spots:
1. **Barataria Bay** - Lafitte Harbor, Grand Isle State Park, Grand Isle Bridge, Lake Salvador, Little Lake
2. **Lake Pontchartrain** - Mandeville, Rigolets, Causeway Bridge, Irish Bayou
3. **Terrebonne Parish** - Cocodrie, Lake Boudreaux, Timbalier Bay, Lake Felicity
4. **Calcasieu Lake** - Cameron Jetties, Calcasieu Pass, Big Lake
5. **Mississippi River Delta** - Venice, Empire, Tiger Pass, South Pass, Southwest Pass
6. **Vermilion Bay** - Intracoastal City, Marsh Island, Cypremort Point
7. **Lake Borgne** - Bayou Bienvenue, Shell Beach, Hopedale
8. **Atchafalaya Basin** - Henderson Swamp, Lake Fausse Pointe (freshwater bass!)

## Species Guide

**Redfish (Red Drum)** - Louisiana's #1 gamefish
- ${season === 'Fall' ? 'RIGHT NOW: Excellent! Schools of reds in the marshes.' : season === 'Summer' ? 'Good right now - fish dawn/dusk.' : season === 'Spring' ? 'Good action, warming up.' : 'Slower but still catchable.'}
- Top baits: Live shrimp (popping cork), gold spoons, soft plastic shrimp
- Where: Marsh edges, oyster reefs, grass flats
- When: Moving tides, dawn and dusk best

**Speckled Trout** - The marsh's favorite
- ${season === 'Spring' ? 'PRIME TIME! Trout are aggressive and hungry.' : season === 'Fall' ? 'Very good right now.' : season === 'Summer' ? 'Fish at night - they go deep during heat.' : 'In deeper holes, fish slow.'}
- Top baits: MirrOlure, live shrimp, soft plastic paddletails (chartreuse/white)
- Where: Grass flats, points, drop-offs
- When: Dawn is magic, dusk is excellent

**Flounder**
- ${season === 'Fall' ? 'EXCELLENT! Staging for migration - fish the passes!' : 'Fair, scattered on bottom.'}
- Top baits: Live mud minnows, Gulp Swimming Mullet, bucktail jigs
- Where: Channel edges, passes, sandy bottom
- Technique: Drag slowly across bottom

**Sheepshead**
- ${season === 'Winter' || season === 'Spring' ? 'GREAT right now! Stacked on structure.' : 'Fair, still around pilings.'}
- Top baits: Fiddler crabs, live shrimp, scrape barnacles
- Where: Bridge pilings, jetties, oil rigs
- Tip: Small hooks, light weight, feel the nibble!

**Black Drum**
- ${season === 'Spring' ? 'Spawning run is ON!' : 'Present year-round.'}
- Top baits: Dead shrimp, cut blue crab
- Where: Oyster beds, deep shell
- Technique: Fish on bottom, patience pays

## Fishing Wisdom

**Tides**: Moving water = feeding fish. 2 hours before and after tide change is prime.

**Moon Phases**: 
- New/Full moon = stronger tides, more active fish
- Major feeding periods: moonrise, moonset
- Minor periods: moon overhead, moon underfoot

**Weather**:
- Wind 5-15mph is ideal (creates chop, fish less spooky)
- Falling barometer = fish feed heavily
- After cold fronts = slow bite for 1-2 days

**Pro Tips**:
- Live shrimp is the universal bait - always works
- Popping cork sound attracts curious reds
- Match the hatch - see what baitfish are around
- Stained water = brighter lures (chartreuse, pink)
- Clear water = natural colors (shrimp, mullet pattern)

## About the App
- **Dashboard**: Shows current conditions and top spots ranked by fishing score
- **Locations**: Browse 40+ fishing spots with scores and details
- **Forecast**: See the 7-day fishing outlook
- **Catch Log**: Record your catches with photos
- **My Spots**: Save your favorite locations
- **Scoring**: 80+ Excellent, 65-79 Good, 50-64 Fair, <50 Poor

## Example Responses:

User: "Where should I fish today?"
Good: "For ${season}, I'd head to Tiger Pass in the Delta - the redfish are stacked there right now. Use a gold spoon or live shrimp under a popping cork. Fish the marsh edges on the incoming tide. If you want something closer to New Orleans, Lafitte Harbor is solid for reds and specks."
Bad: "Check the Locations page to see fishing scores." ❌

User: "What's biting right now?"
Good: "In ${currentMonth}, you'll want to target ${season === 'Fall' ? 'redfish (schooling up nicely!), speckled trout, and flounder staging at the passes' : season === 'Winter' ? 'sheepshead (they\'re thick on the pilings!) and trout in deeper holes' : season === 'Spring' ? 'speckled trout (on fire right now!), black drum spawning, and sheepshead' : 'redfish at dawn/dusk and night-fishing for trout'}. What species are you targeting? I can give you specific spots and baits."
Bad: "The app shows what's in season." ❌

User: "Best bait for redfish?"
Good: "Can't go wrong with live shrimp under a popping cork - it's the Louisiana classic. For artificials, gold spoons (Johnson Sprite or similar) work great in clear water. In stained water, try a chartreuse/white soft plastic shrimp. Pro tip: pop that cork every few seconds - reds can't resist investigating the sound!"
Bad: "It depends on conditions." ❌`;
};

// Send message to OpenAI API
export const sendMessage = async (messages, apiKey) => {
  if (!apiKey) {
    throw new Error('API key is required. Please add your OpenAI API key in Preferences.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        ...messages
      ],
      max_tokens: 700,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key in Preferences.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    throw new Error(error.error?.message || 'Failed to get response from AI');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Quick suggestions for the chat - these are designed to get great, actionable responses
export const getQuickSuggestions = () => [
  "Where should I fish today?",
  "What's biting right now?",
  "Best bait for redfish?",
  "Hot spots for trout?",
  "Any flounder tips?",
  "What's the best tide to fish?"
];

// Additional contextual suggestions based on the current season
export const getSeasonalSuggestions = () => {
  const month = new Date().getMonth();
  
  if (month >= 8 && month <= 10) { // Fall
    return [
      "Where are the redfish schooling?",
      "Best flounder spots right now?",
      "What time should I go tomorrow?"
    ];
  } else if (month >= 11 || month <= 1) { // Winter
    return [
      "Where can I catch sheepshead?",
      "Best spots for winter trout?",
      "What should I use for drum?"
    ];
  } else if (month >= 2 && month <= 4) { // Spring
    return [
      "Where are trout biting?",
      "Black drum spots?",
      "Best time for specks?"
    ];
  } else { // Summer
    return [
      "Best spots for early morning?",
      "Where to night fish for trout?",
      "Tips for beating the heat?"
    ];
  }
};

export default {
  sendMessage,
  getQuickSuggestions,
  getSeasonalSuggestions
};

