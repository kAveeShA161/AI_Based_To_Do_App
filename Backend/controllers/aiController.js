import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const generatePlan = async (req, res) => {
    try {
        const { goal } = req.body;

        if (!goal?.trim()) {
            return res.json({ success: false, message: "Goal is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.json({ success: false, message: "GEMINI_API_KEY is missing" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `
Break this goal into clear, short actionable steps.

Goal: ${goal.trim()}

Return valid JSON only in this exact shape:
["Step 1", "Step 2"]

Rules:
- Return only a JSON array of strings
- No markdown
- No headings
- No explanations
- Max 6 steps
- Each step should be short
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const parsed = JSON.parse(text);
        const steps = Array.isArray(parsed)
            ? parsed
                .map((step) => String(step).trim())
                .filter(Boolean)
                .slice(0, 6)
            : [];

        if (!steps.length) {
            return res.json({ success: false, message: "AI returned an empty plan" });
        }

        return res.json({
            success: true,
            steps,
        });
    } catch (error) {
        console.error("Gemini Error:", error);

        return res.json({
            success: false,
            message: error?.message || "AI failed",
        });
    }
};
