export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { experience, salary, jobRole } = request.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return response.status(500).json({ message: 'API key is not configured.' });
    }

    let prompt;

    if (jobRole) {
      prompt = `You are a helpful and insightful career advisor. A person with ${experience} years of experience, a predicted salary of ${salary}, is specifically interested in the role of a "${jobRole}". 
      
      Based on current industry trends for this role, provide some brief, actionable career insights. Include the following sections with markdown formatting:

      1.  **Current Trend Analysis:** Briefly describe the current demand or trend for a "${jobRole}". Is it growing? What's the outlook?
      2.  **Key Skills to Develop:** List 2-3 essential skills they should focus on right now to excel as a "${jobRole}".
      3.  **Potential Next Steps:** Suggest one or two potential career advancements or specializations from this role.
      
      Keep the tone positive and the response concise.`;
    } else {
      prompt = `You are a helpful and encouraging career advisor. A person with ${experience} years of professional experience has a predicted salary of ${salary}. Based on this, provide some brief career insights. Include the following sections with markdown formatting:
    
      1.  **Possible Job Titles:** Suggest 2-3 typical job titles for this experience level.
      2.  **Key Skills to Develop:** List 2-3 important skills they should focus on for career growth.
      3.  **Potential Next Steps:** Suggest one or two potential next steps in their career path.

      Keep the tone positive and the response concise.`;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return response.status(geminiResponse.status).json({ message: `Gemini API error: ${errorText}` });
    }

    const result = await geminiResponse.json();
    const insightsText = result.candidates[0].content.parts[0].text;

    return response.status(200).json({ insights: insightsText });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
}