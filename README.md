# UJU Foreal Matchmaker

A typographic font pair matching tool powered by OpenAI.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

You can copy `.env.example` as a template:
```bash
cp .env.example .env
# Then edit .env and add your actual API key
```

**Important:** The `.env` file is already in `.gitignore` to keep your API key secure. Never commit your API key to version control.

### 3. Start the Backend Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 4. Open the Frontend

**Important:** You must serve the HTML file through a web server, not open it directly (file://), due to CORS restrictions.

**Option A: Using Python (recommended)**
```bash
# Python 3
python3 -m http.server 8000

# Then open http://localhost:8000/matchmaker.html in your browser
```

**Option B: Using Node.js serve**
```bash
npx serve .
# Then open the URL shown in terminal/matchmaker.html
```

**Option C: Using the start script**
```bash
./start-server.sh
# This starts both backend and provides instructions
```

## Troubleshooting

### "Load failed" or "Failed to fetch" Error

1. **Backend server not running**: Make sure you've started the server with `npm start` in a separate terminal
2. **Opening HTML directly**: Don't double-click the HTML file. Use a web server (see step 4 above)
3. **Port conflict**: If port 3000 is in use, change `PORT` in `.env` file
4. **API key not set**: Ensure `.env` file exists with your OpenAI API key

### CORS Errors

If you see CORS errors, you're opening the HTML file directly. Always use a web server (see step 4).

### "OpenAI API key not configured"

Make sure your `.env` file exists and contains:
```
OPENAI_API_KEY=your_key_here
```

## Usage

1. Enter your current typeface in the input field
2. Select an Emotion (Friendly, Formal, Playful, Bold)
3. Select a Style (Classic, Modern, Minimal, Editorial)
4. Click "Generate" to get 12 font pair recommendations
5. Use "Refresh" to regenerate with the same inputs
6. Use "To keep" to save favorites (coming soon)

## Project Structure

- `matchmaker.html` - Frontend UI with embedded styles and JavaScript
- `server.js` - Express backend API proxy
- `package.json` - Node.js dependencies
- `.env` - Environment variables (create this file)
- `.gitignore` - Git ignore rules

## API Endpoint

### POST `/api/generate-matches`

**Request Body:**
```json
{
  "currentTypeface": "Helvetica",
  "emotion": "Friendly",
  "style": "Modern"
}
```

**Response:**
```json
{
  "fontPairs": [
    {
      "font1": "Font Name 1",
      "font2": "Font Name 2",
      "sample1": "A",
      "sample2": "A"
    },
    ...
  ]
}
```

## Security Notes

- API key is stored server-side only
- Backend validates all inputs
- CORS is configured for development (adjust for production)

