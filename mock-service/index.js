/** Simple mock service that logs messages periodically */

let counter = 0;

function logMessage() {
  counter++;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Mock Service Log #${counter}: Service is running...`);
}

// Log a startup message
console.log('=================================');
console.log('Mock Service Started');
console.log('=================================');

// Log every 5 seconds
setInterval(logMessage, 5000);

// Keep the process running
process.on('SIGTERM', () => {
  console.log('Mock service shutting down...');
  process.exit(0);
});

