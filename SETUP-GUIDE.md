# 🚀 CFLAR Chatbot - Complete Setup Guide

**Follow these steps IN ORDER to get your secure chatbot live!**

---

## ⚠️ STEP 0: Revoke Your Old API Key (DO THIS FIRST!)

Your API key was stolen, so we need to revoke it immediately:

1. Go to: **https://platform.openai.com/api-keys**
2. Find your current key (the one that was stolen)
3. Click the **trash icon** or "Revoke" button
4. Confirm deletion

✅ **Done? Great! Now the thief can't use it anymore.**

**DO NOT create a new key yet** - we'll do that in Step 3.

---

## 📦 STEP 1: Download Your Project to Your Computer

### **Option A: Use GitHub Desktop (Easiest for Beginners)**

1. **Download this project as a ZIP:**
   - If you're reading this in Figma Make, you need to download all the files
   - Ask me to provide a download link or copy all files manually

2. **Extract the ZIP file:**
   - Right-click the ZIP → "Extract All"
   - Choose a location (like your Documents folder)
   - Name the folder: `cflar-chatbot`

3. **Install GitHub Desktop:**
   - Go to: https://desktop.github.com/
   - Download and install it
   - Sign in with your GitHub account

### **Option B: Use Command Line (If You're Comfortable)**

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you want the project:
   ```bash
   cd Documents
   ```
3. We'll upload it to GitHub in the next step

---

## 🌐 STEP 2: Upload Your Code to GitHub

### **Using GitHub Desktop (Recommended):**

1. Open GitHub Desktop
2. Click **"File"** → **"Add Local Repository"**
3. Click **"Choose..."** and select your `cflar-chatbot` folder
4. Click **"Create a repository"** if prompted
5. Click **"Publish repository"** in the top bar
6. **IMPORTANT:** Uncheck "Keep this code private" (unless you have GitHub Pro)
7. Click **"Publish Repository"**

✅ **Your code is now on GitHub!**

### **Using Command Line:**

```bash
cd path/to/cflar-chatbot
git init
git add .
git commit -m "Initial commit - Secure CFLAR chatbot"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cflar-chatbot.git
git push -u origin main
```

*(Replace YOUR-USERNAME with your actual GitHub username)*

---

## ☁️ STEP 3: Deploy to Vercel (Free Hosting + Backend)

**What is Vercel?**  
Think of it like a super-smart web hosting service that:
- Hosts your chatbot for FREE
- Keeps your API key SECRET (server-side)
- Automatically updates when you push to GitHub
- Handles all the technical backend stuff

### **Setup Steps:**

1. **Sign up for Vercel:**
   - Go to: **https://vercel.com/signup**
   - Click **"Continue with GitHub"**
   - Authorize Vercel to access your GitHub account

2. **Import your project:**
   - Click **"Add New..."** → **"Project"**
   - Find your `cflar-chatbot` repository
   - Click **"Import"**

3. **Configure the project:**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (should auto-fill)
   - **Output Directory:** `dist` (should auto-fill)
   - Click **"Deploy"**

4. **Wait for deployment:**
   - You'll see a loading screen with fun animations
   - This takes about 1-2 minutes
   - ✅ When it says "Congratulations!" you're live!

5. **Save your Vercel URL:**
   - It will look like: `https://cflar-chatbot.vercel.app`
   - **Write this down** - you'll need it for WordPress!

---

## 🔐 STEP 4: Add Your OpenAI API Key (Securely!)

**NOW we create a new API key and store it safely.**

### **Part A: Create a NEW OpenAI API Key**

1. Go to: **https://platform.openai.com/api-keys**
2. Click **"Create new secret key"**
3. Give it a name: `CFLAR Chatbot - Vercel`
4. Click **"Create secret key"**
5. **COPY THE KEY** - it starts with `sk-proj-...`
   - ⚠️ **You can only see this ONCE!**
   - Paste it in a safe place temporarily (like Notepad)

### **Part B: Set Usage Limits (Important!)**

While you're in the OpenAI dashboard:

1. Go to: **https://platform.openai.com/account/limits**
2. Click **"Set monthly limit"**
3. Enter a safe amount: **$10** or **$20** per month
4. Enable **email alerts** at 75% usage
5. Click **"Save"**

✅ **Now even if something goes wrong, you won't get a huge bill!**

### **Part C: Add the API Key to Vercel (THE SECURE WAY)**

1. Go back to your Vercel dashboard
2. Click on your **cflar-chatbot** project
3. Click **"Settings"** (top navigation)
4. Click **"Environment Variables"** (left sidebar)
5. Add a new variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Paste your API key (`sk-proj-...`)
   - **Environment:** Check ALL boxes (Production, Preview, Development)
6. Click **"Save"**

### **Part D: Redeploy to Apply the Key**

1. Click **"Deployments"** (top navigation)
2. Find the latest deployment (top of the list)
3. Click the **"..."** menu (three dots) on the right
4. Click **"Redeploy"**
5. Confirm by clicking **"Redeploy"**

✅ **Done! Your chatbot now has secure access to OpenAI!**

---

## 🧠 STEP 5: Update the Knowledge Base with Your Website Content

**This is where the magic happens!** The scraper will read your website and teach the AI about CFLAR.

### **On Your Computer:**

