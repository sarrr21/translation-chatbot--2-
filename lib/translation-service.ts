/**
 * Translation service
 * 
 * Integration with the translation API at https://translater-gzbh.onrender.com
 */

// Translation function using the actual API
export async function translateText(text: string, targetLanguage: "Dagbani" | "English"): Promise<string> {
  try {
    // Determine the language code based on the target language
    // If target is English, source is Dagbani (dag)
    // If target is Dagbani, source is English (en)
    const languageCode = targetLanguage === "English" ? "dag" : "en"
    
    // Encode the text for URL
    const encodedText = encodeURIComponent(text)
    
    // Make the API call
    const response = await fetch(
      `https://translater-gzbh.onrender.com/language?sentence=${encodedText}&language=${languageCode}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status !== "success") {
      throw new Error('Translation failed: API returned non-success status')
    }
    
    return data.translated_sentence
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}
