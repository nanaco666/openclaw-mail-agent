---
name: mail-agent
description: Install and configure the mail-agent OpenClaw plugin. Use when the user wants to connect mail-agent to Telegram, receive email notifications in Telegram, set up mail-agent Telegram push, bridge mail-agent with OpenClaw, or asks to install the mail-agent plugin.
---

Installs and configures the [mail-agent](https://github.com/nanaco666/mail-agent) OpenClaw plugin, which forwards important email notifications to Telegram via OpenClaw's configured bot.

## Prerequisites check

Before installing, verify:

```bash
# mail-agent must be running
curl -s http://localhost:3000/api/emails?limit=1

# Telegram must be configured in OpenClaw
openclaw channels telegram status
```

If mail-agent is not running, tell the user to start it first.
If Telegram is not configured, run `/telegram:configure` first.

## Install

```bash
openclaw plugins install https://github.com/nanaco666/openclaw-mail-agent/archive/refs/heads/main.tar.gz
```

## Configure

The plugin requires a Telegram chat ID to deliver notifications to.

To find your chat ID: message [@userinfobot](https://t.me/userinfobot) on Telegram — it replies with your numeric ID.

```bash
openclaw plugins config mail-agent --set chatId=YOUR_CHAT_ID
```

If mail-agent runs on a non-default port or remote host:

```bash
openclaw plugins config mail-agent --set mailAgentUrl=ws://HOST:PORT
```

## Activate

```bash
openclaw gateway restart
```

After restart, verify the plugin connected:

```bash
openclaw plugins list
openclaw gateway logs | grep mail-agent
```

You should see: `mail-agent: connected`

## How it works

```
Gmail → mail-agent pipeline → agent_push (WebSocket)
                                    ↓
                          OpenClaw mail-agent plugin
                                    ↓
                        Telegram (via OpenClaw bot)
```

Only emails the pipeline classifies as important trigger a notification. Newsletters, automated mail, and low-priority items are silently filtered.

## Uninstall

```bash
openclaw plugins uninstall mail-agent
openclaw gateway restart
```