1. **Open Terminal/Command Prompt**
2. **Navigate to your project folder:**
   ```bash
   cd path/to/cflar-chatbot
   ```
   
   Example:
   ```bash
   cd Documents/cflar-chatbot
   ```

3. **Install dependencies** (first time only):
   ```bash
   npm install
   ```
   
   This will take 2-3 minutes and install all the tools needed.

4. **Run the scraper:**
   ```bash
   npm run scrape
   ```

   You'll see:
   ```
   🔍 Starting CFLAR website scrape...
   
   Scraping: https://cflar.org/
     ✓ Successfully scraped: Central Florida Animal Reserve
   Scraping: https://cflar.org/about
     ✓ Successfully scraped: About CFLAR
   ...
   
   ✅ Scraping complete!
   📝 Scraped 9 pages
   💾 Saved to: public/knowledge-base.json
   ```

5. **Upload the new knowledge base to GitHub:**
   ```bash
   git add lib/knowledge-base-data.ts
   git commit -m "Update knowledge base with latest website content"
   git push
   ```

✅ **Vercel will automatically detect the change and redeploy!**

---

## 🎨 STEP 6: Embed the Chatbot on Your WordPress Site

**Now let's put the chatbot on your actual website!**

### **Get the Embed Code:**

Your chatbot is hosted at: `https://YOUR-PROJECT-NAME.vercel.app`

The embed code is:

```html
<!-- CFLAR Chatbot Widget -->
<div id="cflar-chatbot-root"></div>
<script type="module" crossorigin src="https://YOUR-PROJECT-NAME.vercel.app/assets/index.js"></script>
<link rel="stylesheet" href="https://YOUR-PROJECT-NAME.vercel.app/assets/index.css">
```

**Replace `YOUR-PROJECT-NAME` with your actual Vercel URL!**

### **Add to WordPress - Method 1: Using a Plugin (Easiest)**

1. **Install "Insert Headers and Footers" plugin:**
   - In WordPress, go to: **Plugins → Add New**
   - Search for: **"Insert Headers and Footers"**
   - Click **"Install Now"** → **"Activate"**

2. **Add the embed code:**
   - Go to: **Settings → Insert Headers and Footers**
   - Scroll to **"Scripts in Footer"**
   - Paste the embed code (with YOUR Vercel URL)
   - Click **"Save"**

3. **Test it:**
   - Visit your website: **https://cflar.org**
   - You should see a brown chat button in the bottom-right corner!
   - Click it and try asking: "What is CFLAR?"

### **Add to WordPress - Method 2: Edit Theme Files (Advanced)**

1. Go to: **Appearance → Theme File Editor**
2. **WARNING:** If you see a warning, click "I understand"
3. Find **footer.php** in the right sidebar
4. Scroll to the bottom (just before `</body>`)
5. Paste the embed code
6. Click **"Update File"**

✅ **Your chatbot is now live on your website!**

---

## 🧪 STEP 7: Test Everything

### **Test the Chatbot:**

1. Visit your website: **https://cflar.org**
2. Click the chat button (bottom-right)
3. Try these questions:
   - "What is CFLAR?"
   - "How do I book a tour?"
   - "How can I donate?"
   - "Tell me about your animals"

### **Expected Behavior:**

✅ **Good responses:** Detailed answers with relevant links  
✅ **Accurate info:** Based on your actual website content  
✅ **No errors:** Smooth, fast responses  

❌ **If something's wrong:**
- Check Vercel logs: Your Project → "Logs"
- Make sure `OPENAI_API_KEY` is set in Vercel
- Make sure you redeployed after adding the key

---

## 🎉 YOU'RE DONE! What Now?

### **Your Chatbot is Now:**
- ✅ **Live** on your WordPress site
- ✅ **Secure** (API key is hidden server-side)
- ✅ **Smart** (knows your website content)
- ✅ **Backed up** (code is on GitHub)
- ✅ **Free to host** (on Vercel)

### **Regular Maintenance:**

**Update the knowledge base when your website changes:**
```bash
npm run scrape
git add lib/knowledge-base-data.ts
git commit -m "Update knowledge base"
git push
```

**Monitor your OpenAI usage:**
- Check monthly: https://platform.openai.com/usage
- You should stay under $10/month for normal traffic

---

## 🆘 Troubleshooting

### **"The chatbot button doesn't appear on my WordPress site"**
- Check the embed code - make sure the Vercel URL is correct
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors (F12 → Console tab)

### **"The chatbot says 'Error connecting'"**
- Check that `OPENAI_API_KEY` is set in Vercel
- Make sure you redeployed after adding the key
- Check Vercel logs for errors

### **"The chatbot gives wrong information"**
- Run `npm run scrape` to update the knowledge base
- Check `public/knowledge-base.json` to see what was scraped
- Push the updated file to GitHub

### **"I'm getting charged a lot by OpenAI"**
- Check usage: https://platform.openai.com/usage
- Set monthly limits: https://platform.openai.com/account/limits
- Consider if someone is abusing your chatbot

---

## 📞 Need Help?

- **Vercel Issues:** https://vercel.com/docs
- **OpenAI Issues:** https://platform.openai.com/docs
- **GitHub Issues:** https://docs.github.com/

---

**Congrats! You now have a professional, secure AI chatbot! 🐯**