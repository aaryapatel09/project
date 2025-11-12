# 🏁 How to Run START.sh (Mac)

## ✅ **Method 1: Double-Click (Easiest)**

1. **Open Finder**
2. Navigate to: `/Users/aarya/Downloads/project-main/`
3. **Right-click** on `START.sh`
4. Select **"Open"** (first time only - to allow it to run)
   - If you see a security warning, click "Open" to confirm
5. Terminal will open automatically
6. Wait 10-20 seconds
7. Browser opens! 🎉

---

## ✅ **Method 2: From Terminal (What You Tried)**

The issue is you need to **cd** into the folder first:

```bash
# Change to the project folder first
cd /Users/aarya/Downloads/project-main

# Then run the script
./START.sh
```

**Or in one command:**
```bash
cd /Users/aarya/Downloads/project-main && ./START.sh
```

---

## ✅ **Method 3: Drag and Drop (Updated Script Works Now!)**

I just updated the script to work from anywhere! Now you can:

1. Open **Terminal**
2. Type: `/Users/aarya/Downloads/project-main/START.sh`
3. Press **Enter**

**Or:**
1. Open **Terminal**
2. **Drag** `START.sh` into the Terminal window
3. Press **Enter**

The script now automatically changes to the correct directory! 🎉

---

## 🔧 **If You Get "Permission Denied"**

Run this once to make it executable:

```bash
chmod +x /Users/aarya/Downloads/project-main/START.sh
chmod +x /Users/aarya/Downloads/project-main/STOP.sh
```

Then try again!

---

## 📝 **Full Example (Copy-Paste This)**

Open Terminal and copy-paste this entire block:

```bash
cd /Users/aarya/Downloads/project-main
chmod +x START.sh STOP.sh
./START.sh
```

Press **Enter** and wait! 🚀

---

## ✅ **What You Should See**

When it's working correctly:

```
🏁 Starting Racing App...

📁 Running from: /Users/aarya/Downloads/project-main

✅ Python found: Python 3.11.x
✅ Node.js found: v18.x.x

📦 Installing app components (first time only)...
[Wait 2-3 minutes for first-time setup]

✅ Installation complete!

🚀 Starting backend server...
✅ Backend running (Process ID: 12345)

🚀 Starting frontend server...
⏳ Waiting for app to start (10 seconds)...
✅ Frontend running (Process ID: 67890)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Racing App is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Opening in your browser...

👉 Your browser should open automatically
   If not, go to: http://localhost:3000
```

Then your browser opens to the Racing App! 🏎️

---

## 🛑 **To Stop the App**

**Option 1:** Press `Ctrl + C` in the Terminal window

**Option 2:** Run the stop script:
```bash
cd /Users/aarya/Downloads/project-main
./STOP.sh
```

**Option 3:** Double-click `STOP.sh` in Finder

---

## 🚨 **Common Issues**

### **Issue: "Python not found"**

**Solution:** Install Python:
1. Go to: https://www.python.org/downloads/
2. Download and install
3. ✅ Check "Add Python to PATH"
4. Try again

### **Issue: "Node not found"**

**Solution:** Install Node.js:
1. Go to: https://nodejs.org/
2. Download the LTS version (green button)
3. Install it
4. Try again

### **Issue: "Port already in use"**

**Solution:** Something is already running on those ports:
```bash
# Kill processes on ports 3000 and 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Then try starting again
./START.sh
```

### **Issue: Takes forever on first run**

**This is normal!** First time downloads ~300MB of dependencies.
- Go make coffee ☕
- Takes 2-5 minutes
- Subsequent runs are instant!

---

## 🎉 **You're Ready!**

Just run:
```bash
cd /Users/aarya/Downloads/project-main && ./START.sh
```

Or double-click `START.sh` in Finder!

Browser opens at: **http://localhost:3000**

**Start racing!** 🏁🏎️💨

