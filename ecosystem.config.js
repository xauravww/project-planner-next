module.exports = {
  apps: [
    {
      name: "nebulaplan",
      cwd: "/root/project-planner-next",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "800M",
    },
    {
      name: "nebulaplan-embeddings",
      cwd: "/root/project-planner-next/embedding-service",
      script: "index.js",
      max_memory_restart: "800M",
    },
  ],
};
