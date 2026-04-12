module.exports = {
  apps: [
    {
      name: "payroll-backend",
      script: "server.js",
      cwd: "D:\\gemini-bot-payroll-system\\backend",
      interpreter: "C:\\Program Files\\nodejs\\node.exe",
      watch: false,
      env: { 
        NODE_ENV: "development", 
        PORT: 3000 
      }
    },
    {
      name: "payroll-frontend",
      script: "node_modules/vite/bin/vite.js",
      cwd: "D:\\gemini-bot-payroll-system\\frontend",
      watch: false,
      interpreter: "C:\\Program Files\\nodejs\\node.exe",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
