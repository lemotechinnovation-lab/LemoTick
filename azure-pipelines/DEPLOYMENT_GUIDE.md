# LemoTick Azure Windows Server Deployment Guide
## 🎯 What This Guide Does
This guide will teach you how to set up automatic deployment for your LemoTick application. When you're done, every time you push code to GitHub/Azure Repos, your application will automatically build and deploy to your Windows Server - no manual work needed!

## 📚 What You'll Learn
- How to prepare your Windows Server
- How to connect Azure DevOps to your server
- How to make code automatically deploy when you push changes
- How to troubleshoot common problems

## 🏗️ What We're Building
- **Your Code** → Push to Git → **Azure DevOps** → Automatically deploys to → **Windows Server**
- **Platform**: Azure Windows Server VM (your server in the cloud)
- **CI/CD Tool**: Azure DevOps (the automation tool)
- **Container Registry**: Docker Hub (where we store Docker images)
- **Web Server**: IIS for dashboard, Docker for backend & bot

## 🎯 Understanding Branches & Environments

Think of branches like different versions of your app:

### What Are Branches?
Branches are like parallel universes for your code. You can work on new features without breaking the live app.

- **dev** (Development) → Where you test new features
- **qa** (Quality Assurance) → Where you test before going live
- **main** (Production) → The live version users see

### How Automatic Deployment Works
```
You write code → Save it → Push to branch → Magic happens → App updates automatically!
```

**Example:**
1. You fix a bug in your code
2. You run: `git push origin dev`
3. Azure DevOps sees the push
4. It automatically builds and deploys to your dev environment
5. Done! Your dev site is updated

### The Three Environments

## Deployment Environments

### Backend API (.NET 8)
| Environment | Branch | Port | Container Name |
|-------------|--------|------|----------------|
| Development | dev    | 5001 | lemotick-backend-dev |
| QA          | qa     | 5002 | lemotick-backend-qa |
| Production  | main   | 5000 | lemotick-backend-prod |

### Trading Bot (Python)
| Environment | Branch | Container Name | Logs |
|-------------|--------|----------------|------|
| Development | dev    | lemotick-bot-dev | C:\lemotick-logs\bot-dev |
| QA          | qa     | lemotick-bot-qa | C:\lemotick-logs\bot-qa |
| Production  | main   | lemotick-bot-prod | C:\lemotick-logs\bot-prod |

### Dashboard (React + Vite)
| Environment | Branch | Port | IIS Path |
|-------------|--------|------|----------|
| Development | dev    | 8080 | C:\inetpub\wwwroot\lemotick-dev |
| QA          | qa     | 8090 | C:\inetpub\wwwroot\lemotick-qa |
| Production  | main   | 80   | C:\inetpub\wwwroot\lemotick-prod |

## 📋 PART 1: Prepare Your Windows Server (One-Time Setup)

### Step 1: Connect to Your Windows Server

**What is this?** Your Windows Server is a computer in Azure's data center. You need to connect to it first.

**How to do it:**

1. **Open Remote Desktop Connection** on your computer
   - Press `Windows Key + R`
   - Type: `mstsc`
   - Press Enter

2. **Enter your server details:**
   - Computer: `YOUR_SERVER_IP` (get this from Azure Portal)
   - Click "Connect"
   - Enter username and password (from Azure)

3. **You're now inside the server!** 
   - It looks like a Windows desktop, but it's running in Azure

---

### Step 2: Download the Setup Script

**What is this?** A script that installs all the software your server needs.

**How to do it:**

1. **Inside the server**, open PowerShell as Administrator:
   - Click Start
   - Type: `PowerShell`
   - Right-click "Windows PowerShell"
   - Click "Run as administrator"
   - Click "Yes" when asked

2. **Download just the setup script:**
   ```powershell
   # Create a folder for the script
   mkdir C:\LemoTick-Setup
   cd C:\LemoTick-Setup
   
   # Download the setup script directly from your repo
   # Replace YOUR_REPO_URL with your actual repository URL
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/azure-pipelines/vm-setup.ps1" -OutFile "vm-setup.ps1"
   ```

   **Alternative - if you prefer to clone the whole repo:**
   ```powershell
   # Only if you don't have Git installed yet
   winget install Git.Git
   
   # Clone your repository
   cd C:\
   git clone https://YOUR_REPO_URL.git LemoTick
   cd LemoTick\azure-pipelines
   ```

   **Note:** You don't need the full code on the server - the Azure DevOps agent will download it automatically when pipelines run. We only need the setup script for initial configuration.

---

### Step 3: Run the Setup Script

**What is this?** This installs Docker, IIS, Node.js, .NET, Python, and configures everything.

**How to do it:**

1. **Make sure you're in the right folder:**
   ```powershell
   # If you downloaded just the script
   cd C:\LemoTick-Setup
   
   # Or if you cloned the repo
   cd C:\LemoTick\azure-pipelines
   ```

2. **Run the setup script:**
   ```powershell
   .\vm-setup.ps1 -All
   ```

