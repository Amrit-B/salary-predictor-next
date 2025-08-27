export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { jobRole } = request.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!jobRole) {
        return response.status(400).json({ message: 'Job role is required.' });
    }

    if (!apiKey) {
      return response.status(500).json({ message: 'API key is not configured.' });
    }

    const prompt = `
      For the job title "${jobRole}", provide a realistic estimated starting salary (base) 
      and an average annual salary increase (slope) in the United States.
      
      Respond ONLY with a valid JSON object in the format:
      {"base": NUMBER, "slope": NUMBER}
      
      Do not include any other text, explanation, or markdown formatting.
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1, 
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    };

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const result = await geminiResponse.json();
    const rawText = result.candidates[0].content.parts[0].text;

    const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const salaryModel = JSON.parse(jsonText);

    return response.status(200).json(salaryModel);

  } catch (error) {
    console.error("Error in get-salary-model API:", error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
}
