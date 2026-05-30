# Deployment Guide

This project can be built and deployed with GitHub Actions, Docker images, and a Docker host such as a VPS, cloud VM, or any server where Docker Compose is available.

GitHub Actions does not host a MERN application by itself. The workflows in this repo build the app, publish Docker images to GitHub Container Registry, and can deploy those images to your own Docker host. Your public application link will be the IP address or domain name of that host.

## Workflows

| Workflow | File | Purpose |
| --- | --- | --- |
| CI | `.github/workflows/ci.yml` | Builds the frontend, checks backend syntax, and validates Compose config |
| Publish Docker Images | `.github/workflows/docker-publish.yml` | Builds and pushes backend/frontend images to GHCR |
| Deploy To Docker Host | `.github/workflows/deploy-vps.yml` | Copies `docker-compose.prod.yml` to your server and restarts containers |

## Published Images

After pushing to `main` or `master`, the publish workflow creates these images:

```text
ghcr.io/kaveesha161/ai_based_to_do_app-backend:latest
ghcr.io/kaveesha161/ai_based_to_do_app-frontend:latest
```

Each image is also tagged with the Git commit SHA.

## Server Requirements

On your deployment server, install:

- Docker
- Docker Compose plugin
- Open inbound port `80`

Optional but recommended:

- A domain name pointed to the server IP address
- HTTPS reverse proxy such as Caddy, Nginx Proxy Manager, Traefik, or a cloud load balancer

## Server Files

Create a deployment directory on the server, for example:

```bash
sudo mkdir -p /opt/taskflow/Backend
sudo chown -R $USER:$USER /opt/taskflow
```

Create `/opt/taskflow/Backend/.env` on the server:

```env
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.example.mongodb.net
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://YOUR_SERVER_IP_OR_DOMAIN
SMTP_USER=your_brevo_smtp_user
SMTP_PASSWORD=your_brevo_smtp_password
SENDER_EMAIL=no-reply@example.com
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Use `#` for comments in `.env`; Docker Compose does not accept `//` comments.

## GitHub Secrets

In GitHub, open:

```text
Repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Add these secrets:

| Secret | Example | Purpose |
| --- | --- | --- |
| `DEPLOY_HOST` | `203.0.113.10` | Server IP or hostname |
| `DEPLOY_USER` | `ubuntu` | SSH user |
| `DEPLOY_SSH_KEY` | private SSH key | Key with access to the server |
| `DEPLOY_PATH` | `/opt/taskflow` | Directory where Compose runs |

If your GHCR packages are private, also add:

| Secret | Purpose |
| --- | --- |
| `GHCR_USERNAME` | Your GitHub username |
| `GHCR_PAT` | GitHub token with `read:packages` permission |

Alternatively, make the GHCR packages public after the first publish.

## Deploy Steps

1. Push your code to GitHub.
2. Wait for `Publish Docker Images` to finish successfully.
3. In GitHub Actions, open `Deploy To Docker Host`.
4. Click `Run workflow`.
5. After it completes, open:

```text
http://YOUR_SERVER_IP_OR_DOMAIN
```

That is the application link.

## Manual Server Deploy

If you do not want to use the deploy workflow, copy `docker-compose.prod.yml` to `/opt/taskflow/docker-compose.prod.yml` and run this on the server:

```bash
cd /opt/taskflow
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Check logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Stop the app:

```bash
docker compose -f docker-compose.prod.yml down
```
