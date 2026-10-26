# Alfacinha Incubator: European Portuguese trainer

Alfacinha Incubator runs in your browser and keeps your progress on each device. With **Google Drive sync** turned on, the phone, the PC and any other computer all share the same progress through your own Google Drive. There's no server, and the app can only see its own hidden save file, never the rest of your Drive.

The setup has three parts, and you only do it once:

1. **Put the app online with GitHub Pages** (about 5 min). This gives the app a web address. Only the app's code goes there, never your progress.
2. **Create a free Google "client ID"** (about 10 min). Google requires this for any app that talks to Drive.
3. **Connect Drive on each device** (1 tap each).

---

## 1. Put the app online (GitHub Pages)

1. Sign in at **github.com** (a free account is fine) and click **New repository**. Name it `alfacinha` and make it **Public**. Pages needs a public repo on the free plan, and only code goes in it.
2. Click **uploading an existing file** and drag in everything in this folder: `index.html`, `config.js`, `manifest.webmanifest`, `sw.js`, and the `css`, `data`, `js` and `icons` folders. Don't upload `pois-progress.json` or any backup `.json` files. Click **Commit changes**.
3. Go to **Settings → Pages**. Under *Branch* pick **main** and **/ (root)**, then click **Save**. About a minute later the app is live at
   `https://YOUR-GITHUB-USERNAME.github.io/alfacinha/`

Note your address, and in particular the part `https://YOUR-GITHUB-USERNAME.github.io`. You'll need it in step 2.

## 2. Create your Google client ID

Google renames these menus now and then. If something doesn't match exactly, look for the closest equivalent.

1. Go to **console.cloud.google.com** and sign in with the Google account whose Drive you want to use.
2. At the top, click the project picker, then **New project**. Name it `Alfacinha` and click **Create**, then make sure it's selected.
3. **Turn on the Drive API:** search the top bar for **"Google Drive API"**, open it, and click **Enable**.
4. **Set up sign-in:** search for **"Google Auth Platform"** (older name: "OAuth consent screen") and click **Get started**.
   - App name: `Alfacinha Incubator`. Support email: your Gmail.
   - Audience: **External**.
   - Contact email: your Gmail. Agree to the terms, then click **Create**.
5. **Add yourself as a tester:** go to **Audience → Test users → Add users**, enter your Gmail, and click **Save**. Leave the app in "Testing"; you don't need to publish it.
6. **Create the client ID:** go to **Clients → Create client**.
   - Application type: **Web application**. Name: `Alfacinha web`.
   - Under **Authorized JavaScript origins**, click **Add URI** and enter `https://YOUR-GITHUB-USERNAME.github.io`. Use only that, with no `/alfacinha` and no slash at the end.
   - Click **Create**, then copy the **Client ID**. It ends in `.apps.googleusercontent.com`.
7. Open **`config.js`** in this folder with Notepad, paste the ID between the quotes, and save:
   ```js
   googleClientId: '1234567890-abcdef.apps.googleusercontent.com',
   ```
   Then upload the updated `config.js` to your GitHub repo (**Add file → Upload files**, then **Commit**).
   *(You can also paste the ID in the app under Definições → Google Drive sync on each device, but putting it in `config.js` means you only do it once.)*

The client ID isn't a password. It only tells Google which app is asking, and it only works from your own GitHub address.

## 3. Connect each device

**On the PC:** open your app address in Chrome or Edge. Optionally, use the browser menu → **Install Alfacinha** to give it its own window and a desktop shortcut. Then:
**Definições → Google Drive sync → Connect Google Drive**. Pick your account. Google will say **"Google hasn't verified this app"**. That's expected, because this is your own private app. Click **Continue**, then allow access.

**On your Android phone:** open the same address in **Chrome**, then ⋮ menu → **Add to Home screen / Install app**. Open it from the home screen and connect Drive the same way.

Any other computer works the same way: open the address and connect.

### How syncing behaves
- The app syncs **when you open it** and **a few seconds after you study**. The pill at the top right shows "Synced 14:32".
- Google sign-ins last about an hour. After that the pill says **"Tap to sync"**. One tap signs in again, usually with a quick flash of a Google window.
- If you study on two devices, both sets of work are kept. For each card, the most recent review wins.
- Offline works fine. The app catches up the next time you're online and tap Sync.
- Deleted notes and **Reset all progress** carry over to your other devices too.
- Settings like the voice, speed and number of new cards per day stay **per device**, because phone and PC voices differ.
- Now and then Google may ask you to approve access again. That's normal for private "Testing" apps.

