import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/configs/swagger.config.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { connetdedDB, port } from "./src/configs/db.config.js";
import router from "./src/routes/index.route.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "*", // allow all origins (Swagger UI will work)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Trust proxy in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Main routes
app.use("/api", router);

// JSON error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON format." });
    }
    next(err);
  },
);

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  },
);

connetdedDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
