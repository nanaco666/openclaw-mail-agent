# mail-agent — OpenClaw Plugin

Bridges [mail-agent](https://github.com/nanaco666/mail-agent) with [OpenClaw](https://openclaw.ai).

When mail-agent classifies an incoming email as important, this plugin forwards the notification to your Telegram via OpenClaw's configured bot — no extra API keys needed.

## Prerequisites

- [OpenClaw](https://openclaw.ai) installed and running
- Telegram bot configured in OpenClaw (`openclaw channels telegram`)
- mail-agent running locally (default: `ws://localhost:3000`)

## Install

```bash
# 1. Clone mail-agent (or just the plugin folder)
git clone https://github.com/nanaco666/mail-agent
cd mail-agent

# 2. Install the plugin into OpenClaw
openclaw plugins install ./openclaw-plugin --link

# 3. Configure: set your Telegram chat ID
openclaw plugins config mail-agent --set chatId=YOUR_CHAT_ID

# 4. Restart the gateway
openclaw gateway restart
```

To find your Telegram chat ID, message [@userinfobot](https://t.me/userinfobot) on Telegram — it replies with your numeric user ID. For a group/channel, forward a message from the group to [@userinfobot](https://t.me/userinfobot).

## Configuration

| Key | Default | Description |
|-----|---------|-------------|
| `chatId` | **required** | Telegram chat/user/group ID to send notifications to |
| `mailAgentUrl` | `ws://localhost:3000` | WebSocket URL of your mail-agent instance |

Set config via OpenClaw:

```bash
openclaw plugins config mail-agent --set chatId=-1001234567890
openclaw plugins config mail-agent --set mailAgentUrl=ws://192.168.1.10:3000
```

## How it works

```
Gmail → mail-agent pipeline → agent_push (WebSocket)
                                    ↓
                            OpenClaw plugin (this)
                                    ↓
                          Telegram (via OpenClaw bot)
```

The plugin connects to mail-agent's WebSocket server and listens for `agent_push` messages. These are only emitted when the pipeline decides an email is important enough to notify. The plugin then forwards the message content to Telegram using OpenClaw's already-configured bot.

## Uninstall

```bash
openclaw plugins uninstall mail-agent
openclaw gateway restart
```
