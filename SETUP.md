# SpecOps Bot — Setup Checklist

Everything you need to collect and send back so the bot goes live.

---

## STEP 1 — Create the Discord Application

1. Go to → https://discord.com/developers/applications
2. Click **New Application** → name it `SpecOps Bot` → Create
3. Go to **General Information** tab
   - Copy **Application ID** → you'll need this as `DISCORD_CLIENT_ID`
4. Go to **Bot** tab
   - Click **Reset Token** → confirm → copy the token → `DISCORD_TOKEN`
   - Scroll down to **Privileged Gateway Intents** and turn ON:
     - `SERVER MEMBERS INTENT`
     - `MESSAGE CONTENT INTENT`
   - Click **Save Changes**

> Keep the token private. Never share it. If leaked, reset it immediately.

---

## STEP 2 — Invite the Bot to Your Server

Replace `YOUR_CLIENT_ID` with the Application ID you copied above and open this URL in your browser:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=395136908304&scope=bot+applications.commands
```

### What permissions this grants the bot:

| Permission | Why it's needed |
|---|---|
| Read Messages / View Channels | See channels to respond in |
| Send Messages | Post ticket embeds and responses |
| Send Messages in Threads | Respond inside private ticket threads |
| Create Private Threads | Create isolated ticket conversations |
| Manage Threads | Archive threads when tickets are resolved |
| Embed Links | Post rich ticket embed cards |
| Use Slash Commands | Register and respond to /commands |
| Mention Roles | Ping ops/finance team on escalation |
| Read Message History | Fetch previous messages in threads |

---

## STEP 3 — Collect Discord IDs

Enable Developer Mode in Discord:
> User Settings → Advanced → Developer Mode → ON

Then right-click to copy IDs:

| What | How to get it | Variable name |
|---|---|---|
| Server ID | Right-click your server name → Copy Server ID | `GUILD_ID` |
| Ops Team Role ID | Server Settings → Roles → right-click Ops role → Copy Role ID | `OPS_ROLE_ID` |
| Finance Team Role ID | Server Settings → Roles → right-click Finance role → Copy Role ID | `FINANCE_ROLE_ID` |

> If you haven't created the Ops and Finance roles yet, create them first under Server Settings → Roles.

---

## STEP 4 — Set Up Railway

1. Go to → https://railway.app
2. Create a **New Project** → **Deploy from GitHub repo** → select `krnkiran22/spec-ops_bot`
3. Add a **PostgreSQL** service to the same project:
   - Click **+ New** → **Database** → **Add PostgreSQL**
   - Railway will automatically set the `DATABASE_URL` environment variable
4. Copy the `DATABASE_URL` from the PostgreSQL service → Variables tab

---

## STEP 5 — Set Environment Variables in Railway

In your Railway project → your bot service → **Variables** tab, add:

```
DISCORD_TOKEN         = (from Step 1)
DISCORD_CLIENT_ID     = (from Step 1)
GUILD_ID              = (from Step 3)
OPS_ROLE_ID           = (from Step 3)
FINANCE_ROLE_ID       = (from Step 3)
DATABASE_URL          = (auto-set by Railway PostgreSQL service)
NODE_ENV              = production
```

---

## STEP 6 — What to Send Back to Get the Bot Deployed

Once you have everything from the steps above, share these with me:

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
GUILD_ID=
OPS_ROLE_ID=
FINANCE_ROLE_ID=
DATABASE_URL=
```

I will:
- Run the database migration (create all tables)
- Register the slash commands to your server
- Confirm everything is wired correctly

---

## STEP 7 — First Time Setup in Discord (after deployment)

1. Go to the `#raise-a-ticket` channel in your server
2. Type `/setup-tickets` → Enter
3. Bot will post the ticket panel with the **Raise a Ticket** button
4. Test it — click the button, pick a category, fill the form
5. A private thread should be created only visible to you + ops team

---

## Channel Structure to Create in Discord

Create these channels/categories in your server before setup:

```
ANNOUNCEMENTS (category)
  #general-announcements      [read-only for staff]
  #salary-announcements       [read-only for staff]

TICKETING (category)
  #raise-a-ticket             [all staff can see, bot posts panel here]
  #ticket-admin               [ops team only]

SALARY & FINANCE (category)
  #salary-pipeline            [finance team only]
  #reimbursement-requests     [finance team + staff]

EVENTS (category)
  #attendance                 [all staff]
  #leave-requests             [all staff]

OFFICE OPS (category)
  #inventory                  [office team]
  #shipping                   [office team]
```

---

## Roles to Create in Discord

| Role Name | Who gets it | Colour suggestion |
|---|---|---|
| Ops Team | Operations / support staff | Blue |
| Finance Team | Payroll / finance staff | Green |
| Admin | Server admins | Red |
| Staff | All regular employees | Grey |
| Field Staff | Field employees | Orange |

---

## Summary — What I Need From You

- [ ] `DISCORD_TOKEN`
- [ ] `DISCORD_CLIENT_ID`
- [ ] `GUILD_ID`
- [ ] `OPS_ROLE_ID`
- [ ] `FINANCE_ROLE_ID`
- [ ] `DATABASE_URL` (from Railway PostgreSQL)
