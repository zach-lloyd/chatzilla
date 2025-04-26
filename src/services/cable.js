import { createConsumer } from '@rails/actioncable';

// Use environment variables for flexibility
const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000/cable';
// Note: Use 'wss://' for secure connections in production

// You might need to pass cookies or tokens here depending on auth setup in connection.rb
// For cookie auth, the browser *might* handle it if CORS is right, but sometimes
// explicit credential handling is needed if direct consumer creation doesn't work.
// Passing tokens often involves appending them to the WS_URL query string, e.g.:
// const WS_URL = `ws://localhost:3000/cable?token=${yourAuthToken}`;

let consumer = null;

export const getConsumer = () => {
    if (!consumer) {
        console.log(`Creating Action Cable consumer for: ${WS_URL}`);
        consumer = createConsumer(WS_URL);
    }
    return consumer;
}

export const disconnectConsumer = () => {
  if (consumer) {
    console.log("Disconnecting Action Cable consumer");
    consumer.disconnect();
    consumer = null;
  }
}
