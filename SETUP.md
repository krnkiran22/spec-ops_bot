# SpecOps Bot — Complete Setup Guide

Follow every step in order. Do not skip any step.

---

## PART 1 — Discord Developer Portal

### 1.1 Create the Application

1. Open → https://discord.com/developers/applications
2. Click **New Application** (top right)
3. Name it `SpecOps Bot` → click **Create**
4. You are now on the **General Information** page
5. Copy the **Application ID** — save it somewhere, this is your `DISCORD_CLIENT_ID`

---

### 1.2 Create the Bot & Get the Token

1. In the left sidebar click **Bot**
2. Click **Reset Token** → click **Yes, do it** to confirm
3. Copy the token that appears — save it, this is your `DISCORD_TOKEN`

   > This token is shown only once. If you miss it, reset again.

4. Scroll down to **Privileged Gateway Intents**
5. Turn ON these two:
   - `SERVER MEMBERS INTENT` — toggle it ON
   - `MESSAGE CONTENT INTENT` — toggle it ON
6. Click **Save Changes** at the bottom

---

### 1.3 Invite the Bot to Your Server

1. In the left sidebar click **OAuth2**
2. Click **URL Generator**
3. Under **Scopes** check:
   - `bot`
   - `applications.commands`
4. Under **Bot Permissions** check all of these:

   | Permission | Where to find it |
   |---|---|
   | Read Messages / View Channels | General Permissions |
   | Send Messages | Text Permissions |
   | Send Messages in Threads | Text Permissions |
   | Create Private Threads | Text Permissions |
   | Manage Threads | Text Permissions |
   | Embed Links | Text Permissions |
   | Mention Everyone | Text Permissions |
   | Read Message History | Text Permissions |
   | Use Slash Commands | Text Permissions |

5. Scroll down — copy the **Generated URL**
6. Open the URL in your browser
7. Select your server from the dropdown → click **Authorise** → complete the captcha
8. Bot will now appear in your server (offline is fine for now)

---

## PART 2 — Discord Server Setup

### 2.1 Enable Developer Mode

1. Open Discord
2. Go to **User Settings** (gear icon bottom left)
3. Go to **Advanced**
4. Turn ON **Developer Mode**

   > This lets you right-click anything to copy its ID.

---

### 2.2 Create Roles

Go to **Server Settings → Roles → Create Role** and create these roles:

| Role Name | Colour | Who gets it |
|---|---|---|
| Admin | Red | Server admins |
| Ops Team | Blue | Operations / support staff |
| Finance Team | Green | Payroll / finance staff |
| Office Team | Orange | Office operations staff |
| Field Staff | Yellow | Field employees |
| Staff | Grey | All regular employees |

After creating each role, **right-click it → Copy Role ID** and save:

- `OPS_ROLE_ID` = Role ID of **Ops Team**
- `FINANCE_ROLE_ID` = Role ID of **Finance Team**

---

### 2.3 Create Channels

Create these categories and channels in your server:

```
ANNOUNCEMENTS
  #general-announcements
  #salary-announcements

TICKETING
  #raise-a-ticket
  #ticket-admin

SALARY & FINANCE
  #salary-pipeline
  #reimbursement-requests

EVENTS
  #attendance
  #leave-requests

OFFICE OPS
  #inventory
  #shipping
```

---

### 2.4 Set Channel Permissions

For each channel, go to **Edit Channel → Permissions** and configure:

| Channel | Who can see it | Who can send messages |
|---|---|---|
| #general-announcements | Everyone | Admin only |
| #salary-announcements | Everyone | Finance Team, Admin |
| #raise-a-ticket | Everyone | Everyone (bot handles it) |
| #ticket-admin | Ops Team, Admin | Ops Team, Admin |
| #salary-pipeline | Finance Team, Admin | Finance Team, Admin |
| #reimbursement-requests | Finance Team, Staff, Admin | Finance Team, Admin |
| #attendance | Everyone | Everyone |
| #leave-requests | Everyone | Everyone |
| #inventory | Office Team, Admin | Office Team, Admin |
| #shipping | Office Team, Admin | Office Team, Admin |

---

