# 🔧 Fix: SSL Certificate Error

## 🎯 **Quick Fix** (Try This First)

Open Terminal and run these commands:

```bash
cd /Users/aarya/Downloads/project-main/frontend

# Tell npm to not be strict about SSL (temporary fix)
npm config set strict-ssl false

# Now install dependencies
npm install

# Start the frontend
npm run dev
```

Then open your browser to: **http://localhost:3000**

---

## ✅ **Better Fix** (Permanent Solution)

### **Option 1: Update npm's Certificate Store**

```bash
# Update npm itself
npm install -g npm@latest

# Clear npm cache
npm cache clean --force

# Try installing again
cd /Users/aarya/Downloads/project-main/frontend
npm install
```

### **Option 2: Use Different Registry (Faster)**

```bash
cd /Users/aarya/Downloads/project-main/frontend

# Use Taobao mirror (faster, no SSL issues)
npm config set registry https://registry.npmmirror.com

# Install
npm install

# Restore original registry (optional)
npm config set registry https://registry.npmjs.org
```

### **Option 3: Bypass SSL Check (Quick & Easy)**

```bash
cd /Users/aarya/Downloads/project-main/frontend

# Just for this install
npm install --legacy-peer-deps

# If that doesn't work, add this:
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm install --legacy-peer-deps
```

---

## 🚀 **Complete Fresh Start** (If Above Don't Work)

```bash
# 1. Stop any running processes
cd /Users/aarya/Downloads/project-main
./STOP.sh

# 2. Clean everything
cd frontend
rm -rf node_modules package-lock.json

# 3. Configure npm
npm config set strict-ssl false
npm config set legacy-peer-deps true

# 4. Install
npm install

# 5. Start manually
cd /Users/aarya/Downloads/project-main/backend
python3 app.py &

cd /Users/aarya/Downloads/project-main/frontend
npm run dev
```

---

## 🎯 **Easiest Solution Right Now**

Copy and paste this entire block:

```bash
cd /Users/aarya/Downloads/project-main/frontend
npm config set strict-ssl false
npm install --legacy-peer-deps
cd ..
./STOP.sh
sleep 2
./START.sh
```

This will:
1. Disable strict SSL checking
2. Install frontend dependencies
3. Stop any running servers
4. Restart everything

---

## 📋 **What's Happening**

The error means:
- npm is trying to download packages from the internet
- Your Mac can't verify the SSL certificate
- This is often due to firewall, proxy, or Mac security settings

**It's safe to disable strict-ssl for local development!**

---

## ✅ **After Fix - What You Should See**

```bash
npm install
# ... downloading packages ...
added 450 packages in 45s
```

Then when you run `npm run dev`:
```bash
VITE v5.0.8  ready in 1234 ms

➜  Local:   http://localhost:3000/
➜  press h + enter to show help
```

Open browser to **http://localhost:3000** - You're racing! 🏎️

---

## 🆘 **Still Not Working?**

Check the frontend log:
```bash
cat /Users/aarya/Downloads/project-main/frontend.log
```

Or try Docker instead (no npm issues):
```bash
cd /Users/aarya/Downloads/project-main
docker-compose up --build
```

---

## 🎯 **TL;DR - Quick Command**

```bash
cd /Users/aarya/Downloads/project-main/frontend && npm config set strict-ssl false && npm install && cd .. && ./START.sh
```

Copy, paste, press Enter! 🚀

