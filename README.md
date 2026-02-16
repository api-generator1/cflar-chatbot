# CFLAR Secure Chatbot

**Secure AI chatbot for Central Florida Animal Reserve (CFLAR)**

✅ **API key stored server-side** - No one can steal it!  
✅ **RAG-powered** - Answers based on your actual website content  
✅ **WordPress-ready** - Easy to embed  
✅ **Free to host** - Uses Vercel free tier  

---

## 🚨 IMPORTANT: Your Old API Key Was Compromised

If you haven't already:
1. Go to https://platform.openai.com/api-keys
2. Delete/revoke the old API key
3. Follow the setup below to create a new one (stored securely)

---

## 📋 Setup Instructions

### **Step 1: Push to GitHub**

1. Open Terminal/Command Prompt
2. Navigate to this folder:
   ```bash
   cd path/to/cflar-chatbot
   ```

3. Initialize git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Secure CFLAR chatbot"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/cflar-chatbot.git
   git push -u origin main
   ```

   *(Replace YOUR-USERNAME with your GitHub username)*

---

### **Step 2: Deploy to Vercel**

1. Go to: https://vercel.com/signup
2. Sign up with your GitHub account (it's free!)
3. Click "Add New Project"
4. Import your `cflar-chatbot` repository
5. Click "Deploy" (don't change any settings yet)

---

### **Step 3: Add Your OpenAI API Key (Securely!)**

1. **Create a NEW OpenAI API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name: "CFLAR Chatbot - Vercel"
   - **Copy the key** (starts with `sk-proj-...`)
   - ⚠️ Save it somewhere safe - you can only see it once!

2. **Add it to Vercel (this keeps it secret!):**
   - In Vercel, go to your project
   - Click "Settings" → "Environment Variables"
   - Add a new variable:
     - **Name:** `OPENAI_API_KEY`
     - **Value:** Paste your API key (the `sk-proj-...` one)
     - **Environment:** Select all (Production, Preview, Development)
   - Click "Save"

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"

---

### **Step 4: Update Knowledge Base:**
```bash
npm run scrape
git add lib/knowledge-base-data.ts
git commit -m "Update knowledge base"
git push
```

### **Update Chatbot Design:**