import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Student Academic Reminder & Resource Platform API",
    version: "0.1.0",
    description: "API documentation for the student academic reminder platform",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js", "./models/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerMiddleware = [swaggerUi.serve, swaggerUi.setup(swaggerSpec)];
