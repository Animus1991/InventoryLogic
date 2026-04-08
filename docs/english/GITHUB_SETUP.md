# GitHub — Create Repository and Push

The project **does not yet have** a remote repository on GitHub. Follow the steps below to connect it and push.

---

## 1. Create a New Repository on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** e.g. `InventoryLogic` (or any name you prefer)
3. **Public** (or Private if you prefer)
4. **Do not** tick "Add a README" or .gitignore — leave the repository **empty**
5. Click **Create repository**

---

## 2. Connect the Local Project to GitHub

From the **root** of the project (`InventoryLogic`), in the terminal:

```powershell
git remote add origin https://github.com/Animus1991/InventoryLogic.git
```

(Replace `YOUR_USERNAME` and `InventoryLogic` if you chose a different repository name.)

Verify:

```powershell
git remote -v
```

You will see `origin` with your URL.

---

## 3. First Commit (if not already done)

```powershell
git add -A
git status
git commit -m "Initial commit: backend (Spring Boot) + frontend (React Vite Tailwind)"
```

---

## 4. Push to GitHub

```powershell
git push -u origin main
```

If your branch is named `master` instead of `main`:

```powershell
git branch -M main
git push -u origin main
```

After this, the project will be on GitHub and you can **commit + push** whenever you want:

```powershell
git add -A
git commit -m "Description of changes"
git push
```

---

## Reminder — Running the Backend (PowerShell)

On Windows PowerShell, **`.\`** is required before the script:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
