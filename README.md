# 🍋 Lemonade Kingdom: Zombie Nights

A 3D survival & base-building browser game. Everything (models, textures, music, sounds) is generated in code.

**Two game modes, two completely separate saves:**
- 🛤 **Pathway** — 100 waves × 10 small waves, 10 game modes, unlocks as you go, the Rotten King ending at wave 100, then Free Play.
- ⚔ **Multiplayer** — your own castle + Zombie Army. Queue as Attacker or Defender; the server pairs 1 attacker with 1 defender.

## Deploy on Render (Web Service — needed for online multiplayer)
1. Push **all files in this folder** to the root of a GitHub repo (`index.html`, `server.js`, `package.json`, `render.yaml`, `favicon.svg`).
2. Render dashboard → **New → Web Service** → pick the repo.
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free is fine
3. Click **Create Web Service**. Your game + multiplayer server is live at `https://<name>.onrender.com`.

(Or **New → Blueprint** and Render reads `render.yaml` automatically.)

> If you already had a **Static Site** for this game, create a new **Web Service** instead — static sites can't run the multiplayer server.
> Free web services sleep after ~15 min with no visitors; the first visit/match then takes ~50 seconds to wake it up.

## 📲 Install as an app
- **Android / PC (Chrome, Edge):** open your Render link → tap **📲 Install App** on the menu (or the install icon in the address bar).
- **iPhone / iPad:** open the link in **Safari** → **Share ⬆️** → **Add to Home Screen**.
It opens full-screen with its own icon and updates automatically every time you redeploy.

## Playing online
Open your Render link on each device → **⚔ Multiplayer → Battle** → pick Attack or Defend → **Find Match**.
Playing from the offline `index.html` file? Paste your Render link into the **Server** box in the Battle window.
Nobody online? Use **🤖 Practice vs Bot**.

## Saves
Saves live in each browser. **Settings → Export / Import** moves a save between devices. Pathway and Multiplayer saves never mix.

## Run locally
`npm install` then `npm start` → open http://localhost:3000
