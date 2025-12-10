# Contributing to AI PR Teammate

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🎯 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new features
- 🧪 Add tests
- 🎨 Improve UI/UX

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/ai-pr-teammate.git
cd ai-pr-teammate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Copy `env.example` to `.env` and add your API keys:

```bash
cp env.example .env
# Edit .env with your keys
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📋 Development Guidelines

### Code Style

- Use ES6+ features
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names

### Commit Messages

Follow conventional commits:

```
feat: add support for GPT-4 Turbo
fix: handle null user in getUser
docs: update setup instructions
refactor: simplify code-fixer logic
test: add tests for CI analyzer
```

### Testing

Before submitting:

```bash
# Test the action locally
node src/index.js

# Check for syntax errors
npm run lint
```

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - Node.js version
   - AI provider (Anthropic/OpenAI)
   - GitHub Actions logs
6. **Screenshots**: If applicable

## 💡 Suggesting Features

When suggesting features, include:

1. **Problem**: What problem does it solve?
2. **Solution**: Your proposed solution
3. **Use Case**: Real-world scenario
4. **Alternatives**: Other solutions considered
5. **Impact**: Who would benefit?

## 🔧 Pull Request Process

### 1. Make Changes

- Write clear, readable code
- Add comments where needed
- Update documentation if needed
- Test your changes

### 2. Commit Changes

```bash
git add .
git commit -m "feat: your feature description"
```

### 3. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit!

### PR Template

```markdown
## Description
[Describe what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
[Describe how you tested this]

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

## 🏗️ Project Structure

```
ai-pr-teammate/
├── .github/
│   └── workflows/
│       └── ai-pr-teammate.yml    # Main GitHub Action
├── src/
│   ├── index.js                  # Entry point
│   └── services/
│       ├── ai-service.js         # AI integration
│       ├── github-service.js     # GitHub API
│       ├── code-fixer.js         # Code fixing logic
│       └── ci-analyzer.js        # CI analysis
├── examples/                      # Example code
├── package.json
├── README.md
└── CONTRIBUTING.md
```

## 🎨 Adding New Features

### Example: Adding a New AI Provider

1. **Update `ai-service.js`:**

```javascript
export class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'anthropic';
    
    if (this.provider === 'anthropic') {
      // Existing Anthropic setup
    } else if (this.provider === 'openai') {
      // Existing OpenAI setup
    } else if (this.provider === 'your-new-provider') {
      this.client = new YourProvider({
        apiKey: process.env.YOUR_PROVIDER_API_KEY
      });
      this.model = 'your-model-name';
    }
  }
  
  async callLLM(prompt) {
    // Add your provider logic
    if (this.provider === 'your-new-provider') {
      const response = await this.client.generate(prompt);
      return response.text;
    }
  }
}
```

2. **Update documentation:**
   - Add setup instructions in README.md
   - Add to SETUP.md
   - Update env.example

3. **Test thoroughly:**
   - Test with real PRs
   - Test error cases
   - Test with different code types

4. **Submit PR with:**
   - Code changes
   - Documentation updates
   - Example usage

## 🧪 Testing Guidelines

### Manual Testing

1. Create a test repository
2. Set up the GitHub Action
3. Create PRs with various issues
4. Test all trigger patterns
5. Test CI failure scenarios

### Test Cases to Cover

- ✅ Simple error handling
- ✅ Complex refactoring
- ✅ Multiple file updates
- ✅ CI failure detection
- ✅ Different programming languages
- ✅ Edge cases (empty files, large files)

## 📚 Documentation

When updating docs:

- Use clear, simple language
- Include code examples
- Add screenshots where helpful
- Update table of contents
- Check for broken links

## 🤝 Code Review

When reviewing PRs:

- Be respectful and constructive
- Ask questions for clarification
- Suggest improvements
- Test the changes
- Approve if it looks good!

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in commit messages

## 📞 Getting Help

Need help?

- 💬 Open a [Discussion](https://github.com/YOUR_USERNAME/ai-pr-teammate/discussions)
- 🐛 Open an [Issue](https://github.com/YOUR_USERNAME/ai-pr-teammate/issues)
- 📧 Email: your-email@example.com

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

✅ **Positive behaviors:**
- Being respectful
- Accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy

❌ **Unacceptable behaviors:**
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing private information

## 🎉 Thank You!

Thank you for contributing to AI PR Teammate! Your help makes this project better for everyone.

## 📋 Quick Reference

```bash
# Setup
git clone https://github.com/YOUR_USERNAME/ai-pr-teammate.git
npm install

# Create branch
git checkout -b feature/my-feature

# Make changes, then commit
git add .
git commit -m "feat: my awesome feature"

# Push and create PR
git push origin feature/my-feature
```

Happy coding! 🚀

