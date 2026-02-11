import swaggerJsdoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sample API",
      version: "1.0.0",
      description: "API documentation for Sample Project",
    },
    servers: [{ url: "http://localhost:8000" }],
  },
  apis: ["./src/routes/*.ts"], // Use ./dist/src/routes/*.js after build
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
