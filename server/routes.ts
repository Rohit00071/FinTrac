import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { createProxyMiddleware } from "http-proxy-middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy AI requests to the Python AI service
  const getAiTarget = () => {
    const internalUrl = process.env.AI_SERVICE_INTERNAL_URL;
    if (internalUrl) {
      return internalUrl.startsWith("http") ? internalUrl : `https://${internalUrl}`;
    }
    const publicUrl = process.env.EXPO_PUBLIC_AI_SERVICE_URL;
    if (publicUrl && publicUrl.startsWith("http")) {
      return publicUrl;
    }
    return "http://localhost:8000";
  };

  const AI_SERVICE_URL = getAiTarget();

  console.log(`Setting up AI proxy to: ${AI_SERVICE_URL}`);

  app.use(
    "/api/ai",
    createProxyMiddleware({
      target: AI_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        "^/api/ai": "/ai",
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
      },
    })
  );

  const httpServer = createServer(app);

  return httpServer;
}