3. **What happens now?**
   - ✓ Installs Docker Desktop (for running containers)
   - ✓ Installs IIS (web server for your dashboard)
   - ✓ Installs Node.js (for building React app)
   - ✓ Installs .NET 8 (for backend API)
   - ✓ Installs Python (for trading bot)
   - ✓ Opens firewall ports
   - ✓ Creates folders for logs and websites

4. **This takes 10-15 minutes.** Go get coffee! ☕

5. **When it's done, restart the server:**
   ```powershell
   Restart-Computer
   ```

6. **After restart, connect again via Remote Desktop**

7. **Start Docker Desktop:**
   - Look for Docker Desktop icon on desktop
   - Double-click it
   - Wait for it to say "Docker Desktop is running"
   - This is important! Docker must be running for containers to work

**Important Note:** After this setup, you don't need to manually manage code on the server. The Azure DevOps agent will automatically:
- Download code when pipelines run
- Build applications
- Deploy them
- Clean up old builds

The server just needs the runtime environments (Docker, IIS, Node, .NET, Python) which we just installed.

---

### Step 4: Verify Everything Installed

**Let's check if everything worked:**

1. **Open PowerShell as Administrator again**

2. **Check Docker:**
   ```powershell
   docker --version
   ```
   Should show: `Docker version 24.x.x`

3. **Check Node.js:**
   ```powershell
   node --version
   npm --version
   ```
   Should show version numbers

4. **Check .NET:**
   ```powershell
   dotnet --version
   ```
   Should show: `8.0.x`

5. **Check Python:**
   ```powershell
   python --version
   ```
   Should show: `Python 3.11.x`

6. **Check IIS:**
   ```powershell
   Get-Service W3SVC
   ```
   Should show: `Running`

**If any command fails**, run the setup script again for just that component:
```powershell
# Example: if Docker failed
.\vm-setup.ps1 -InstallDocker

# Example: if IIS failed
.\vm-setup.ps1 -InstallIIS
```

---

### Step 5: Set Up PostgreSQL Database

**You have two options:**

#### Option A: Azure Database for PostgreSQL (Recommended)

**Why use Azure Database?**
- Fully managed (no maintenance needed)
- Automatic backups
- High availability
- Better security
- Scales easily

**How to set it up:**

1. **Go to Azure Portal:** https://portal.azure.com

2. **Create PostgreSQL Database:**
   - Click "+ Create a resource"
   - Search for "Azure Database for PostgreSQL"
   - Click "Create"
   - Select "Flexible server"

3. **Configure the server:**
   - **Subscription**: Your subscription
   - **Resource group**: Same as your VM
   - **Server name**: `lemotick-db` (must be globally unique)
   - **Region**: Same as your VM
   - **PostgreSQL version**: 16
   - **Workload type**: Development (or Production if needed)
   - **Compute + storage**: 
     - Burstable, B1ms (1 vCore, 2 GiB RAM) for dev/testing
     - Or General Purpose for production
   - **Admin username**: `lemotickadmin`
   - **Password**: Create a strong password (save it!)