---

## Without Drive (optional)

- **Opening `index.html` straight from this folder** still works on the PC. Use **Definições → Create save file…** to auto-save to `pois-progress.json` here. Drive sync is not available this way, because Google sign-in needs a web address.
- **Manual backup:** Definições → Export backup / Import (merge) works on every device.

## Updating the app

When you get a new version, upload the changed files to the same GitHub repo. Keep your `config.js`. Installed copies pick up the update the next time they open while online. Your progress isn't affected.

## Better audio

- **Windows:** Settings → Time & language → Language & region → Add a language → **Português (Portugal)**, and tick *Text-to-speech*. The online "Raquel/Duarte (Natural)" voices in Edge sound best.
- **Android:** Settings → search "Text-to-speech" → Google → Install voice data → **Português (Portugal)**.

## What's inside

| Section | What it does |
|---|---|
| **Hoje** | Daily plan: reviews, a verb sprint, a context drill, transformations, a dialogue, and one speaking/writing prompt |
| **Falar → Transformar** | Hear a sentence, then say it changed (another person, another tense, a question, negative, pronoun, polite, passive, reported). Reveal, hear it, grade yourself. 72 sentences, 299 changes. No typing |
| **Falar → Diálogos** | 24 minus-one dialogues in two voices: listen, then play Ryan's part (or the other person's) out loud. Flag a line to add it to your reviews |
| **Falar → Conversas** | 16 conversations about your life: the app asks, you answer out loud, then see model answers and a short check list; one tap on what you said picks the next question |
| **Falar → Ritmo** | Tempo loop: speak along with a sentence that speeds up each clean pass. Click track: say the five persons of a verb on the beat; the tempo rises when you hold it |
| **Falar → Missões** | Three real-life quests in Lisbon each week; when you've done one, tap the phrase you used and it becomes a review card |
| **Falar → Rádio** | Hands-free drill for walks and rides: the app asks, waits, answers, moves on. Verbs, transformations, dialogue lines and vocab |
| **Rever** | FSRS spaced repetition: 439 words in EP sentences, 80 expressions, plus everything you capture |
| **Verbos** | Timed typing sprints across 146 verbs × 10 tenses. Misses become review cards. Also has full verb tables |
| **Contexto** | Choose the tense (perfeito/imperfeito, simples/composto, ser/estar, indicativo/conjuntivo) and then type the form |
| **Escrever** | Daily prompt: write, hear it read back, copy it to get corrections |
| **A dois** (under Mais) | Partner mode: a guide for her, 18 conversation games, a Portuguese-only timer, and a notebook that feeds your reviews |
| **Gramática** | 14 short notes written for English speakers, each linked to a drill |
| **Capture** | Add words, corrections and phrases from class. They come first among your new cards |
| **Progresso** | Streak, recall rate, a verb-mastery heatmap and your weakest forms |

## Speaking drills: manual checks (Oct 2026)

Automated: `node tests/content.test.js` (content rules, Brazilian-marker guard, coverage) and `node tests/conj.test.js`.

Manual acceptance list:
1. PC Edge: a Transformations session of 12 completes with the keyboard only (Space, 1/2/3, r, h); the sentence is spoken; the answer is never visible before reveal; a Missed item comes back within the session; Progress still renders.
2. Phone Brave: the same session with thumbs only; buttons are at least 48 px tall; nothing needs typing.
3. Dialogue pass 1 plays both voices in order; pass 2 hides Ryan's lines until reveal; Flag creates a note visible in Capture.
4. Radio: a 10-minute session plays through with the screen dimmed; Pause/Again/Skip/Flag work; flagged items come first in the next Transformations session; the day counts toward the streak.
5. Leaving any of the three pages stops the audio.
6. Old saves load without errors; export/import still works; Drive sync merges the new stats.
7. `sw.js` cache bumped; after a deploy the phone picks up the new version on the second open.

### Radio mode test notes
- Edge on Windows (tested 21 Oct 2026 in a Chromium browser pane on Windows, with no Portuguese voice installed there, so an English voice stood in): prompts, gaps and answers play in order; Pause/Again/Skip/Flag work; the session ends at the set length and logs the minutes; leaving the page stops the audio.
- Brave on Android: **not tested yet.** Android may pause the browser's speech when the screen turns off. Radio mode asks for a screen wake lock and shows a dark "pocket screen", so keep the phone unlocked in a pocket or on a handlebar mount. Earbud play/pause/next/previous may or may not work. Write down here what happens on the phone.
