import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/perguntar", async (req, res) => {

    try {

        const { conteudo } = req.body;

        const resposta = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: conteudo
        });

        res.json({
            resposta: resposta.text
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro no servidor"
        });

    }

});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});