4. **Networking:**
   - **Connectivity method**: Public access
   - **Firewall rules**: 
     - Click "+ Add current client IP address"
     - Click "+ Add 0.0.0.0 - 255.255.255.255" (allow all - we'll restrict later)
     - Or better: Add only your VM's public IP

5. **Click "Review + create"** then **"Create"**
   - Wait 5-10 minutes for deployment

6. **Get your connection details:**
   - Go to your PostgreSQL server in Azure Portal
   - Click "Connection strings" in left menu
   - Copy the connection string
   - It looks like: `host=lemotick-db.postgres.database.azure.com port=5432 dbname=postgres user=lemotickadmin password={your_password} sslmode=require`

7. **Create databases:**
   
   **Option 1: Using Azure Portal:**
   - In your PostgreSQL server, click "Databases" in left menu
   - Click "+ Add"
   - Name: `lemotick_dev`, click "Save"
   - Repeat for `lemotick_qa` and `lemotick_prod`

   **Option 2: Using psql (if you have it locally):**
   ```bash
   # Install Azure CLI and login
   az login
   
   # Connect to your database
   psql "host=lemotick-db.postgres.database.azure.com port=5432 dbname=postgres user=lemotickadmin password=YOUR_PASSWORD sslmode=require"
   
   # Create databases
   CREATE DATABASE lemotick_dev;
   CREATE DATABASE lemotick_qa;
   CREATE DATABASE lemotick_prod;
   \q
   ```

8. **Your connection strings for Azure DevOps:**
   
   **Development:**
   ```
   Host=lemotick-db.postgres.database.azure.com;Port=5432;Database=lemotick_dev;Username=lemotickadmin;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
   ```
   
   **QA:**
   ```
   Host=lemotick-db.postgres.database.azure.com;Port=5432;Database=lemotick_qa;Username=lemotickadmin;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
   ```
   
   **Production:**
   ```
   Host=lemotick-db.postgres.database.azure.com;Port=5432;Database=lemotick_prod;Username=lemotickadmin;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
   ```

9. **Security best practices:**
   - Go to Networking in your PostgreSQL server
   - Remove the 0.0.0.0 - 255.255.255.255 rule
   - Add only your VM's public IP address
   - Enable "Allow Azure services" if you plan to use other Azure services

---

#### Option B: Install PostgreSQL on Windows Server (Not Recommended)

Only use this if you can't use Azure Database for PostgreSQL.

**The setup script can install PostgreSQL:**

```powershell
cd C:\LemoTick-Setup
.\vm-setup.ps1 -InstallPostgreSQL
```

**After installation:**

1. **Change default password:**
   ```powershell
   # Add PostgreSQL to PATH
   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
   
   # Connect (default password: postgres123)
   psql -U postgres
   
   # Change password
   ALTER USER postgres PASSWORD 'your-secure-password';
   \q
   ```

2. **Create databases:**
   ```powershell
   psql -U postgres -c "CREATE DATABASE lemotick_dev;"
   psql -U postgres -c "CREATE DATABASE lemotick_qa;"
   psql -U postgres -c "CREATE DATABASE lemotick_prod;"
   ```

3. **Connection strings:**
   ```
   Host=localhost;Port=5432;Database=lemotick_dev;Username=postgres;Password=your-secure-password
   ```

---

### Step 6: Verify Everything Installed

**Let's check if everything worked:**

1. **Open PowerShell as Administrator**

2. **Check Node.js:**
   ```powershell
   node --version
   npm --version
   ```
   Should show version numbers

3. **Check .NET:**
   ```powershell
   dotnet --version
   ```
   Should show: `8.0.x`

4. **Check Python:**
   ```powershell
   python --version
   ```
   Should show: `Python 3.11.x`

5. **Check IIS:**
   ```powershell
   Get-Service W3SVC
   ```
   Should show: `Running`

**If any command fails**, run the setup script again for just that component:
```powershell
# Example: if IIS failed
.\vm-setup.ps1 -InstallIIS

# Example: if Node failed
.\vm-setup.ps1 -InstallNode
```

---

## 📋 PART 2: Set Up Azure DevOps Agent (One-Time Setup)

### What is an Agent?

Think of an agent as a robot that lives on your server and waits for instructions from Azure DevOps. When you push code, Azure DevOps tells the agent "Hey, build and deploy this!" and the agent does the work.

### Step 7: Create Azure DevOps Project

**If you don't have an Azure DevOps account yet:**

1. **Go to:** https://dev.azure.com
2. **Sign in** with your Microsoft account
3. **Click "Create organization"** (if you don't have one)
   - Name it something like: `YourCompany`
4. **Click "Create project"**
   - Name: `LemoTick`
   - Visibility: Private
   - Click "Create"

---

### Step 8: Download and Install the Agent

**On your Windows Server (via Remote Desktop):**

1. **In Azure DevOps website**, go to:
   - Click your project (LemoTick)
   - Click "Project settings" (bottom left, gear icon)
   - Click "Agent pools" (under Pipelines)
   - Click "Default" pool
   - Click "New agent" button (top right)

2. **You'll see download instructions. Follow them:**
   
   **In PowerShell on the server:**
   ```powershell
   # Create a folder for the agent
   mkdir C:\agents
   cd C:\agents
   
   # Download the agent (copy the URL from Azure DevOps page)
   Invoke-WebRequest -Uri "https://vstsagentpackage.azureedge.net/agent/3.236.1/vsts-agent-win-x64-3.236.1.zip" -OutFile agent.zip
   
   # Extract it
   Expand-Archive -Path agent.zip -DestinationPath $PWD
   
   # Delete the zip file
   Remove-Item agent.zip
   ```

3. **Configure the agent:**
   ```powershell
   .\config.cmd
   ```

4. **Answer the questions:**
   ```
   Enter server URL > https://dev.azure.com/YourOrganization
   Enter authentication type (press enter for PAT) > [Just press Enter]
   Enter personal access token > [We'll create this next]
   ```

---

### Step 9: Create Personal Access Token (PAT)

**What is this?** A password that lets the agent talk to Azure DevOps.

1. **In Azure DevOps website:**
   - Click your profile picture (top right)
   - Click "Personal access tokens"
   - Click "New Token"

2. **Fill in:**
   - Name: `LemoTick Agent`
   - Organization: Select your organization
   - Expiration: 90 days (or custom)
   - Scopes: Click "Show all scopes"
     - Check: `Agent Pools (Read & manage)`
     - Check: `Build (Read & execute)`
     - Check: `Code (Read)`

3. **Click "Create"**

4. **IMPORTANT: Copy the token!** 
   - It looks like: `abcd1234efgh5678ijkl9012mnop3456qrst7890`
   - Save it somewhere safe
   - You can't see it again!

5. **Go back to PowerShell on the server**
   - Paste the token when asked
   - Press Enter

6. **Continue answering questions:**
   ```
   Enter agent pool (press enter for default) > [Press Enter]
   Enter agent name (press enter for lemotick-vm) > lemotick-vm
   Enter work folder (press enter for _work) > [Press Enter]
   Enter run agent as service? (Y/N) > Y
   Enter User account to use for the service (press enter for NT AUTHORITY\NETWORK SERVICE) > [Press Enter]
   ```

7. **The agent installs as a Windows service**
   - This means it starts automatically when the server restarts
   - It's always running, waiting for work

8. **Verify the agent is online:**
   - Go back to Azure DevOps website
   - Project settings → Agent pools → Default
   - You should see `lemotick-vm` with a green dot (Online)

**Troubleshooting:**
- If agent shows offline, restart the service:
  ```powershell
  Restart-Service vstsagent*
  ```

---

## 📋 PART 3: Configure Azure DevOps Pipelines

### Step 10: Create Variable Groups

**What are these?** Secret storage for passwords, API keys, etc. Your code needs these to run.

**Why three groups?** One for each environment (dev, qa, prod) with different values.

#### Create lemotick-dev group:

1. **In Azure DevOps:**
   - Go to Pipelines → Library
   - Click "+ Variable group"
   - Name: `lemotick-dev`

2. **Add these variables** (click "+ Add" for each):

   | Variable Name | Example Value | What It's For |
   |---------------|---------------|---------------|
   | `DB_CONNECTION_STRING` | `Server=localhost;Database=LemoTickDev;...` | Database connection |
   | `JWT_SECRET` | `your-super-secret-key-min-32-chars` | For user authentication |
   | `JWT_ISSUER` | `https://lemotick.com` | Who issues tokens |
   | `JWT_AUDIENCE` | `https://lemotick.com` | Who uses tokens |
   | `ALLOWED_ORIGINS` | `http://YOUR_SERVER_IP:8080` | CORS settings |
   | `VITE_API_BASE_URL` | `http://YOUR_SERVER_IP:5001` | Where dashboard calls API |
   | `VITE_SIGNALR_HUB_URL` | `http://YOUR_SERVER_IP:5001/hubs` | Real-time updates |
   | `DERIV_API_TOKEN` | `your_deriv_token` | Trading API access |
   | `BACKEND_API_URL` | `http://YOUR_SERVER_IP:5001` | Bot calls backend |
   | `BACKEND_API_KEY` | `your_api_key` | Bot authentication |

3. **For sensitive values** (passwords, tokens):
   - Click the lock icon 🔒 next to the value
   - This hides it from logs

4. **Click "Save"**

#### Create lemotick-qa group:

1. Click "+ Variable group" again
2. Name: `lemotick-qa`
3. Add the same variables but with QA values:
   - Change ports: 5001 → 5002, 8080 → 8090
   - Use QA database
   - Everything else can be the same or different

#### Create lemotick-prod group:

1. Click "+ Variable group" again
2. Name: `lemotick-prod`
3. Add the same variables but with production values:
   - Change ports: 5001 → 5000, 8080 → 80
   - Use production database
   - Use production API tokens

**Where to get these values:**

- **DB_CONNECTION_STRING**: Ask your database admin or use:
  ```
  Server=localhost;Database=LemoTickDev;User Id=sa;Password=YourPassword;TrustServerCertificate=True;
  ```
- **JWT_SECRET**: Generate a random string (at least 32 characters):
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
  ```
- **DERIV_API_TOKEN**: Get from your Deriv account settings

---

### Step 11: Create Environments

**What are these?** Approval gates. You can require manual approval before deploying to production.

1. **In Azure DevOps:**
   - Go to Pipelines → Environments
   - Click "Create environment"

2. **Create three environments:**

   **Environment 1:**
   - Name: `development`
   - Description: `Development environment`
   - Resource: None
   - Click "Create"

   **Environment 2:**
   - Name: `staging`
   - Description: `QA/Staging environment`
   - Resource: None
   - Click "Create"

   **Environment 3:**
   - Name: `production`
   - Description: `Production environment`
   - Resource: None
   - Click "Create"

3. **Add approval for production:**
   - Click on `production` environment
   - Click the three dots (⋮) → "Approvals and checks"
   - Click "+"
   - Select "Approvals"
   - Add yourself as approver
   - Click "Create"
   
   **Now production deploys will wait for your approval!**

---

### Step 12: Add Pipeline Files to Your Repo

**What are these?** Instructions that tell Azure DevOps how to build and deploy your app.

**Good news:** They're already in your code! In the `azure-pipelines` folder:
- `backend-pipeline.yml`
- `bot-pipeline.yml`
- `dashboard-pipeline.yml`

**You just need to connect them to Azure DevOps:**

#### Connect Backend Pipeline:

1. **In Azure DevOps:**
   - Go to Pipelines → Pipelines
   - Click "New pipeline"

2. **Where is your code?**
   - Select "Azure Repos Git" (if using Azure Repos)
   - Or "GitHub" (if using GitHub)
   - Select your repository

3. **Configure your pipeline:**
   - Select "Existing Azure Pipelines YAML file"
   - Branch: `main`
   - Path: `/azure-pipelines/backend-pipeline.yml`
   - Click "Continue"

4. **Review and run:**
   - Click "Run"
   - Give it a name: "LemoTick Backend"

#### Connect Bot Pipeline:

1. Click "New pipeline" again
2. Select your repo
3. Select "Existing Azure Pipelines YAML file"
4. Path: `/azure-pipelines/bot-pipeline.yml`
5. Click "Continue" → "Run"
6. Name it: "LemoTick Bot"

#### Connect Dashboard Pipeline:

1. Click "New pipeline" again
2. Select your repo
3. Select "Existing Azure Pipelines YAML file"
4. Path: `/azure-pipelines/dashboard-pipeline.yml`
5. Click "Continue" → "Run"
6. Name it: "LemoTick Dashboard"

---

## 📋 PART 4: Configure Azure Network Security

### Step 13: Configure Azure Network Security

**What is this?** Azure blocks all internet traffic by default. We need to open specific ports.

1. **Go to Azure Portal:** https://portal.azure.com

2. **Find your VM:**
   - Search for "Virtual machines"
   - Click your Windows Server VM

3. **Go to Networking:**
   - Click "Networking" in the left menu
   - Click "Add inbound port rule"

4. **Add these rules** (click "Add inbound port rule" for each):

   **Rule 1: HTTP (Production Dashboard)**
   - Source: Any
   - Source port ranges: *
   - Destination: Any
   - Service: HTTP
   - Destination port ranges: 80
   - Protocol: TCP
   - Action: Allow
   - Priority: 100
   - Name: `Allow-HTTP`
   - Click "Add"

   **Rule 2: Dev Dashboard**
   - Destination port ranges: 8080
   - Priority: 110
   - Name: `Allow-Dev-Dashboard`
   - Click "Add"

   **Rule 3: QA Dashboard**
   - Destination port ranges: 8090
   - Priority: 120
   - Name: `Allow-QA-Dashboard`
   - Click "Add"

   **Rule 4: Backend APIs**
   - Destination port ranges: 5000-5002
   - Priority: 130
   - Name: `Allow-Backend-APIs`
   - Click "Add"

5. **Wait 2-3 minutes** for rules to apply

---

## 📋 PART 5: Test Your Setup!

### Step 14: Make Your First Deployment

**Let's deploy to development:**

1. **On your local computer** (not the server), open terminal/command prompt

2. **Make sure you're on the dev branch:**
   ```bash
   git checkout dev
   ```

3. **Make a small change** (so there's something to deploy):
   ```bash
   # Edit any file, like add a comment
   echo "# Test deployment" >> README.md
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin dev
   ```

5. **Watch the magic happen:**
   - Go to Azure DevOps → Pipelines
   - You'll see pipelines running!
   - Click on them to watch progress
   - Each step shows what it's doing

6. **Wait for completion** (5-10 minutes first time)

7. **Test your deployed apps:**
   - Dashboard: `http://YOUR_SERVER_IP:8080`
   - Backend API: `http://YOUR_SERVER_IP:5001/swagger`
   - Check if bot is running:
     ```powershell
     # On the server
     docker ps
     # Should show lemotick-bot-dev running
     ```

**If something fails:**
- Click on the failed step in Azure DevOps
- Read the error message
- Common issues:
  - Variable group not linked: Go to pipeline → Edit → Variables → Link variable group
  - Agent offline: Restart agent service on server
  - Docker not running: Start Docker Desktop on server

---

## 📋 PART 6: Deploy to QA and Production

### Step 15: Deploy to QA

1. **Merge dev to qa:**
   ```bash
   git checkout qa
   git merge dev
   git push origin qa
   ```

2. **Watch pipeline run in Azure DevOps**

3. **Test QA:**
   - Dashboard: `http://YOUR_SERVER_IP:8090`
   - Backend API: `http://YOUR_SERVER_IP:5002/swagger`

### Step 16: Deploy to Production

1. **Merge qa to main:**
   ```bash
   git checkout main
   git merge qa
   git push origin main
   ```

2. **Pipeline runs but waits for approval:**
   - Go to Azure DevOps → Pipelines
   - Click on the running pipeline
   - You'll see "Waiting for approval"
   - Click "Review"
   - Click "Approve"

3. **Pipeline completes deployment**

4. **Test Production:**
   - Dashboard: `http://YOUR_SERVER_IP`
   - Backend API: `http://YOUR_SERVER_IP:5000/swagger`

---

## 🎉 You're Done!

### What You've Accomplished:

✅ Set up a Windows Server with all required software
✅ Installed and configured Azure DevOps agent
✅ Created three environments (dev, qa, prod)
✅ Configured automatic deployments
✅ Deployed your first application!

### From Now On:

**To deploy changes:**
1. Write code
2. `git push origin dev` (or qa, or main)
3. Wait 5-10 minutes
4. Your app is updated!

**That's it!** No manual deployment steps needed.

---

## 🔧 Troubleshooting Guide

### Problem: Pipeline fails with "No agent found"

**What this means:** Azure DevOps can't find your agent on the server.

**How to fix:**
1. Connect to your Windows Server via Remote Desktop
2. Open PowerShell as Administrator
3. Check if agent service is running:
   ```powershell
   Get-Service vsts*
   ```
4. If it says "Stopped", start it:
   ```powershell
   Start-Service vstsagent*
   ```
5. Go back to Azure DevOps and retry the pipeline

---

### Problem: Docker container won't start

**What this means:** Docker Desktop isn't running or there's a configuration error.

**How to fix:**
1. Connect to your Windows Server
2. Check if Docker Desktop is running:
   - Look for Docker icon in system tray (bottom right)
   - If not there, start Docker Desktop from Start menu
3. Wait for Docker to fully start (icon turns solid)
4. Test Docker:
   ```powershell
   docker ps
   ```
5. If you see an error, restart Docker Desktop:
   - Right-click Docker icon → Quit Docker Desktop
   - Start Docker Desktop again
6. Retry your pipeline

---

### Problem: Dashboard shows 404 or blank page

**What this means:** IIS isn't serving the files correctly.

**How to fix:**
1. Connect to your Windows Server
2. Open PowerShell as Administrator
3. Check if IIS is running:
   ```powershell
   Get-Service W3SVC
   ```
4. If stopped, start it:
   ```powershell
   Start-Service W3SVC
   ```
5. Check if your site exists:
   ```powershell
   Import-Module WebAdministration
   Get-Website
   ```
6. You should see LemoTick-Dev, LemoTick-QA, LemoTick-Prod
7. If a site is stopped, start it:
   ```powershell
   Start-Website -Name "LemoTick-Dev"
   ```
8. Check if files exist:
   ```powershell
   dir C:\inetpub\wwwroot\lemotick-dev
   ```
9. If folder is empty, re-run the dashboard pipeline

---

### Problem: Can't access site from browser

**What this means:** Firewall is blocking the port.

**How to fix:**

**On the Windows Server:**
1. Open PowerShell as Administrator
2. Check firewall rules:
   ```powershell
   Get-NetFirewallRule -DisplayName "LemoTick-*"
   ```
3. If rules are missing, run:
   ```powershell
   cd C:\LemoTick\azure-pipelines
   .\vm-setup.ps1 -ConfigureFirewall
   ```

**In Azure Portal:**
1. Go to portal.azure.com
2. Find your VM → Networking
3. Check if inbound rules exist for ports 80, 5000-5002, 8080, 8090
4. If missing, add them (see Step 11 above)

---

### Problem: Backend API returns 500 error

**What this means:** The API is running but has a configuration error.

**How to fix:**
1. Check the IIS logs:
   ```powershell
   # Check application logs
   Get-Content C:\inetpub\wwwroot\lemotick-backend-dev\logs\stdout*.log -Tail 50
   
   # Check IIS logs
   Get-Content C:\inetpub\logs\LogFiles\W3SVC*\*.log -Tail 50
   ```
2. Look for errors in the output
3. Common issues:
   - **Database connection failed**: Check DB_CONNECTION_STRING in variable group
   - **Missing environment variable**: Check all variables are set in Azure DevOps
   - **ASP.NET Core Hosting Bundle not installed**: Run setup script again
4. After fixing variables, redeploy:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin dev
   ```

---

### Problem: Bot isn't trading

**What this means:** The bot service is running but not executing trades.

**How to fix:**
1. Check bot logs:
   ```powershell
   # View service logs
   Get-Content C:\lemotick-logs\bot-dev\service-stdout.log -Tail 50
   
   # Or check Windows Event Viewer
   Get-EventLog -LogName Application -Source "LemoTick-Bot-Dev" -Newest 20
   ```
2. Look for errors
3. Common issues:
   - **Invalid Deriv token**: Check DERIV_API_TOKEN in variable group
   - **Can't reach backend**: Check BACKEND_API_URL is correct
   - **Authentication failed**: Check BACKEND_API_KEY matches backend
4. Restart the service:
   ```powershell
   Restart-Service -Name "LemoTick-Bot-Dev"
   ```

---

### Problem: Pipeline succeeds but changes don't appear

**What this means:** Cache issue or wrong branch deployed.

**How to fix:**
1. **Check you pushed to the right branch:**
   ```bash
   git branch
   # Should show * dev (or qa, or main)
   ```
2. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Or try incognito mode
3. **Force rebuild:**
   ```bash
   git commit --allow-empty -m "Force rebuild"
   git push origin dev
   ```
4. **Check the site is using new version:**
   ```powershell
   # For backend/bot - check service status
   Get-Service "LemoTick-Backend-Dev"
   Get-Service "LemoTick-Bot-Dev"
   
   # For dashboard - check file timestamps
   Get-ChildItem C:\inetpub\wwwroot\lemotick-dev | Sort-Object LastWriteTime -Descending | Select-Object -First 5
   ```

---

### Problem: Database connection failed

**What this means:** The backend can't connect to PostgreSQL.

**For Azure Database for PostgreSQL:**

1. **Check firewall rules:**
   - Go to Azure Portal → Your PostgreSQL server
   - Click "Networking"
   - Make sure your VM's IP is in the firewall rules
   - Or enable "Allow Azure services and resources to access this server"

2. **Test connection from your VM:**
   ```powershell
   # Install psql client (optional)
   # Or test from your backend app
   
   # Check if you can reach the server
   Test-NetConnection -ComputerName lemotick-db.postgres.database.azure.com -Port 5432
   ```

3. **Verify connection string in Azure DevOps:**
   - Should include: `SSL Mode=Require;Trust Server Certificate=true`
   - Format: `Host=lemotick-db.postgres.database.azure.com;Port=5432;Database=lemotick_dev;Username=lemotickadmin;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true`

4. **Check database exists:**
   - Go to Azure Portal → Your PostgreSQL server → Databases
   - Verify lemotick_dev, lemotick_qa, lemotick_prod exist

5. **Check backend logs:**
   ```powershell
   Get-Content C:\inetpub\wwwroot\lemotick-backend-dev\logs\stdout*.log -Tail 50
   ```

**For local PostgreSQL (if you chose Option B):**

1. Check if PostgreSQL is running:
   ```powershell
   Get-Service postgresql-16
   ```
2. If stopped, start it:
   ```powershell
   Start-Service postgresql-16
   ```
3. Test connection:
   ```powershell
   psql -U postgres -d lemotick_dev
   ```

---

### Problem: Permission denied errors in pipeline

**What this means:** The agent doesn't have permission to access files/folders.

**How to fix:**
1. Connect to Windows Server
2. Open PowerShell as Administrator
3. Give agent permissions:
   ```powershell
   # For IIS folders
   $acl = Get-Acl "C:\inetpub\wwwroot"
   $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("NT AUTHORITY\NETWORK SERVICE","FullControl","ContainerInherit,ObjectInherit","None","Allow")
   $acl.SetAccessRule($rule)
   Set-Acl "C:\inetpub\wwwroot" $acl
   
   # For log folders
   $acl = Get-Acl "C:\lemotick-logs"
   $acl.SetAccessRule($rule)
   Set-Acl "C:\lemotick-logs" $acl
   ```
4. Restart agent service:
   ```powershell
   Restart-Service vstsagent*
   ```

---

### Problem: Variable group not found

**What this means:** Pipeline can't access the variable group.

**How to fix:**
1. In Azure DevOps, go to Pipelines → Pipelines
2. Click on your pipeline (e.g., "LemoTick Backend")
3. Click "Edit"
4. Click "Variables" (top right)
5. Click "Variable groups"
6. Click "Link variable group"
7. Select the appropriate group (lemotick-dev, lemotick-qa, or lemotick-prod)
8. Click "Link"
9. Click "Save"
10. Run the pipeline again

---

### Problem: Out of disk space

**What this means:** Old build artifacts are filling up the disk.

**How to fix:**
1. Connect to Windows Server
2. Clean up old files:
   ```powershell
   # Clean up old agent builds
   cd C:\agents\_work
   Get-ChildItem | Sort-Object LastWriteTime -Descending | Select-Object -Skip 3 | Remove-Item -Recurse -Force
   
   # Clean up temp files
   Remove-Item $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue
   
   # Check disk space
   Get-PSDrive C | Select-Object Used, Free
   ```

---

## 📊 Monitoring Your Deployments

### Check What's Running

**On Windows Server:**

```powershell
# See all IIS sites
Import-Module WebAdministration
Get-Website | Format-Table Name, State, Bindings -AutoSize

# See all Windows Services
Get-Service "LemoTick-*" | Format-Table Name, Status, DisplayName -AutoSize

# Check disk space
Get-PSDrive C | Select-Object Used, Free

# Check memory usage
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet / 1MB, 2)}}
```

### View Logs

**Backend API logs:**
```powershell
# Application logs
Get-Content C:\inetpub\wwwroot\lemotick-backend-dev\logs\stdout*.log -Tail 100

