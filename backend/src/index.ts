import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { leadsRouter } from "./routes/leads";
import { notesRouter } from "./routes/notes";
import { aiRouter } from "./routes/ai";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Read allowed origins from environment variables, stripping potential copy-paste quotes
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/^['"]|['"]$/g, ""))
  .filter(Boolean);

const normalizeUrl = (url: string) => url.replace(/\/$/, "");

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
    return true;
  }
  const normalizedOrigin = normalizeUrl(origin);
  const allowed = allowedOrigins.some((allowed) => normalizeUrl(allowed) === normalizedOrigin);
  console.log(`[CORS Check] Incoming: "${origin}". Allowed list: ${JSON.stringify(allowedOrigins)}. Result: ${allowed}`);
  return allowed;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/leads", leadsRouter);
app.use("/api/notes", notesRouter);
app.use("/api/ai", aiRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
