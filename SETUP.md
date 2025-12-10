# 🔧 Setup Guide - AI PR Teammate

This guide will walk you through setting up AI PR Teammate in your repository in less than 5 minutes.

## 📋 Prerequisites Checklist

- [ ] Node.js 20+ installed locally (for testing)
- [ ] A GitHub repository where you want to use the AI
- [ ] An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))
  - OR an OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))
- [ ] Admin access to the repository

## 🎯 Step-by-Step Setup

### Step 1: Get Your API Key

#### Option A: Anthropic Claude (Recommended)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-`)

#### Option B: OpenAI GPT-4

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Copy your API key (starts with `sk-`)

### Step 2: Add Files to Your Repository

#### Option A: Clone This Repository

```bash
# Clone the AI PR Teammate repository
git clone https://github.com/YOUR_USERNAME/ai-pr-teammate.git

# Copy files to your target repository
cp -r ai-pr-teammate/.github YOUR_REPO/
cp -r ai-pr-teammate/src YOUR_REPO/
cp ai-pr-teammate/package.json YOUR_REPO/
```

#### Option B: Manual Setup

Create these files in your repository:

```
your-repo/
├── .github/
│   └── workflows/
│       └── ai-pr-teammate.yml
├── src/
│   ├── index.js
│   └── services/
│       ├── ai-service.js
│       ├── github-service.js
│       ├── code-fixer.js
│       └── ci-analyzer.js
└── package.json
```

Copy the contents from this repository's files.

### Step 3: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add your API key:

**If using Anthropic Claude:**
```
Name: ANTHROPIC_API_KEY
Secret: sk-ant-xxxxxxxxxxxxxxxxxxxx
```

**If using OpenAI:**
```
Name: OPENAI_API_KEY
Secret: sk-xxxxxxxxxxxxxxxxxxxx
```

6. Click **Add secret**

### Step 4: Set AI Provider (Optional)

If you're using OpenAI instead of Anthropic:

1. Still in **Settings** → **Secrets and variables** → **Actions**
2. Click the **Variables** tab
3. Click **New repository variable**
4. Add:
```
Name: AI_PROVIDER
Value: openai
```

(If using Anthropic, you can skip this step as it's the default)

### Step 5: Commit and Push

```bash
cd your-repo

# Stage the new files
git add .github/workflows/ai-pr-teammate.yml
git add src/
git add package.json

# Commit
git commit -m "feat: Add AI PR Teammate workflow"

# Push to your main branch
git push origin main
```

### Step 6: Enable Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

## ✅ Verify Installation

### Test 1: Check Workflow File

1. Go to your repository
2. Click **Actions** tab
3. You should see **AI PR Teammate** in the workflows list

### Test 2: Create a Test PR

1. Create a new branch:
```bash
git checkout -b test-ai-teammate
```

2. Make a simple change (e.g., add a file):
```bash
echo "// Test file" > test.js
git add test.js
git commit -m "Add test file"
git push origin test-ai-teammate
```

3. Create a PR from this branch to main

4. Add a comment on the PR:
```
@ai-teammate please add a proper header comment to test.js
```

5. Watch the magic happen! ✨

Within a few moments:
- ✅ Workflow will trigger
- ✅ AI will post an acknowledgment
- ✅ AI will commit the changes
- ✅ AI will post an explanation

## 🎯 Demo Setup (For Hackathon)

To create a compelling demo:

### 1. Create a Demo Repository

```bash
mkdir ai-teammate-demo
cd ai-teammate-demo
git init
```

### 2. Add Sample Code with Issues

Create `api/users.js`:
```javascript
// Bad code on purpose for demo
export function getUser(id) {
  const user = database.find(id);  // No error handling!
  return user;
}
```

### 3. Create PR

```bash
git checkout -b feature/user-api
git add api/users.js
git commit -m "Add user API"
git push origin feature/user-api
```

### 4. Demo Script

1. **Show the PR** with problematic code
2. **Act as reviewer**, comment:
   ```
   @ai-teammate this needs proper error handling, input validation, 
   and should return appropriate HTTP status codes
   ```
3. **Show Actions tab** - workflow running
4. **Show the commit** - AI's fix
5. **Show the comment** - AI's explanation
6. **Walk through the code** - improved version

### 5. Add CI Failure Demo

In your workflow, add a linting step:

```yaml
# .github/workflows/ci.yml
name: CI

on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run lint
```

Then commit code with linting errors:
```javascript
// Missing semicolons, unused vars, etc.
const x = 1
const y = 2
console.log(x)
```

Watch AI PR Teammate automatically fix it!

## 🐛 Troubleshooting

### "Workflow not triggering"

**Check:**
- Secrets are added correctly
- Workflow file is in `.github/workflows/`
- You're using `@ai-teammate` trigger
- PR is from a branch in the same repo (not a fork)

**Debug:**
```bash
# Check workflow syntax
cat .github/workflows/ai-pr-teammate.yml

# Check if Actions are enabled
# Go to Settings → Actions → General
```

### "Authentication error"

**Fix:**
- Verify API key is correct
- Check if API key has sufficient credits
- Ensure secret name matches exactly (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`)

### "Permission denied"

**Fix:**
1. Go to Settings → Actions → General
2. Set Workflow permissions to **Read and write**
3. Enable **Allow GitHub Actions to create and approve pull requests**

### "Cannot read file"

**Check:**
- File path is correct in the PR
- File exists on the PR branch
- Workflow has checked out the correct branch

## 💡 Tips for Best Results

### 1. Be Specific in Comments

❌ Bad:
```
@ai-teammate fix this
```

✅ Good:
```
@ai-teammate add try-catch error handling, validate inputs, 
and return proper HTTP status codes
```

### 2. Use Inline Comments

Comment directly on the code line for better context:

```typescript
function processPayment(amount) {  // @ai-teammate add input validation
  // AI knows exactly where to add validation
}
```

### 3. Break Down Complex Changes

Instead of:
```
@ai-teammate refactor this entire file
```

Try:
```
@ai-teammate add error handling to the processPayment function
```

Then in a separate comment:
```
@ai-teammate add input validation to the validateUser function
```

## 🎨 Customization

### Change AI Model

Edit `.github/workflows/ai-pr-teammate.yml`:

```yaml
env:
  AI_PROVIDER: 'openai'  # or 'anthropic'
```

### Add Custom Triggers

Edit `src/index.js`:

```javascript
const AI_TRIGGER_PATTERNS = [
  /@ai-teammate/i,
  /@ai-bot/i,
  /@code-buddy/i,  // Add your custom trigger
];
```

### Customize Commit Messages

Edit `src/services/code-fixer.js` or `src/services/ci-analyzer.js`:

```javascript
const commitMessage = `🚀 Your Custom Prefix: ${description}`;
```

## 📚 Next Steps

1. ✅ Complete the setup above
2. 📖 Read the [main README](README.md) for usage details
3. 🧪 Test with a simple PR
4. 🎬 Prepare your demo
5. 🚀 Present at the hackathon!

## 🆘 Need Help?

- Check [README.md](README.md) for detailed documentation
- Review [GitHub Actions logs](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs)
- Open an issue in this repository

## 🎉 You're All Set!

Your AI PR Teammate is now ready to help your team ship faster!

Try it out with a PR and watch the magic happen. 🪄

---

**Pro Tip for Hackathon**: Have a backup demo video ready in case of live demo issues!

