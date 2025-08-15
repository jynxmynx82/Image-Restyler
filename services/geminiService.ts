import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses a multimodal model to describe an image.
 * @param base64Image The base64 encoded image string.
 * @param mimeType The MIME type of the image.
 * @returns A text description of the image.
 */
async function describeImage(base64Image: string, mimeType: string): Promise<string> {
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };
  const textPart = {
    text: "Describe this image in a concise but detailed paragraph, focusing on the main subject, composition, and background. This description will be used to recreate the image.",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error describing image:", error);
    throw new Error("Failed to analyze the image. Please try again.");
  }
}

/**
 * Generates a new image using a text-to-image model based on a description and style prompts.
 * @param description The detailed description of the image to create.
 * @param filterName The name of the style filter.
 * @param filterPrompt The stylistic prompt for the new image.
 * @param userTwist Additional user-provided modifications.
 * @param aspectRatio The desired aspect ratio for the generated image (e.g., '1:1', '16:9').
 * @returns A base64 encoded string of the generated JPEG image.
 */
async function generateStyledImage(description: string, filterName: string, filterPrompt: string, userTwist: string, aspectRatio: string): Promise<string> {
  // A more forceful prompt structure that puts the stylistic command first.
  const fullPrompt = `${filterPrompt}. The image to transform is described as: ${description}. ${userTwist ? `Further instructions: ${userTwist}` : ''}`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    } else {
        throw new Error("Image generation failed to return an image. The AI may have refused the prompt.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate the new image. The prompt may have been rejected. Try a different image or twist.");
  }
}

/**
 * Orchestrates the two-step process of describing and then generating an image.
 * @param base64Image The base64 encoded image string.
 * @param mimeType The MIME type of the image.
 * @param filterName The name of the style filter.
 * @param filterPrompt The stylistic prompt for the new image.
 * @param userTwist Additional user-provided modifications.
 * @param aspectRatio The desired aspect ratio for the final image.
 * @param onProgress A callback to update the UI with progress messages.
 * @returns A base64 encoded string of the final generated image.
 */
export async function restyleImage(
  base64Image: string,
  mimeType: string,
  filterName: string,
  filterPrompt: string,
  userTwist: string,
  aspectRatio: string,
  onProgress: (message: string) => void
): Promise<{ description: string, generatedImage: string }> {
    onProgress('Step 1/2: Analyzing your image...');
    const description = await describeImage(base64Image, mimeType);

    onProgress('Step 2/2: Re-imagining with new style...');
    const generatedImage = await generateStyledImage(description, filterName, filterPrompt, userTwist, aspectRatio);
    
    return { description, generatedImage };
}