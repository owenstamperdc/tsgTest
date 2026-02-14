FROM mcr.microsoft.com/devcontainers/python:1-3.11-bullseye

# Remove Yarn apt repo if present (it can break apt-get update due to missing GPG key)
RUN rm -f /etc/apt/sources.list.d/yarn.list /etc/apt/sources.list.d/yarn*.list || true

# System deps
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
