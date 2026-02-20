#!/bin/bash
# GitLab Runner Setup Script for Ubuntu Server
# Run this script on your server to setup GitLab Runner

set -e

echo "🚀 Installing GitLab Runner..."

# Add GitLab's official repository
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash

# Install GitLab Runner
sudo apt-get install gitlab-runner

# Verify installation
gitlab-runner --version

echo ""
echo "✅ GitLab Runner installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Get registration token from GitLab:"
echo "   Project → Settings → CI/CD → Runners → Copy registration token"
echo ""
echo "2. Register the runner:"
echo "   sudo gitlab-runner register"
echo ""
echo "3. Answer the prompts:"
echo "   - GitLab URL: https://gitlab.com/"
echo "   - Registration token: [paste your token]"
echo "   - Description: Production Server Runner"
echo "   - Tags: production,nodejs,deploy"
echo "   - Executor: shell"
echo ""
echo "4. Verify runner is active in GitLab UI"
echo ""
echo "5. Setup SSH key for deployment:"
echo "   su - klinik  # or your deployment user"
echo "   ssh-keygen -t rsa -b 4096 -C 'gitlab-ci@klinik' -f ~/.ssh/gitlab_ci"
echo "   cat ~/.ssh/gitlab_ci  # Copy private key to GitLab CI/CD Variables"
echo "   cat ~/.ssh/gitlab_ci.pub >> ~/.ssh/authorized_keys"
echo ""
echo "Done! 🎉"
