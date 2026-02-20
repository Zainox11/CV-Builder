export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { jobTitle, experience } = req.body;

    if (!jobTitle) {
        return res.status(400).json({ error: 'Job title is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing in Vercel settings' });
    }

    const promptText = `Write a highly professional and ATS-friendly CV summary for a ${jobTitle} with ${experience || 'some'} experience. Keep it 3 to 4 sentences long. Do not use first-person words like "I", "me", or "my". Focus on strengths, core skills, and career goals. Return ONLY the summary text, no extra conversation or formatting.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to connect to Gemini API');
        }

        const generatedSummary = data.candidates[0].content.parts[0].text;
        res.status(200).json({ summary: generatedSummary.trim() });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong while generating summary.' });
    }
}