# IIS logs
Get-Content C:\inetpub\logs\LogFiles\W3SVC*\*.log -Tail 50
```

**Bot logs:**
```powershell
# Service logs
Get-Content C:\lemotick-logs\bot-dev\service-stdout.log -Tail 100 -Wait

# Or from files
Get-Content C:\LemoTick\Bot\Dev\*.log -Tail 100
```

**Dashboard logs:**
```powershell
# IIS logs for dashboard
Get-Content C:\inetpub\logs\LogFiles\W3SVC*\*.log -Tail 50
```

### Pipeline History

**In Azure DevOps:**
1. Go to Pipelines → Pipelines
2. Click on a pipeline
3. See all runs with status (success/failed)
4. Click any run to see details
5. Click any step to see logs

---

## 🎓 Understanding What Each Part Does

### IIS (Internet Information Services)

**What is IIS?**
IIS is Windows' built-in web server. It can host both static websites (like your React dashboard) and dynamic applications (like your .NET API).

**Why use it?**
- Built into Windows Server (no extra software needed)
- Fast and reliable
- Easy to manage
- Perfect for .NET applications

**How it works:**
1. Pipeline builds your app
2. Copies files to C:\inetpub\wwwroot\{app-name}
3. IIS serves the files when someone visits your site

### Windows Services (for Bot)

**What is a Windows Service?**
A program that runs in the background, even when no one is logged in. It starts automatically when the server boots.

**Why use it?**
- Runs 24/7 automatically
- Restarts if it crashes
- No need to keep a terminal window open
- Managed by Windows

**How it works:**
1. Pipeline packages your Python bot
2. NSSM (a service manager) wraps it as a Windows Service
3. Service starts automatically and runs continuously

### ASP.NET Core Hosting Bundle

**What is it?**
A module that lets IIS run .NET applications. Without it, IIS can only serve static files.

**Why need it?**
Your backend API is a .NET application that needs to run inside IIS.

**How it works:**
- IIS receives a request
- Hosting Bundle starts your .NET app
- Your app processes the request
- IIS returns the response

### Azure DevOps Agent

**What is it?**
A program running on your server that listens for work from Azure DevOps.

**Why on the server?**
- Can directly deploy to IIS
- Can manage Windows Services
- No need to transfer files over internet

**How it works:**
1. You push code to Git
2. Azure DevOps says "Hey agent, build this!"
3. **Agent automatically downloads your code** to a temporary folder (C:\agents\_work)
4. Agent runs pipeline steps (build, test, deploy)
5. Agent deploys to server
6. **Agent cleans up** the temporary files
7. Next time you push, it downloads fresh code again

**You never need to manually update code on the server!**

---


## 📚 Quick Reference

### Useful Commands

**IIS commands:**
```powershell
# Import IIS module
Import-Module WebAdministration

