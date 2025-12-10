# ⚡ Quick Start - AI PR Teammate

Get up and running in 5 minutes!

## 1️⃣ Get an API Key (1 minute)

Choose one:

**Option A: Anthropic Claude (Recommended)**
- Go to [console.anthropic.com](https://console.anthropic.com)
- Sign up → Create API Key
- Copy key (starts with `sk-ant-`)

**Option B: OpenAI GPT-4**
- Go to [platform.openai.com](https://platform.openai.com)
- Sign up → Create API Key
- Copy key (starts with `sk-`)

## 2️⃣ Add to Your Repository (2 minutes)

```bash
# In your repository root
mkdir -p .github/workflows
mkdir -p src/services

# Copy these files from the ai-pr-teammate project:
# - .github/workflows/ai-pr-teammate.yml
# - src/index.js
# - src/services/
# - package.json
```

Or use this one-liner:
```bash
curl -sL https://github.com/YOUR_USERNAME/ai-pr-teammate/archive/main.zip | tar xz --strip-components=1 -C .
```

## 3️⃣ Add Secret to GitHub (1 minute)

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name:** `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`)
   - **Secret:** Your API key
4. Click **Add secret**

## 4️⃣ Enable Workflow Permissions (30 seconds)

1. **Settings** → **Actions** → **General**
2. **Workflow permissions** → Select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. **Save**

## 5️⃣ Commit & Push (30 seconds)

```bash
git add .
git commit -m "feat: Add AI PR Teammate"
git push
```

## ✅ Test It! (1 minute)

1. Create a PR with some code
2. Comment on the PR:
   ```
   @ai-teammate please add error handling
   ```
3. Watch it work! 🎉

---

## That's It! 🚀

You now have an AI teammate that:
- ✅ Responds to review comments
- ✅ Fixes code automatically
- ✅ Resolves CI failures
- ✅ Commits changes
- ✅ Explains what it did

## Next Steps

- 📖 Read the [full README](README.md)
- 🎬 Check the [demo script](DEMO_SCRIPT.md)
- ⚙️ See [detailed setup](SETUP.md)

## Troubleshooting

**Not working?**
- Check API key is correct
- Verify workflow permissions
- Check Actions tab for errors
- Make sure you tagged `@ai-teammate`

**Need help?** See [SETUP.md](SETUP.md) for detailed troubleshooting.

