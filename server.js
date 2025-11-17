const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Google Fonts validation endpoint
app.post('/api/validate-google-font', async (req, res) => {
  try {
    const { fontName } = req.body;
    
    if (!fontName) {
      return res.status(400).json({ 
        isValid: false,
        error: 'Font name is required' 
      });
    }

    // Try to fetch Google Fonts list from public CDN
    // Using a comprehensive list approach since Google Fonts API requires authentication
    const comprehensiveGoogleFonts = [
      // Popular fonts
      'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
      'Raleway', 'PT Sans', 'Merriweather', 'Playfair Display', 'Poppins',
      'Roboto Condensed', 'Roboto Slab', 'Lora', 'Ubuntu', 'Noto Sans',
      'Nunito', 'Dancing Script', 'Crimson Text', 'Bitter', 'Arimo', 'PT Serif',
      'Droid Sans', 'Droid Serif', 'Fjalla One', 'Indie Flower', 'Shadows Into Light',
      'Pacifico', 'Bebas Neue', 'Anton', 'Cabin', 'Josefin Sans', 'Libre Baskerville',
      'Muli', 'Quicksand', 'Rokkitt', 'Titillium Web', 'Varela Round', 'Work Sans',
      'Yanone Kaffeesatz', 'Abril Fatface', 'Amatic SC', 'Bangers', 'Comfortaa',
      'Courgette', 'Crete Round', 'Dosis', 'Fira Sans', 'Inconsolata', 'Karla',
      'Lobster', 'Lobster Two', 'Maven Pro', 'Oxygen', 'PT Sans Narrow', 'Righteous',
      'Satisfy', 'Tangerine', 'Vollkorn', 'Alegreya', 'Alegreya Sans', 'Archivo',
      'Archivo Narrow', 'Barlow', 'Cormorant', 'Crimson Pro', 'DM Sans', 'DM Serif Display',
      'Fira Code', 'Inter', 'JetBrains Mono', 'Manrope', 'Space Grotesk', 'Space Mono',
      'Syne', 'Comfortaa', 'Exo', 'Exo 2', 'Fira Mono', 'Hind', 'Kanit', 'Mukta',
      'Nunito Sans', 'Orbitron', 'Rajdhani', 'Rubik', 'Saira', 'Teko', 'Zilla Slab',
      'Acme', 'Bree Serif', 'Cantarell', 'Cuprum', 'Droid Sans Mono', 'Francois One',
      'Fredoka One', 'Gloria Hallelujah', 'Great Vibes', 'Kalam', 'Lato', 'Lobster',
      'Merriweather Sans', 'Monoton', 'Montserrat Alternates', 'Muli', 'Nixie One',
      'Old Standard TT', 'Oswald', 'Overpass', 'Permanent Marker', 'Playfair Display SC',
      'PT Mono', 'Raleway', 'Righteous', 'Roboto Mono', 'Satisfy', 'Shadows Into Light Two',
      'Source Code Pro', 'Source Serif Pro', 'Spectral', 'Titillium Web', 'Ubuntu Condensed',
      'Ubuntu Mono', 'Varela', 'Vollkorn', 'Yanone Kaffeesatz'
    ];

    // Try to fetch from Google Fonts API (may fail without API key, that's ok)
    let googleFontsList = comprehensiveGoogleFonts;
    try {
      const googleFontsResponse = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity');
      if (googleFontsResponse.ok) {
        const googleFontsData = await googleFontsResponse.json();
        if (googleFontsData.items && googleFontsData.items.length > 0) {
          // Merge API results with comprehensive list
          const apiFonts = googleFontsData.items.map(font => font.family);
          googleFontsList = [...new Set([...comprehensiveGoogleFonts, ...apiFonts])];
        }
      }
    } catch (error) {
      // Use comprehensive list if API fails
      console.log('Using comprehensive Google Fonts list');
    }
    
    // Normalize font name for comparison (case-insensitive, trim spaces)
    const normalizedInput = fontName.trim().toLowerCase();
    const isValid = googleFontsList.some(font => 
      font.toLowerCase() === normalizedInput
    );

    res.json({ isValid, fontName: fontName.trim() });

  } catch (error) {
    console.error('Google Fonts validation error:', error);
    // On error, assume invalid to be safe
    res.json({ isValid: false, error: error.message });
  }
});