# List sites
Get-Website

# Start site
Start-Website -Name "LemoTick-Backend-Dev"

# Stop site
Stop-Website -Name "LemoTick-Backend-Dev"

# Restart site
Restart-Website -Name "LemoTick-Backend-Dev"

# Check site status
Get-Website -Name "LemoTick-Backend-Dev"

# List app pools
Get-ChildItem IIS:\AppPools

# Restart app pool
Restart-WebAppPool -Name "LemoTick-Backend-Dev"
```

**Windows Service commands:**
```powershell
# List LemoTick services
Get-Service "LemoTick-*"

# Start service
Start-Service -Name "LemoTick-Bot-Dev"

# Stop service
Stop-Service -Name "LemoTick-Bot-Dev"

# Restart service
Restart-Service -Name "LemoTick-Bot-Dev"

# Check service status
Get-Service -Name "LemoTick-Bot-Dev"

# View service logs
Get-Content C:\lemotick-logs\bot-dev\service-stdout.log -Tail 50
```

**Service commands:**
```powershell
# Check service status
Get-Service <service-name>

# Start service
Start-Service <service-name>

# Stop service
Stop-Service <service-name>

# Restart service
Restart-Service <service-name>

# Agent service
Get-Service vsts*
Restart-Service vstsagent*

# IIS service
Get-Service W3SVC
Restart-Service W3SVC
```

---

## 🎯 Next Steps

Now that you have automatic deployment set up, consider:

1. **Set up monitoring:**
   - Application Insights for error tracking
   - Azure Monitor for server health
   - Email alerts for failed deployments

2. **Add automated tests:**
   - Unit tests run in pipeline
   - Integration tests before deployment
   - Smoke tests after deployment

3. **Improve security:**
   - Use Azure Key Vault for secrets
   - Enable HTTPS with SSL certificates
   - Set up Azure AD authentication

4. **Scale up:**
   - Add load balancer for multiple servers
   - Set up database replication
   - Configure auto-scaling

5. **Backup strategy:**
   - Automated database backups
   - Container image versioning
   - Configuration backups

---

## 📞 Getting Help

**If you're stuck:**

1. **Check the logs** (see Monitoring section above)
2. **Read the error message carefully** - it usually tells you what's wrong
3. **Google the error** - someone else has probably had the same issue
4. **Check Azure DevOps documentation:** https://docs.microsoft.com/azure/devops/
5. **Check Docker documentation:** https://docs.docker.com/

**Common resources:**
- Azure DevOps: https://dev.azure.com
- Docker Hub: https://hub.docker.com
- Azure Portal: https://portal.azure.com

---

## ✅ Checklist

Use this to verify your setup:

**Server Setup:**
- [ ] Windows Server is running
- [ ] Can connect via Remote Desktop
- [ ] Docker Desktop installed and running
- [ ] IIS installed and running
- [ ] Node.js installed
- [ ] .NET 8 SDK installed
- [ ] Python installed
- [ ] Firewall ports configured
- [ ] Log directories created

**Azure DevOps:**
- [ ] Project created
- [ ] Agent installed and online
- [ ] Variable groups created (dev, qa, prod)
- [ ] Environments created (development, staging, production)
- [ ] Production environment has approval
- [ ] Pipelines created (backend, bot, dashboard)
- [ ] Pipelines linked to variable groups

**Azure Portal:**
- [ ] NSG rules created for all ports
- [ ] VM is running
- [ ] Can access VM's public IP

**Testing:**
- [ ] Can deploy to dev
- [ ] Can access dev dashboard
- [ ] Can access dev backend API
- [ ] Dev bot container is running
- [ ] Can deploy to qa
- [ ] Can deploy to prod (with approval)

---

**Congratulations! You now have a fully automated deployment pipeline!** 🎉
