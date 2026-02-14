# Workshop Setup

You will create your own development environment in the cloud.
No local installs required.

We will:

1. Fork the project
2. Open your cloud VM (Codespace)
3. Create your working branch

---

## 1) Fork the starter project

Open the main repository (You are probably already here):

[https://github.com/RohanSi4/tsgTest](https://github.com/RohanSi4/tsgTest)

Click **Fork** (top right)

Keep all default settings → click **Create fork**

You should now be at:

```
https://github.com/<your-username>/tsgTest
```

---

## 2) Create your personal cloud development environment

Inside *your fork*:

Click the green **Code** button
→ Select the **Codespaces** tab
→ Click **Create codespace on main**

⏳ Wait ~1–3 minutes the first time
(This installs VSCode, Python, Git, Claude Code and all workshop tools automatically)

Once finished, VS Code will open in your browser.

You now have a full Linux VM running in the cloud.

---

## 3) Create your working branch

In the terminal at the bottom of the window:

```bash
git checkout -b <your-name>
```

Examples:

```bash
git checkout -b alex
git checkout -b jammel
git checkout -b team-3
```

You are now ready to start the workshop.

---

## 4) Verify everything works

Run:

```bash
python --version
git status
```

You should see:

* Python installed
* You are on your branch (not main)

You should also have Claude Code (login if you already have an account, or more info on how to login later), verify with:

```bash
claude
```

---

You're done with setup 🎉
Do **not** commit directly to `main` — always work on your branch.
