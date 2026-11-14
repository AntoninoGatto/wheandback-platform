import { defineRailway, github, project, service } from "railway/iac";

/**
 * IaC replacement for services/mercur-marketplace/railway.json.
 * Partial on purpose: Postgres, Redis, and the Vercel storefront stay as they
 * are on the Railway project. Do not apply this file until the service name
 * matches the existing API service, or the plan will create a second one.
 *
 * `railway config migrate` rewrites Dockerfile builds as Railpack. This file
 * sets builder DOCKERFILE on purpose.
 */
export const partial = "mercur-api";

export default defineRailway(() => {
  const api = service("mercur-api", {
    source: github("AntoninoGatto/wheandback-platform", {
      rootDirectory: "services/mercur-marketplace",
    }),
    rootDirectory: "services/mercur-marketplace",
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "Dockerfile",
    },
    start: "/docker/entrypoint.sh",
    healthcheck: "/health",
    healthcheckTimeout: 300,
    deploy: {
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 5,
    },
    replicas: 1,
  });

  return project("wheback", {
    resources: [api],
  });
});
