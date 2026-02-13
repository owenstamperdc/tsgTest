FROM mcr.microsoft.com/devcontainers/python:1-3.11-bullseye

# System deps (git is already present in most devcontainers, but we ensure it)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    ripgrep \
  && rm -rf /var/lib/apt/lists/*

# Node.js 18 (for Claude Code CLI)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*
