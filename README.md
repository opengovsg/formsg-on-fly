# FormSG Demo on Fly.io

A demonstration deployment of [FormSG](https://github.com/opengovsg/FormSG) (Singapore's government digital form builder) running on the Fly.io platform.

**🔗 Live Demo**: [https://form.demos.sg](https://form.demos.sg)

## Overview

This repository contains customizations and configuration to deploy FormSG as a public demo. It uses an "overlay" approach - the base FormSG codebase is merged with demo-specific replacements during deployment.

### Key Features
- **Public demo** with automated data resets every 3 hours
- **MockPass integration** for testing SingPass/CorpPass authentication
- **Cloudflare R2** for S3-compatible storage
- **Singapore region deployment** on Fly.io
- **Automated CI/CD** with GitHub Actions

## Quick Start

### Prerequisites
- [Docker](https://docker.com) for local development
- [Just](https://github.com/casey/just) command runner: `brew install just`

### Local Development
```bash
# Set up demo (one-time)
just setup

# Start the demo
just start

# View logs
just logs

# Stop when done
just stop

# Clean up everything
just clean
```

Run `just --list` to see all available commands.

## Architecture

### Directory Structure
```
├── replacements/          # Demo-specific file overrides
│   ├── frontend/         # React/TypeScript frontend customizations
│   ├── src/app/          # Node.js/Express backend customizations
│   └── shared/           # Shared constants and utilities
├── scripts/              # Development automation scripts
├── bin/                  # Database reset scripts
├── fly.toml             # Fly.io deployment configuration
├── Dockerfile.demos     # Multi-stage Docker build
└── justfile             # Command runner configuration
```

### Deployment Process
1. **CI triggers** on pushes to main or weekly schedule (Monday 1PM SGT)
2. **Smart filtering** only deploys when relevant files change
3. **Merges** base FormSG with demo replacements
4. **Builds** Docker image and pushes to Fly.io registry
5. **Deploys** to cloud with zero-downtime rolling update

## Contributing

This is a demonstration project. For the main FormSG project, see [opengovsg/FormSG](https://github.com/opengovsg/FormSG).

### Making Changes
1. Edit files in `replacements/` directory
2. Test locally with `just setup && just start`
3. Commit and push - CI will automatically deploy

## License

MIT License - see [LICENSE](LICENSE) file.
