import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { createProxyMiddleware } from "http-proxy-middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy AI requests to the Python AI service
  const getAiTarget = () => {
    const internalUrl = process.env.AI_SERVICE_INTERNAL_URL;
    if (internalUrl) {
      // Internal Render services should use http and require the port we specified (8000)
      if (internalUrl.startsWith("http")) return internalUrl;
      // If just a hostname was provided (e.g. 'fintrack-ai'), add http and port 8000
      return internalUrl.includes(":") ? `http://${internalUrl}` : `http://${internalUrl}:8000`;
    }
    const publicUrl = process.env.EXPO_PUBLIC_AI_SERVICE_URL;
    if (publicUrl && publicUrl.startsWith("http")) {
      return publicUrl;
    }
    return "http://127.0.0.1:8000";
  };

  const AI_SERVICE_URL = getAiTarget();

  console.log(`Setting up AI proxy to: ${AI_SERVICE_URL}`);

  app.use(
    createProxyMiddleware({
      target: AI_SERVICE_URL,
      changeOrigin: true,
      pathFilter: "/api/ai/**",
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
        proxyRes: (proxyRes: any, req: any, res: any) => {
          proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        },
      },
    })
  );

  const httpServer = createServer(app);

  return httpServer;
}
