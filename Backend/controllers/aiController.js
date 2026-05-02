import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generatePlan = async (req, res) => {
    try {
        const { goal } = req.body;

        if (!goal) {
            return res.json({ success: false, message: "Goal is required" });
        }

        const prompt = `
Break this goal into clear, short actionable steps:

Goal: ${goal}

Rules:
- Return only steps
- No explanations
- Max 6 steps
- Each step should be short
        `;

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const text = completion.choices[0].message.content;

        // Convert into array
        const steps = text
            .split("\n")
            .map(s => s.replace(/^\d+\.?\s*/, "").trim())
            .filter(Boolean);

        res.json({
            success: true,
            steps,
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "AI failed" });
    }
};