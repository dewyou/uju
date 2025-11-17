# Deployment Guide

## Overview

This project has two parts:
1. **Frontend** (HTML/CSS/JS) - Deploy to GitHub Pages
2. **Backend** (Node.js/Express) - Deploy to Railway, Render, or Heroku

## Step 1: Deploy Backend to Railway (Recommended - Free & Easy)

### Option A: Railway (Easiest - Free Tier Available)

1. **Sign up**: Go to https://railway.app and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository

3. **Configure Environment Variables**:
   - In Railway dashboard, go to your project → Variables
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
   - Add: `PORT` = `3000` (optional, Railway sets this automatically)

4. **Deploy**:
   - Railway will automatically detect `package.json` and deploy
   - Wait for deployment to complete
   - Copy your app URL (e.g., `https://your-app-name.up.railway.app`)

5. **Update Frontend**:
   - Edit `matchmaker.html`
   - Change line 12: `<body data-api-url="">`
   - To: `<body data-api-url="https://your-app-name.up.railway.app">`
   - Commit and push to GitHub

### Option B: Render (Free Tier Available)

1. **Sign up**: Go to https://render.com and sign up

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure**:
   - **Name**: `uju-foreal-backend` (or any name)
   - **Root Directory**: `unititled` (if your server.js is in unititled folder)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables**:
   - `OPENAI_API_KEY` = `your_openai_api_key_here`
   - `PORT` = `3000` (optional)

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment
   - Copy your service URL (e.g., `https://uju-foreal-backend.onrender.com`)

6. **Update Frontend**:
   - Edit `matchmaker.html`
   - Change: `<body data-api-url="https://uju-foreal-backend.onrender.com">`
   - Commit and push

### Option C: Heroku (Free Tier Discontinued, but Still Works)

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   cd unititled
   heroku create your-app-name
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   # or
   git push heroku master
   ```

6. **Get URL**:
   ```bash
   heroku info
   ```
   Copy the web URL

7. **Update Frontend**:
   - Edit `matchmaker.html`
   - Change: `<body data-api-url="https://your-app-name.herokuapp.com">`
   - Commit and push

## Step 2: Deploy Frontend to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your GitHub repository
   - Settings → Pages
   - Source: Select your branch (usually `main`)
   - Folder: `/ (root)` or `/unititled` (depending on your structure)
   - Click Save

3. **Your site will be live at**:
   `https://yourusername.github.io/repo-name/unititled/matchmaker.html`

## Step 3: Configure CORS (Important!)

Your backend needs to allow requests from your GitHub Pages domain. Update `server.js`:

```javascript
// Update CORS to allow your GitHub Pages domain
app.use(cors({
  origin: [
    'http://localhost:8000',
    'https://yourusername.github.io'
  ]
}));
```

Or for development, allow all origins (less secure, but easier):
```javascript
app.use(cors()); // Already configured - allows all origins
```

## Testing

1. **Test Backend**: Visit `https://your-backend-url.railway.app` - should show Express error or welcome message
2. **Test Frontend**: Visit your GitHub Pages URL
3. **Check Console**: Open browser DevTools → Console
   - Should see: `API Base URL: https://your-backend-url...`
4. **Test Font Validation**: Type "Inter" in the typeface field - should validate
5. **Test Generation**: Fill form and click Generate - should work!

## Troubleshooting

### Backend not responding
- Check Railway/Render logs for errors
- Verify environment variables are set correctly
- Check that `OPENAI_API_KEY` is valid

### CORS errors
- Update CORS settings in `server.js` to include your GitHub Pages domain
- Or use `cors()` to allow all origins (for development)

### Font validation not working
- Check browser console for errors
- Verify client-side validation is working (should work even without backend)
- Check that font name is in the `GOOGLE_FONTS_LIST`

### Generate button not working
- Backend must be deployed and accessible
- Check that `data-api-url` is set correctly in `matchmaker.html`
- Verify backend URL is correct in browser console

