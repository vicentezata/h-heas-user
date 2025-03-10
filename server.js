const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Serve static files (like monitor.html) from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("✅ WebSocket connected!");

    ws.on("message", (message) => {
        console.log("🚨 Emergency Signal:", message);

        try {
            const data = JSON.parse(message);

            // Broadcast alert to all monitoring clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(message);
                }
            });

            // ✅ Send automatic response back to the sender
            if (ws.readyState === WebSocket.OPEN) {
                console.log(`🔁 Sending response to ${data.sender}`);
                ws.send(JSON.stringify({
                    sender: "Monitoring Base",
                    response: `🚔 Help is on the way, ${data.sender}! Stay safe.`
                }));
            }

        } catch (error) {
            console.error("❌ Error parsing message:", error);
        }
    });

    ws.on("close", () => console.log("❌ WebSocket disconnected."));
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));