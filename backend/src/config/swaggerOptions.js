export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hospital Appointment Booking API",
      version: "1.0.0",
      description: "API docs for booking doctor appointments",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // JSON Web Token
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["src/routes/*.js"], // đường dẫn chứa comment mô tả API
};
