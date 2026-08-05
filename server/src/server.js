import "dotenv/config";

import app from "./app.js";
import getEnv from "./config/env.js";

const env = getEnv();
const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
});
