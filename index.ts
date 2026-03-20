import WebSocket from "ws";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/device-pair";

type PluginConfig = {
  mailAgentUrl?: string;   // default: ws://localhost:3000
  chatId?: string;         // Telegram chat/group ID to send to
};

type AgentPushMessage = {
  type: "agent_push";
  content: string;
};

export default function register(api: OpenClawPluginApi) {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function connect() {
    if (stopped) return;

    const cfg = (api.pluginConfig ?? {}) as PluginConfig;
    const url = cfg.mailAgentUrl ?? "ws://localhost:3000";
    const chatId = cfg.chatId;
    if (!chatId) {
      api.logger.warn?.("mail-agent: chatId not configured — set it via OpenClaw plugin config");
      return;
    }

    api.logger.info?.(`mail-agent: connecting to ${url}`);
    ws = new WebSocket(url);

    ws.on("open", () => {
      api.logger.info?.("mail-agent: connected");
    });

    ws.on("message", async (raw: Buffer) => {
      let msg: AgentPushMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (msg.type !== "agent_push" || !msg.content) return;

      const send = api.runtime?.channel?.telegram?.sendMessageTelegram;
      if (!send) {
        api.logger.warn?.("mail-agent: telegram runtime not available");
        return;
      }

      try {
        await send(chatId, msg.content, {});
        api.logger.info?.("mail-agent: pushed to telegram");
      } catch (err) {
        api.logger.warn?.(`mail-agent: telegram send failed: ${String((err as Error)?.message ?? err)}`);
      }
    });

    ws.on("close", () => {
      api.logger.info?.("mail-agent: disconnected, reconnecting in 10s");
      if (!stopped) {
        reconnectTimer = setTimeout(connect, 10_000);
      }
    });

    ws.on("error", (err: Error) => {
      api.logger.warn?.(`mail-agent: ws error: ${err.message}`);
    });
  }

  api.registerService({
    id: "mail-agent-watcher",
    start: async () => {
      stopped = false;
      connect();
    },
    stop: async () => {
      stopped = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    },
  });
}