### 2.5 Get Your Server ID

1. Right-click your **server name** (top left)
2. Click **Copy Server ID**
3. Save it — this is your `GUILD_ID`

---

## PART 3 — Railway Setup

### 3.1 Create the Project

1. Go to → https://railway.app
2. Click **New Project**
3. Click **Deploy from GitHub repo**
4. Connect your GitHub if not already connected
5. Select `krnkiran22/spec-ops_bot`
6. Railway will start building automatically — let it run

---

### 3.2 Add PostgreSQL Database

1. Inside your Railway project, click **+ New**
2. Click **Database**
3. Click **Add PostgreSQL**
4. Railway adds a PostgreSQL service and automatically links `DATABASE_URL` to your project

To get the `DATABASE_URL` manually:
1. Click the **PostgreSQL** service
2. Go to **Variables** tab
3. Copy the value of `DATABASE_URL`

---

### 3.3 Add Environment Variables

1. Click your **bot service** (not the PostgreSQL one) in the Railway project
2. Go to **Variables** tab
3. Click **+ New Variable** and add each one:

```
DISCORD_TOKEN         = (copied in Step 1.2)
DISCORD_CLIENT_ID     = (copied in Step 1.1)
GUILD_ID              = (copied in Step 2.5)
OPS_ROLE_ID           = (copied in Step 2.2)
FINANCE_ROLE_ID       = (copied in Step 2.2)
NODE_ENV              = production
```

> `DATABASE_URL` is already auto-set by Railway — you do not need to add it manually.

4. Click **Deploy** — Railway will rebuild with the new variables

---

### 3.4 Check the Deployment Logs

1. Click your bot service → **Deployments** tab
2. Click the latest deployment
3. You should see:

```
[Startup] SpecOps Bot starting...
[Commands] Loaded 2 commands
[Bot] Logged in as SpecOps Bot#XXXX
```

If you see errors, copy the log and send it to me.

---

## PART 4 — Final Bot Setup in Discord

### 4.1 Register Slash Commands

After the bot is online in Railway:

1. On your local machine, inside the project folder, create a `.env` file:

```
DISCORD_TOKEN=your_token_here
DISCORD_CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
OPS_ROLE_ID=your_ops_role_id_here
FINANCE_ROLE_ID=your_finance_role_id_here
DATABASE_URL=your_database_url_here
NODE_ENV=development
```

2. Run:

```bash
npm install
npm run deploy-commands
```

3. You should see:

```
[Deploy] Registering slash commands...
[Deploy] Successfully registered 2 commands.
```

---

### 4.2 Post the Ticket Panel

1. Go to your `#raise-a-ticket` channel in Discord
2. Type `/setup-tickets` and press Enter
3. Bot posts the ticket panel with a **Raise a Ticket** button

---

### 4.3 Test the Full Flow

1. Click **Raise a Ticket** in `#raise-a-ticket`
2. A message appears with 4 buttons — pick a category (e.g., General)
3. A form/modal popup appears — fill it in and submit
4. Bot creates a private thread visible only to you and the Ops Team
5. Ops team sees the thread with action buttons: **Assign to Me**, **Resolve**, **Escalate**

---

## PART 5 — What to Send Me

Once you have collected everything, send me these values so I can run the database migration and register commands on your behalf:

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
GUILD_ID=
OPS_ROLE_ID=
FINANCE_ROLE_ID=
DATABASE_URL=
```

---

## Quick Reference — All Values to Collect

| Variable | Where you get it | Status |
|---|---|---|
| `DISCORD_TOKEN` | Discord Dev Portal → Bot → Reset Token | [ ] |
| `DISCORD_CLIENT_ID` | Discord Dev Portal → General Information → Application ID | [ ] |
| `GUILD_ID` | Right-click server name in Discord → Copy Server ID | [ ] |
| `OPS_ROLE_ID` | Server Settings → Roles → right-click Ops Team → Copy Role ID | [ ] |
| `FINANCE_ROLE_ID` | Server Settings → Roles → right-click Finance Team → Copy Role ID | [ ] |
| `DATABASE_URL` | Railway → PostgreSQL service → Variables tab | [ ] |
