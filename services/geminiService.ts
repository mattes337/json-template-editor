import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY environment variable is missing");
  return new GoogleGenAI({ apiKey });
};

export const generateTemplate = async (
  instruction: string, 
  dataContext: Record<string, any>
): Promise<string> => {
  const ai = getClient();
  const model = "gemini-2.5-flash"; // Good balance of speed and reasoning for code tasks

  const prompt = `
    You are an expert JSON Template Engineer using Handlebars.
    
    My Data Context (JSON schema structure):
    ${JSON.stringify(dataContext, null, 2)}

    User Instruction:
    "${instruction}"

    Task:
    Generate a JSON template using Handlebars syntax that fulfills the instruction based on the data context.
    
    Rules:
    1. Return ONLY the JSON template code. Do not include markdown formatting (like \`\`\`json).
    2. Use the {{#js}} ... {{/js}} helper for any logic requiring JavaScript expressions (e.g., string splitting, math, comparisons).
    3. Ensure the output is valid JSON (except for the Handlebars tags).
    4. Format the output with 2-space indentation.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for deterministic code generation
      }
    });

    let text = response.text || "";
    // Clean up if the model ignores the "no markdown" rule
    text = text.replace(/^```json\s*/, '').replace(/^```handlebars\s*/, '').replace(/```$/, '');
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
