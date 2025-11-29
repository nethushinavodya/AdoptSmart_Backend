import axios from "axios"
import { Request, Response } from "express"

export const genrateContent = async (req: Request, res: Response) => {
    try {
        const { text, maxToken } = req.body

        if (!text) {
            return res.status(400).json({ message: "Text is required" })
        }

        const aiResponse = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                contents: [
                    {
                        parts: [
                            {
                                text: text
                            }
                        ]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: maxToken || 150
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": "AIzaSyB5GTmJ0NIrmJvW2Xec4zM5c7DoToEn2QI"
                }
            }
        )

        const genratedContent =
            aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No data"

        res.status(200).json({ data: genratedContent })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "AI generation failed" })
    }
}
