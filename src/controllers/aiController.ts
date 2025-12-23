import axios from "axios"
import { Request, Response } from "express"

export const generateContent = async (req: Request, res: Response) => {
    try {
        const { text } = req.body

        if (!text) {
            return res.status(400).json({ message: "Text is required" })
        }

        const aiResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: text }],
                max_tokens: 150,
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        )

        return res.status(200).json({
            data: aiResponse.data.choices[0].message.content
        })

    } catch (error: any) {
        console.error("Groq Error:", error.response?.data || error.message)
        return res.status(500).json({ message: "AI generation failed" })
    }
}
