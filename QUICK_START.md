# Quick Start: Deploy Backend to Railway

## 🚀 Fastest Way to Deploy (5 minutes)

### Step 1: Deploy Backend to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with your GitHub account
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository** (`uju_guru`)
5. **Select the root directory**: If your `server.js` is in `unititled/`, set root directory to `unititled`
6. **Add Environment Variable**:
   - Click on your project → **Variables** tab
   - Add: `OPENAI_API_KEY` = `your_actual_openai_api_key`
   - (Railway automatically sets `PORT`, so you don't need to add it)
7. **Wait for deployment** (usually 1-2 minutes)
8. **Copy your app URL** from the dashboard (looks like: `https://your-app-name.up.railway.app`)

### Step 2: Update Frontend

1. **Open** `matchmaker.html`
2. **Find line 12**: `<body data-api-url="">`
3. **Replace with**: `<body data-api-url="https://your-app-name.up.railway.app">`
   - Use the URL you copied from Railway
4. **Save and commit**:
   ```bash
   git add matchmaker.html
   git commit -m "Configure backend URL for GitHub Pages"
   git push origin main
   ```

### Step 3: Deploy Frontend to GitHub Pages

1. **Go to your GitHub repository**
2. **Settings** → **Pages**
3. **Source**: Select your branch (usually `main`)
4. **Folder**: `/unititled` (or `/` if your HTML files are in root)
5. **Click Save**

Your site will be live at: `https://yourusername.github.io/uju_guru/unititled/matchmaker.html`

### Step 4: Test It!

1. **Visit your GitHub Pages URL**
2. **Open browser console** (F12 → Console)
3. **You should see**: `API Base URL: https://your-app-name.up.railway.app`
4. **Try generating matches** - it should work! 🎉

## 🔧 Troubleshooting

### Backend URL not showing in console
- Check that `data-api-url` is set correctly in `matchmaker.html`
- Make sure you saved and pushed the changes

### "Failed to generate matches" error
- Check Railway logs: Go to Railway dashboard → your project → **Deployments** → click latest deployment → **View Logs**
- Verify `OPENAI_API_KEY` is set correctly in Railway Variables
- Make sure backend is running (check Railway dashboard shows "Active")

### CORS errors
- The backend is configured to allow all origins, so this shouldn't happen
- If it does, check Railway logs for errors

## 📝 Notes

- **Railway free tier**: 500 hours/month free, $5 credit/month
- **Backend sleeps**: After inactivity, Railway may sleep your app (first request will be slow)
- **Upgrade**: If you need always-on, Railway has paid plans

## Alternative: Render.com

If Railway doesn't work, try Render:

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: `OPENAI_API_KEY=your_key`
5. Deploy and copy URL
6. Update `matchmaker.html` with Render URL

