const { GoogleGenAI } = require('@google/genai');
const XLSX = require('xlsx');

// Initialize the Gemini client
// Note: Requires GEMINI_API_KEY to be set in environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.processImageToExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    console.log(`Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

    // 1. Prepare the image for Gemini
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `Extract all tabular data from this image. 
Return ONLY a valid JSON array of objects. 
Do not include any markdown formatting like \`\`\`json. 
Each object in the array represents a row, and the keys are the column headers. 
If there are no clear headers, invent logical ones based on the data.`;

    console.log('Calling Gemini API...');
    
    // 2. Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, imagePart],
      config: {
        temperature: 0.1, // Low temperature for factual extraction
      }
    });

    const responseText = response.text;
    console.log('Gemini processing complete.');

    // 3. Parse JSON
    let extractedData;
    try {
      // Sometimes Gemini might still include markdown blocks despite instructions
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(cleanJsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse extracted data', 
        rawOutput: responseText 
      });
    }

    if (!Array.isArray(extractedData) || extractedData.length === 0) {
      return res.status(400).json({ error: 'No data extracted from image' });
    }

    // 4. Generate Excel File
    console.log('Generating Excel file...');
    const worksheet = XLSX.utils.json_to_sheet(extractedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');

    // Convert workbook to a buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 5. Send Response
    res.json({
      filename: 'extracted_data.xlsx',
      base64: excelBuffer.toString('base64')
    });

  } catch (error) {
    console.error('Error processing image:', error);
    const errorDetails = error instanceof Error ? error.message : JSON.stringify(error);
    res.status(500).json({ 
      error: 'Internal server error processing image', 
      details: errorDetails,
      name: error?.name
    });
  }
};