// Cache for Google Fonts data
let googleFontsCache = null;
let googleFontsCacheTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fetch and cache Google Fonts list
async function getGoogleFontsList() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (googleFontsCache && googleFontsCacheTime && (now - googleFontsCacheTime) < CACHE_DURATION) {
    return googleFontsCache;
  }
  
  try {
    const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity');
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        googleFontsCache = data.items;
        googleFontsCacheTime = now;
        return googleFontsCache;
      }
    }
  } catch (error) {
    console.error('Error fetching Google Fonts:', error);
  }
  
  // Return empty array if fetch fails
  return [];
}

// Font style categorization function using Google Fonts API data
async function getFontStyle(fontName, googleFontsList = null) {
  const normalized = fontName.toLowerCase().trim();
  
  // If we have Google Fonts API data, use it
  if (googleFontsList && googleFontsList.length > 0) {
    const font = googleFontsList.find(f => f.family.toLowerCase() === normalized);
    if (font && font.category) {
      // Map Google Fonts categories to our style categories
      const categoryMap = {
        'serif': 'Serif',
        'sans-serif': 'Sans Serif',
        'display': 'Display',
        'handwriting': 'Script',
        'monospace': 'Monospace'
      };
      
      // Check for slab serif (usually in serif category but has "slab" in name)
      if (font.category === 'serif' && (normalized.includes('slab') || font.family.toLowerCase().includes('slab'))) {
        return 'Slab Serif';
      }
      
      return categoryMap[font.category] || null;
    }
  }
  
  // Fallback to hardcoded lists if API data not available
  const serifFonts = [
    'merriweather', 'lora', 'playfair display', 'crimson text', 'libre baskerville', 
    'bitter', 'pt serif', 'noto serif', 'droid serif', 'vollkorn', 'alegreya',
    'cardo', 'spectral', 'gentium basic', 'tisa', 'noto serif display', 'old standard tt',
    'bree serif', 'cormorant', 'cormorant garamond', 'eb garamond', 'laila', 'marcellus',
    'marcellus sc', 'mukta', 'prata', 'quattrocento', 'quattrocento sans', 'rufina',
    'sanchez', 'sorts mill goudy', 'taviraj', 'trirong', 'yeseva one', 'abril fatface',
    'alegreya sc', 'arvo', 'baskervville', 'bevan', 'bree serif', 'castoro', 'cinzel',
    'cormorant', 'cormorant garamond', 'cormorant infant', 'cormorant sc', 'cormorant unicase',
    'crimson pro', 'della respira', 'eb garamond', 'faustina', 'goudy bookletter 1911',
    'im fell', 'josefin slab', 'karma', 'knewave', 'libre baskerville', 'lora',
    'marcellus', 'marcellus sc', 'merriweather', 'merriweather sans', 'neuton',
    'old standard tt', 'oswald', 'playfair display', 'playfair display sc', 'pt serif',
    'quattrocento', 'quattrocento sans', 'rufina', 'sanchez', 'sorts mill goudy',
    'spectral', 'taviraj', 'trirong', 'vollkorn', 'yeseva one'
  ];
  
  // Sans Serif fonts
  const sansSerifFonts = [
    'roboto', 'open sans', 'lato', 'montserrat', 'poppins', 'raleway', 'source sans pro',
    'nunito', 'work sans', 'ubuntu', 'noto sans', 'droid sans', 'arimo', 'cabin',
    'josefin sans', 'muli', 'quicksand', 'titillium web', 'varela round', 'yanone kaffeesatz',
    'comfortaa', 'dosis', 'fira sans', 'karla', 'maven pro', 'oxygen', 'pt sans',
    'pt sans narrow', 'hind', 'kanit', 'mukta', 'nunito sans', 'overpass', 'rubik',
    'saira', 'teko', 'acme', 'cantarell', 'exo', 'exo 2', 'inter', 'manrope',
    'space grotesk', 'syne', 'dm sans', 'heebo', 'rajdhani', 'archivo', 'archivo narrow',
    'barlow', 'crimson pro', 'dm sans', 'fira sans', 'hind', 'inter', 'karla',
    'manrope', 'mukta', 'nunito', 'nunito sans', 'open sans', 'overpass', 'poppins',
    'raleway', 'roboto', 'rubik', 'saira', 'source sans pro', 'space grotesk', 'syne',
    'teko', 'titillium web', 'ubuntu', 'varela round', 'work sans', 'yanone kaffeesatz'
  ];
  
  // Slab Serif fonts
  const slabSerifFonts = [
    'roboto slab', 'zilla slab', 'bitter', 'arvo', 'rockwell', 'courier prime',
    'josefin slab', 'knewave', 'neuton', 'oswald', 'playfair display sc', 'rufina',
    'sanchez', 'sorts mill goudy', 'taviraj', 'trirong', 'yeseva one', 'alegreya sc',
    'bevan', 'castoro', 'cinzel', 'cormorant sc', 'cormorant unicase', 'della respira',
    'faustina', 'goudy bookletter 1911', 'im fell', 'karma', 'libre baskerville',
    'marcellus sc', 'merriweather sans', 'old standard tt', 'playfair display sc',
    'quattrocento', 'quattrocento sans', 'rufina', 'sanchez', 'sorts mill goudy',
    'spectral', 'taviraj', 'trirong', 'vollkorn', 'yeseva one'
  ];
  
  // Display fonts
  const displayFonts = [
    'bebas neue', 'oswald', 'anton', 'fjalla one', 'righteous', 'bangers', 'impact',
    'black ops one', 'alfa slab one', 'archivo black', 'bungee', 'bungee inline',
    'bungee outline', 'bungee shade', 'creepster', 'eater', 'fascinate', 'fascinate inline',
    'flamenco', 'fredoka one', 'fredoka one', 'galada', 'iceberg', 'knewave',
    'lilita one', 'londrina outline', 'londrina shadow', 'londrina sketch', 'londrina solid',
    'megrim', 'monoton', 'nixie one', 'nosifer', 'piedra', 'plaster', 'press start 2p',
    'ranchers', 'ribeye', 'ribeye marrow', 'rubik mono one', 'sail', 'sarina',
    'seymour one', 'sigmar one', 'snowburst one', 'spicy rice', 'stalinist one',
    'stint ultra condensed', 'stint ultra expanded', 'wallpoet', 'wellfleet'
  ];
  
  // Script fonts
  const scriptFonts = [
    'dancing script', 'pacifico', 'satisfy', 'great vibes', 'kalam', 'indie flower',
    'shadows into light', 'lobster', 'lobster two', 'courgette', 'crete round',
    'gloria hallelujah', 'tangerine', 'amatic sc', 'comfortaa', 'permanent marker',
    'shadows into light two', 'allura', 'allura', 'brush script mt', 'caveat',
    'caveat brush', 'dancing script', 'dawning of a new day', 'delius', 'delius swash caps',
    'devonshire', 'ephesis', 'euphoria script', 'felipa', 'fondamento', 'gabriela',
    'germania one', 'gloria hallelujah', 'grand hotel', 'great vibes', 'handlee',
    'herr von muellerhoff', 'homemade apple', 'indie flower', 'kalam', 'kaushan script',
    'knewave', 'kristi', 'la belle aurore', 'leckerli one', 'lobster', 'lobster two',
    'marck script', 'meddon', 'mrs saint delafield', 'mrs sheppards', 'norican',
    'nothing you could do', 'niconne', 'pacifico', 'parisienne', 'permanent marker',
    'pinyon script', 'princess sofia', 'qwigley', 'ranchers', 'redressed', 'rochester',
    'rouge script', 'sacramento', 'sail', 'satisfy', 'seaweed script', 'shadows into light',
    'shadows into light two', 'snowburst one', 'sonsie one', 'special elite', 'spirax',
    'stint ultra condensed', 'stint ultra expanded', 'tangerine', 'uncial antiqua',
    'walter turncoat', 'wellfleet', 'yellowtail', 'zeyada'
  ];
  
  // Monospace fonts
  const monospaceFonts = [
    'roboto mono', 'source code pro', 'fira code', 'inconsolata', 'jetbrains mono',
    'space mono', 'courier prime', 'droid sans mono', 'pt mono', 'ubuntu mono',
    'fira mono', 'overpass mono', 'share tech mono', 'vt323', 'cousine',
    'cutive mono', 'ibm plex mono', 'major mono display', 'nanum gothic coding',
    'noto sans mono', 'oxygen mono', 'red hat mono', 'rubik mono one', 'share tech',
    'source code pro', 'syne mono', 'xanh mono'
  ];
  
  // Check each category - use exact match first, then partial
  // Priority order matters: check more specific categories first
  
  // Monospace (very specific)
  if (monospaceFonts.some(f => normalized === f || normalized.startsWith(f + ' ') || normalized.endsWith(' ' + f))) return 'Monospace';
  if (normalized.includes('mono') || normalized.includes('code')) return 'Monospace';
  
  // Script (very specific)
  if (scriptFonts.some(f => normalized === f || normalized.startsWith(f + ' ') || normalized.endsWith(' ' + f))) return 'Script';
  if (normalized.includes('script') || normalized.includes('handwriting')) return 'Script';
  
  // Display (check before slab serif to avoid conflicts)
  if (displayFonts.some(f => normalized === f || normalized.startsWith(f + ' ') || normalized.endsWith(' ' + f))) return 'Display';
  
  // Slab Serif (check before serif)
  if (slabSerifFonts.some(f => normalized === f || normalized.startsWith(f + ' ') || normalized.endsWith(' ' + f))) return 'Slab Serif';
  if (normalized.includes('slab')) return 'Slab Serif';
  
  // Sans Serif (check before serif)
  if (sansSerifFonts.some(f => normalized === f || normalized.startsWith(f + ' ') || normalized.endsWith(' ' + f))) return 'Sans Serif';
  if (normalized.includes('sans') && !normalized.includes('serif')) return 'Sans Serif';
  
  // Serif (last, as it's the most general)
  if (serifFonts.some(f => normalized === f || normalized.startsWith(f + ' ') || normalized.endsWith(' ' + f))) return 'Serif';
  if (normalized.includes('serif') && !normalized.includes('sans') && !normalized.includes('slab')) return 'Serif';
  
  return null; // Unknown style
}

