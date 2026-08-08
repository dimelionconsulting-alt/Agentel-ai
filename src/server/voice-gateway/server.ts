import { createServer } from "http";
import { WebSocketServer } from "ws";

import { getDemoStore } from "@/lib/demo-store";
import { TwilioOpenAIRealtimeBridge } from "@/server/voice-gateway/bridge";

const port = Number(process.env.VOICE_GATEWAY_PORT || 8081);

/**
 * Standalone voice gateway process.
 * Deploy on Railway/Render/AWS. Point Twilio Media Streams at wss://<host>/streams.
 */
async function main() {
  const server = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, service: "agentel-voice-gateway" }));
      return;
    }

    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ server, path: "/streams" });

  wss.on("connection", async (socket, request) => {
    const url = new URL(request.url ?? "/streams", `http://${request.headers.host}`);
    const agentId = url.searchParams.get("agentId");
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      socket.close(1011, "Missing OPENAI_API_KEY");
      return;
    }

    const agent =
      getDemoStore().agents.find((item) => item.id === agentId) ??
      getDemoStore().agents[0];

    if (!agent) {
      socket.close(1011, "Agent not found");
      return;
    }

    const bridge = new TwilioOpenAIRealtimeBridge(socket, agent, apiKey);
    try {
      await bridge.start();
    } catch (error) {
      console.error("Failed to start realtime bridge", error);
      socket.close(1011, "Bridge failed");
    }
  });

  server.listen(port, () => {
    console.log(`Agentel voice gateway listening on :${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
