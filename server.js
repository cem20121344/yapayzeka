require("dotenv").config();

const http = require("http");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/chat") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                const data = JSON.parse(body);
                const message = data.message;

                if (!message) {
                    res.writeHead(400, {
                        "Content-Type": "application/json; charset=utf-8"
                    });

                    res.end(JSON.stringify({
                        error: "Mesaj boş."
                    }));

                    return;
                }

               let response;

for (let i = 0; i < 3; i++) {
    try {
        response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: message
        });

        break;
    } catch (error) {
        if (error.status === 503 && i < 2) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            throw error;
        }
    }
}
                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    answer: response.text
                }));

            } catch (error) {

                console.error("Gemini hatası:", error);

                res.writeHead(500, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    error: "Yapay zeka cevap verirken hata oluştu."
                }));
            }
        });

        return;
    }

    res.writeHead(404);
    res.end("Bulunamadı.");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`CemGPT sunucusu ${PORT} portunda çalışıyor!`);
});