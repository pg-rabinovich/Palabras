#!/bin/sh

set -eu

current_branch=$(git branch --show-current)

if [ "$current_branch" = "main" ]; then
  echo "You are already on main. Switch to your working branch before publishing."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Your working tree is not clean. Commit or stash changes before publishing."
  exit 1
fi

git fetch origin main
git checkout main
git pull --ff-only origin main
git merge --no-ff "$current_branch" -m "merge: publish $current_branch into main"
git push origin main
git checkout "$current_branch"

echo "Published $current_branch into main and switched back to $current_branch."