// OpenAI API endpoint
app.post('/api/generate-matches', async (req, res) => {
  try {
    const { currentTypeface, emotion, style, previousPairs } = req.body;

    // Validate inputs (currentTypeface is optional, emotion and style are required)
    if (!emotion || !style) {
      return res.status(400).json({ 
        error: 'Missing required fields: emotion and style are required' 
      });
    }
    
    // Normalize currentTypeface (can be empty/undefined)
    const normalizedCurrentTypeface = currentTypeface ? currentTypeface.trim() : '';
    
    // Normalize previous pairs for exclusion
    const excludePairs = previousPairs && Array.isArray(previousPairs) 
      ? previousPairs.map(p => ({ 
          font1: (p.font1 || '').trim().toLowerCase(), 
          font2: (p.font2 || '').trim().toLowerCase() 
        }))
      : [];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }

    // Build exclusion list for previous pairs
    let exclusionText = '';
    if (excludePairs.length > 0) {
      const exclusionList = excludePairs.map(p => 
        `- "${p.font1}" paired with "${p.font2}"`
      ).join('\n');
      exclusionText = `\n\nCRITICAL: DO NOT generate any of these previously shown font pairs (they must be completely different):\n${exclusionList}\n\nYou MUST provide 12 completely NEW and UNIQUE font pairs that have NOT been shown before.`;
    }

    // Fetch Google Fonts list and filter by style
    const googleFontsList = await getGoogleFontsList();
    
    // Map our style categories to Google Fonts API categories
    const styleToCategory = {
      'Serif': 'serif',
      'Sans Serif': 'sans-serif',
      'Slab Serif': 'serif', // Will filter by name containing "slab"
      'Display': 'display',
      'Script': 'handwriting',
      'Monospace': 'monospace'
    };
    
    // Filter fonts by the selected style - get ALL fonts, not just top 100
    let availableFonts = [];
    if (googleFontsList.length > 0) {
      const targetCategory = styleToCategory[style];
      availableFonts = googleFontsList
        .filter(font => {
          if (style === 'Slab Serif') {
            return font.category === 'serif' && font.family.toLowerCase().includes('slab');
          }
          return font.category === targetCategory;
        })
        .map(font => font.family);
      // No limit - use ALL available fonts!
    }
    
    // Build style examples from actual Google Fonts
    let styleExample = '';
    if (availableFonts.length > 0) {
      // Show first 30 examples, then mention there are more
      const exampleCount = Math.min(30, availableFonts.length);
      const totalCount = availableFonts.length;
      styleExample = `There are ${totalCount} ${style} fonts available on Google Fonts. Examples include: ${availableFonts.slice(0, exampleCount).join(', ')}${totalCount > exampleCount ? `, and ${totalCount - exampleCount} more ${style} fonts` : ''}. You MUST use DIVERSE fonts from across the entire ${style} category - explore beyond just the most popular fonts. Use ANY ${style} font from Google Fonts, not just the examples listed.`;
    } else {
      // Fallback examples if API fails
      const fallbackExamples = {
        'Serif': 'Merriweather, Lora, Playfair Display, Crimson Text, Libre Baskerville, Bitter, PT Serif, Noto Serif',
        'Sans Serif': 'Roboto, Open Sans, Lato, Montserrat, Poppins, Raleway, Source Sans Pro, Nunito, Work Sans',
        'Slab Serif': 'Roboto Slab, Zilla Slab, Bitter, Arvo, Rockwell, Courier Prime',
        'Display': 'Bebas Neue, Oswald, Anton, Fjalla One, Righteous, Bangers, Impact, Black Ops One',
        'Script': 'Dancing Script, Pacifico, Satisfy, Great Vibes, Kalam, Indie Flower, Shadows Into Light',
        'Monospace': 'Roboto Mono, Source Code Pro, Fira Code, Inconsolata, JetBrains Mono, Space Mono, Courier Prime'
      };
      styleExample = `Examples: ${fallbackExamples[style] || ''}`;
    }

    // Craft the prompt for OpenAI
    let prompt;
    if (normalizedCurrentTypeface) {
      // User provided a current typeface - use it as font1
      prompt = `You are a typography expert. Given the following requirements, suggest 12 complementary font pairs for typography matching.

CRITICAL REQUIREMENTS:
- The user's current typeface "${normalizedCurrentTypeface}" MUST be used as font1 (the primary/heading font) in ALL 12 pairs
- ALL fonts (both font1 and font2) MUST be Google Fonts only - use only fonts available on Google Fonts
- Typographic Style: ${style} - font2 MUST be a ${style} typeface ONLY. Do NOT use any fonts from other style categories.
- ${styleExample ? `${styleExample}` : ''}
- Emotion: ${emotion}
- font2 MUST strictly match the ${style} typographic classification - if style is "Serif", font2 must be a serif font; if "Sans Serif", font2 must be sans serif, etc.
- CRITICAL: Use DIVERSE fonts from the ENTIRE Google Fonts catalog. There are ${availableFonts.length > 0 ? availableFonts.length : 'many'} ${style} fonts available. Each font pair MUST use DIFFERENT fonts. Do NOT repeat the same fonts across multiple pairs. Explore the FULL range - use less common, unique fonts from across the entire ${style} category, not just the most popular ones. Maximum diversity is required.
- ALL font pairs must be UNIQUE - no duplicate font2 values across pairs, and ideally no duplicate font1 values either${exclusionText}

For each font pair, provide:
- font1: MUST be "${normalizedCurrentTypeface}" (the user's current typeface)
- font2: A complementary Google Font for the subheading that is STRICTLY a ${style} typeface (must be a real Google Font matching ${style} classification, and must be different from all other font2 values in this response)
- sample1: A single character sample for font1 (typically "A")
- sample2: A single character sample for font2 (typically "A")

IMPORTANT: Generate 15-20 font pairs to ensure we have enough diverse options after filtering. Return ONLY a valid JSON array with at least 15 font pair objects in this exact format:
[
  {
    "font1": "${normalizedCurrentTypeface}",
    "font2": "Google Font Name",
    "sample1": "A",
    "sample2": "A"
  },
  ...
]

Do not include any markdown formatting, explanations, or text outside the JSON array.`;
    } else {
      // No current typeface provided - generate pairs based on style and emotion
      prompt = `You are a typography expert. Given the following requirements, suggest 12 complementary font pairs for typography matching.

CRITICAL REQUIREMENTS:
- ALL fonts (both font1 and font2) MUST be Google Fonts only - use only fonts available on Google Fonts
- Typographic Style: ${style} - BOTH font1 AND font2 MUST be ${style} typefaces ONLY. Do NOT mix styles or use fonts from other categories.
- ${styleExample ? `${styleExample}` : ''}
- Emotion: ${emotion}
- font1 MUST be a ${style} typeface suitable for headings that conveys ${emotion} emotion
- font2 MUST be a complementary ${style} typeface for subheadings that pairs well with font1
- STRICTLY enforce style matching: if style is "Serif", both fonts must be serif; if "Sans Serif", both must be sans serif; if "Slab Serif", both must be slab serif, etc.
- CRITICAL: Use DIVERSE fonts from the ENTIRE Google Fonts catalog. There are ${availableFonts.length > 0 ? availableFonts.length : 'many'} ${style} fonts available. Each font pair MUST use DIFFERENT fonts. Do NOT repeat the same fonts across multiple pairs. Explore the FULL range - use less common, unique fonts from across the entire ${style} category, not just the most popular ones. Maximum diversity is required across all pairs.
- Create diverse font pairings that match the ${style} typographic style and ${emotion} emotion requirements
- ALL font pairs must be COMPLETELY UNIQUE - no duplicate font1 or font2 combinations. Each font should appear at most once across all pairs${exclusionText}

For each font pair, provide:
- font1: A Google Font suitable for headings that is STRICTLY a ${style} typeface and conveys ${emotion} emotion
- font2: A complementary Google Font for subheadings that is STRICTLY a ${style} typeface and pairs well with font1
- sample1: A single character sample for font1 (typically "A")
- sample2: A single character sample for font2 (typically "A")

IMPORTANT: Generate 15-20 font pairs to ensure we have enough diverse options after filtering. Return ONLY a valid JSON array with at least 15 font pair objects in this exact format:
[
  {
    "font1": "Google Font Name 1",
    "font2": "Google Font Name 2",
    "sample1": "A",
    "sample2": "A"
  },
  ...
]

Do not include any markdown formatting, explanations, or text outside the JSON array.`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful typography expert. Always respond with valid JSON arrays only, no markdown or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ 
        error: 'OpenAI API request failed',
        details: errorData 
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      return res.status(500).json({ 
        error: 'No response from OpenAI' 
      });
    }

    // Parse JSON response (handle markdown code blocks if present)
    let fontPairs;
    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      fontPairs = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content received:', content);
      return res.status(500).json({ 
        error: 'Invalid JSON response from OpenAI',
        details: content.substring(0, 200)
      });
    }

    // Validate structure
    if (!Array.isArray(fontPairs) || fontPairs.length === 0) {
      return res.status(500).json({ 
        error: 'Invalid response format: expected array of font pairs' 
      });
    }

    // We requested 15-20 pairs, so we should have plenty
    // Keep all pairs for now - we'll filter and select the best 12 later
    if (fontPairs.length < 12) {
      console.warn(`Only received ${fontPairs.length} pairs from OpenAI, expected at least 15`);
    }

    // Validate each pair has required fields
    // If user provided currentTypeface, ensure it's used as font1; otherwise use AI suggestions
    fontPairs = fontPairs.map((pair, index) => ({
      font1: normalizedCurrentTypeface || pair.font1 || `Font ${index + 1}`, // Use user's input if provided, otherwise use AI suggestion
      font2: pair.font2 || `Pair Font ${index + 1}`,
      sample1: pair.sample1 || 'A',
      sample2: pair.sample2 || 'A'
    }));

    // Remove duplicates within the current response
    const seenPairs = new Set();
    const uniquePairs = [];
    
    for (const pair of fontPairs) {
      const pairKey = `${pair.font1.toLowerCase()}|${pair.font2.toLowerCase()}`;
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        uniquePairs.push(pair);
      }
    }

    // If we have duplicates, we need to regenerate or pad
    // For now, if we have fewer than 12 unique pairs, pad with variations
    if (uniquePairs.length < 12) {
      console.warn(`Only ${uniquePairs.length} unique pairs generated, expected 12`);
      // Try to fill remaining slots (this is a fallback - ideally OpenAI should provide 12 unique)
      while (uniquePairs.length < 12) {
        const lastPair = uniquePairs[uniquePairs.length - 1];
        uniquePairs.push({
          font1: lastPair.font1,
          font2: lastPair.font2 + ' (variant)',
          sample1: lastPair.sample1,
          sample2: lastPair.sample2
        });
      }
    }

    // Final check: ensure no duplicates match previous pairs
    let finalPairs = uniquePairs.filter(pair => {
      const pairKey = `${pair.font1.toLowerCase()}|${pair.font2.toLowerCase()}`;
      return !excludePairs.some(prev => 
        prev.font1 === pair.font1.toLowerCase() && prev.font2 === pair.font2.toLowerCase()
      );
    });

    // CRITICAL: Filter to ensure fonts match the selected style using Google Fonts API data
    // Use a two-pass approach: strict first, then lenient if needed
    const strictPairs = [];
    const lenientPairs = [];
    
    for (const pair of finalPairs) {
      const font1Style = normalizedCurrentTypeface ? null : await getFontStyle(pair.font1, googleFontsList);
      const font2Style = await getFontStyle(pair.font2, googleFontsList);
      
      // Strict match: both fonts match style exactly
      let isStrictMatch = false;
      if (normalizedCurrentTypeface) {
        isStrictMatch = font2Style === style;
      } else {
        isStrictMatch = font1Style === style && font2Style === style;
      }
      
      if (isStrictMatch) {
        strictPairs.push(pair);
        continue;
      }
      
      // Lenient match: check font names for style keywords or allow if style is null (unknown)
      const font1Lower = pair.font1 ? pair.font1.toLowerCase() : '';
      const font2Lower = pair.font2 ? pair.font2.toLowerCase() : '';
      
      let isLenientMatch = false;
      
      // Check font names for style indicators
      if (style === 'Serif') {
        isLenientMatch = font2Lower.includes('serif') || font2Lower.includes('baskerville') || 
                        font2Lower.includes('garamond') || font2Lower.includes('times') ||
                        font2Lower.includes('caslon') || font2Lower.includes('bodoni') ||
                        (normalizedCurrentTypeface ? false : (font1Lower.includes('serif') || font1Lower.includes('baskerville')));
      } else if (style === 'Sans Serif') {
        isLenientMatch = font2Lower.includes('sans') || font2Lower.includes('grotesk') || 
                        font2Lower.includes('gothic') || font2Lower.includes('helvetica') ||
                        (normalizedCurrentTypeface ? false : (font1Lower.includes('sans') || font1Lower.includes('grotesk')));
      } else if (style === 'Slab Serif') {
        isLenientMatch = font2Lower.includes('slab') || font2Lower.includes('rockwell') ||
                        (normalizedCurrentTypeface ? false : font1Lower.includes('slab'));
      } else if (style === 'Monospace') {
        isLenientMatch = font2Lower.includes('mono') || font2Lower.includes('code') ||
                        (normalizedCurrentTypeface ? false : (font1Lower.includes('mono') || font1Lower.includes('code')));
      } else if (style === 'Script') {
        isLenientMatch = font2Lower.includes('script') || font2Lower.includes('handwriting') ||
                        font2Lower.includes('cursive') || font2Lower.includes('brush') ||
                        (normalizedCurrentTypeface ? false : (font1Lower.includes('script') || font1Lower.includes('handwriting')));
      } else if (style === 'Display') {
        isLenientMatch = font2Lower.includes('display') || font2Lower.includes('condensed') ||
                        font2Lower.includes('black') || font2Lower.includes('bold') ||
                        (normalizedCurrentTypeface ? false : (font1Lower.includes('display') || font1Lower.includes('condensed')));
      }
      
      // Also allow if style couldn't be determined (null) - might be valid fonts
      if (!isLenientMatch && (font2Style === null || (normalizedCurrentTypeface ? false : font1Style === null))) {
        isLenientMatch = true; // Give benefit of the doubt
      }
      
      if (isLenientMatch) {
        lenientPairs.push(pair);
      }
    }
    
    // Use strict pairs first, then fill with lenient pairs if needed
    finalPairs = [...strictPairs];
    if (finalPairs.length < 12) {
      finalPairs.push(...lenientPairs.slice(0, 12 - finalPairs.length));
      console.log(`Used ${strictPairs.length} strict matches and ${Math.min(lenientPairs.length, 12 - strictPairs.length)} lenient matches to reach 12 pairs`);
    }

    // Final fallback: if we still don't have 12 pairs, use ALL remaining unique pairs
    if (finalPairs.length < 12) {
      console.warn(`After two-pass filtering, only ${finalPairs.length} pairs match ${style} style. Requested: 12`);
      
      if (finalPairs.length === 0) {
        return res.status(500).json({ 
          error: `No fonts matching ${style} style were generated. Please try again.` 
        });
      }
      
      // Use ALL remaining pairs from uniquePairs that weren't already included
      const remainingPairs = uniquePairs.filter(pair => {
        return !finalPairs.some(fp => 
          fp.font1.toLowerCase() === pair.font1.toLowerCase() && 
          fp.font2.toLowerCase() === pair.font2.toLowerCase()
        );
      });
      
      // Add remaining pairs until we have 12 (or run out)
      const needed = 12 - finalPairs.length;
      finalPairs.push(...remainingPairs.slice(0, needed));
      
      console.log(`Added ${Math.min(needed, remainingPairs.length)} additional pairs from remaining unique pairs. Total: ${finalPairs.length}`);
    }

    res.json({ fontPairs: finalPairs.slice(0, 12) });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

