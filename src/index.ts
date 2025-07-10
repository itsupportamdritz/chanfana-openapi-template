import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

// 👇 This imports the raw HTML file as a string
import loadingHtml from "./loading.html?raw";

const app = new Hono<{ Bindings: Env }>();

// ✅ Serve loading.html when visiting "/"
app.get("/", (c) => {
  return c.html(loadingHtml);
});

// 🔧 Optional: Move Swagger UI to "/docs" instead of root
const openapi = fromHono(app, {
  docs_url: "/docs", // 👈 change from "/" to "/docs"
  schema: {
    info: {
      title: "My Awesome API",
      version: "2.0.0",
      description: "This is the documentation for my awesome API.",
    },
  },
});

// Register your existing routes
openapi.route("/tasks", tasksRouter);
openapi.post("/dummy/:slug", DummyEndpoint);

// Error handler
app.onError((err, c) => {
  if (err instanceof ApiException) {
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode
    );
  }

  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: "Internal Server Error" }],
    },
    500
  );
});

export default app;
