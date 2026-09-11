import http from 'http';
import app from './app';
import { initHardwareSocket } from './modules/hardwareSocket';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io real-time hardware communication layer
initHardwareSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Smriti-Setu Backend API Server listening on http://localhost:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   Socket.io Gateway: Active`);
  console.log(`   Region: Northeast India Ecosystem (NER)`);
});

