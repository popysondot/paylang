# paylang

A modern web application built with React, Vite, and Node.js.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd paylang

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd paylang
```

### 2. Install Dependencies

```bash
# Install root dependencies (Vite, React, etc.)
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (if applicable)
DATABASE_URL=your-database-connection-string

# API Keys
VITE_API_URL=http://localhost:3000/api
```

## 🏃 Development

### Start Development Server

```bash
npm run dev
```

This will start the Vite development server. Open your browser to `http://localhost:5173`

### Start Backend Server

```bash
cd server
npm run dev  # or node index.js
```

### Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🏗️ Production Build

### Build the Application

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Preview Production Build

```bash
npm run preview
```

## 🚀 Deployment Options

### Option 1: Netlify (Recommended for Static Sites)

1. **Connect your repository**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub/GitLab repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Set environment variables**
   - Go to Site settings > Environment variables
   - Add all required variables

4. **Deploy**
   - Netlify automatically deploys on push to main branch

**Netlify Configuration (`netlify.toml`):**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Or connect via GitHub**
   - Go to [Vercel](https://vercel.com)
   - Import your repository
   - Vercel auto-detects Vite projects

**Vercel Configuration (`vercel.json`):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Option 3: Traditional Server (Nginx/Apache)

#### Build and Deploy

```bash
# Build the project
npm run build

# Copy dist folder to server
scp -r dist/* user@your-server:/var/www/your-domain/
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/your-domain;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### PM2 Process Manager (for Node.js backend)

```bash
# Install PM2
npm install -g pm2

# Start the backend
cd server
pm2 start index.js --name paylang-api

# Setup auto-restart
pm2 startup
pm2 save
```

### Option 4: Render (Recommended for Full-Stack)

Render provides both static site hosting and web services (Node.js) in one platform.

#### Deploy Frontend (Static Site)

1. **Create a new Static Site**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" > "Static Site"
   - Connect your GitHub/GitLab repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set environment variables**
   - Go to "Environment" tab
   - Add: `VITE_API_URL` = your backend URL (e.g., `https://your-api.onrender.com`)

4. **Deploy**
   - Render automatically builds and deploys on push to main branch

#### Deploy Backend (Web Service)

1. **Create a new Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" > "Web Service"
   - Connect your GitHub/GitLab repository

2. **IMPORTANT: Set Root Directory**
   - Look for "Root Directory" field (not "Repository" or "Branch")
   - Set it to: `server` ← This is critical!

3. **Configure settings**
   - Name: `paylang-api`
   - Runtime: `Node`
   - Build command: `npm install`
   - Start command: `node index.js`
   - Instance type: `Free` (for development)

4. **Set environment variables**
   - Go to "Environment" tab
   - Add:
     - `PORT` = `10000`
     - `NODE_ENV` = `production`
     - `DATABASE_URL` = your-database-connection-string

5. **Deploy**
   - Render will install dependencies and start the server
   - Your API will be available at `https://your-api.onrender.com`

#### ⚠️ Troubleshooting: "Cannot find module '/opt/render/project/src/index.js'"

This error means Root Directory is not set correctly:

1. Delete the current broken web service on Render
2. Create a new Web Service
3. **In the configuration screen, find "Root Directory" and set it to `server`**
4. Or use the [`render.yaml`](render.yaml) file for automatic configuration

#### Connect Frontend to Backend

1. After deploying the backend, copy the URL (e.g., `https://paylang-api.onrender.com`)
2. Update the frontend environment variable:
   - In Render Static Site > Environment
   - Set `VITE_API_URL` = `https://paylang-api.onrender.com/api`
3. Trigger a redeploy of the frontend

#### Render Configuration (`render.yaml`)

Create a `render.yaml` file for automated deployments:

```yaml
services:
  # Backend API
  - type: web
    name: paylang-api
    repo: https://github.com/yourusername/paylang
    branch: main
    rootDir: server
    buildCommand: npm install
    startCommand: node index.js
    envVars:
      - key: PORT
        value: 10000
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: paylang-db
          property: connectionString

  # Frontend
  - type: web
    name: paylang
    repo: https://github.com/yourusername/paylang
    branch: main
    buildCommand: npm run build
    staticPublishDir: dist
    envVars:
      - key: VITE_API_URL
        value: https://paylang-api.onrender.com/api

# Database (optional)
databases:
  - name: paylang-db
    plan: free
    databaseName: paylang
    user: paylang
```

### Option 5: Docker

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped

  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**Build and Run:**

```bash
docker-compose up -d --build
```

## 🔧 Environment Variables

### Frontend (Root `.env`)

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
VITE_BACKEND_URL=https://your-api.onrender.com
```

### Backend (Server `.env` or Render Environment Variables)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (Render sets this) | Yes (set to 10000) |
| `NODE_ENV` | Environment (`production`) | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (sk_live_...) | Yes |
| `EMAIL_USER` | Gmail address for notifications | Yes |
| `EMAIL_PASS` | Gmail App Password | Yes |
| `ADMIN_EMAIL` | Admin email for alerts | Yes |

## 📁 Project Structure

```
paylang/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── server/
│   ├── index.js        # Server entry point
│   └── package.json    # Server dependencies
├── dist/               # Production build output
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Project dependencies
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📦 Dependencies

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Express** - Web framework
- **Node.js** - Runtime

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find process using port
lsof -i :5173

# Kill the process
kill -9 <PID>
```

**Node modules not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build failures**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

### Getting Help

- Open an issue on GitHub
- Check existing documentation
- Review error messages in console
