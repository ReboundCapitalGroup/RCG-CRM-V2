# Rebound Capital Group CRM - Complete Edition
## ✅ With Skip Tracing Built In!

---

## 🚀 QUICK START (3 Steps):

### Step 1: Install Dependencies
Open Command Prompt in this folder and run:
```
npm install
```
(This takes 2-3 minutes - installs React, Vite, Supabase, etc.)

### Step 2: Run Development Server
```
npm run dev
```

### Step 3: Open in Browser
Go to: **http://localhost:5173**

**Login:**
- Username: `admin`
- Password: `admin123`

---

## ✨ What's New - Skip Tracing Feature:

### How to Use:
1. Click any lead to view details
2. Scroll down to **"Contacts"** section
3. Click **"Skip Trace This Lead"** button
4. Fill in the form:
   - Add name, age
   - Add 2-3 phone numbers
   - Add emails
   - Add address
   - Add relatives with their phones
5. Click **"Save to CRM"**
6. Done! Contact info saved forever

### What Gets Saved:
- ✅ All phone numbers (mobile, home, work)
- ✅ All emails
- ✅ Current address
- ✅ Relatives with their contact info
- ✅ Notes
- ✅ Everything linked to the lead

---

## 📊 Database:

All data saves to **Supabase** (already configured):
- URL: `https://fzievaswtkuguwyscngt.supabase.co`
- Tables created: leads, contacts, phone_numbers, emails, relatives

---

## 🔧 Files Structure:

```
rebound-crm-complete/
├── src/
│   ├── App.jsx              ← Main app with skip tracing
│   ├── SkipTraceModal.jsx   ← Contact form
│   ├── ContactsSection.jsx  ← Display contacts
│   ├── supabase.js          ← Database config
│   ├── main.jsx
│   └── index.css
├── package.json
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🐛 Troubleshooting:

**"npm is not recognized"**
- Install Node.js from: https://nodejs.org
- Restart Command Prompt

**"Port 5173 is already in use"**
- Close other dev servers
- Or it will use port 5174 instead

**"Cannot connect to Supabase"**
- Check internet connection
- Verify credentials in `src/supabase.js`

**"Skip trace not working"**
- Make sure you ran the SQL schema in Supabase
- Check browser console (F12) for errors

---

## 📤 Deploy to Production (Vercel):

### Option A: Deploy from Local
```
npm install -g vercel
vercel
```

### Option B: Deploy from GitHub
1. Push this folder to GitHub
2. Go to https://vercel.com
3. Import repository
4. Deploy!

---

## 🎯 Next Steps:

Once you're comfortable with skip tracing, you can add:
1. Call logging
2. Email integration
3. SMS campaigns
4. Contact attempt tracking
5. Lead scoring

---

## 💡 Tips:

- **Backup your data:** Export leads regularly
- **Add more users:** Go to Admin panel
- **Filter leads:** Use search and dropdown filters
- **Assign leads:** Admins can assign to agents

---

## ✅ You're All Set!

Your CRM now has professional skip tracing built right in. No more copying/pasting from other websites - just fill in the form and everything saves automatically!

**Questions?** Check the browser console (F12) for any errors.

**Enjoy!** 🚀
