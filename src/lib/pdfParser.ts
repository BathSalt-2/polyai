export interface PDFParseResult {
  title: string
  authors: string[]
  abstract: string
  content: string
  extractedText: string
  metadata: {
    pageCount?: number
    extractionMethod: 'ocr' | 'text-layer' | 'llm-extraction'
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        
        let text = ''
        for (let i = 0; i < uint8Array.length; i++) {
          if (uint8Array[i] === 0x28 && uint8Array[i-1] === 0x20) {
            let j = i + 1
            let inParentheses = true
            while (j < uint8Array.length && inParentheses) {
              if (uint8Array[j] === 0x29 && uint8Array[j-1] !== 0x5C) {
                inParentheses = false
              } else if (uint8Array[j] >= 0x20 && uint8Array[j] <= 0x7E) {
                text += String.fromCharCode(uint8Array[j])
              } else if (uint8Array[j] === 0x0A || uint8Array[j] === 0x0D) {
                text += '\n'
              }
              j++
            }
            text += ' '
          }
        }
        
        if (text.trim().length < 100) {
          text = await extractTextSimple(uint8Array)
        }
        
        resolve(text.trim())
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'))
    reader.readAsArrayBuffer(file)
  })
}

function extractTextSimple(data: Uint8Array): string {
  const decoder = new TextDecoder('utf-8', { fatal: false })
  let text = decoder.decode(data)
  
  text = text.replace(/[^\x20-\x7E\n\r]/g, ' ')
  
  text = text.replace(/\s+/g, ' ')
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  return sentences.join('. ').trim()
}

export async function parsePDFStructure(extractedText: string, fileName: string): Promise<PDFParseResult> {
  try {
    const prompt = (window as any).spark.llmPrompt`You are a research paper parser. Extract structured information from this academic paper.

Extracted Text (may contain some parsing artifacts):
${extractedText.substring(0, 6000)}

Please analyze this text and extract:
1. Paper Title (be precise)
2. Authors (comma-separated list)
3. Abstract (the complete abstract section)
4. Main Content (cleaned and formatted)

Return your response as a valid JSON object with this exact structure:
{
  "title": "Paper title here",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Complete abstract text...",
  "content": "Main paper content..."
}

If you cannot find certain fields, use reasonable defaults:
- title: Use the filename or "Untitled Paper"
- authors: Use ["Unknown"]
- abstract: Use the first paragraph
- content: Use the full text

Ensure the JSON is valid and parseable.`

    const response = await (window as any).spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    
    return {
      title: parsed.title || fileName.replace('.pdf', ''),
      authors: Array.isArray(parsed.authors) ? parsed.authors : ['Unknown'],
      abstract: parsed.abstract || extractedText.substring(0, 500),
      content: parsed.content || extractedText,
      extractedText,
      metadata: {
        extractionMethod: 'llm-extraction'
      }
    }
  } catch (error) {
    console.error('Error parsing PDF structure:', error)
    
    const lines = extractedText.split('\n').filter(l => l.trim())
    const title = lines[0]?.substring(0, 200) || fileName.replace('.pdf', '')
    
    const abstractIndex = extractedText.toLowerCase().indexOf('abstract')
    const abstract = abstractIndex !== -1 
      ? extractedText.substring(abstractIndex, abstractIndex + 500)
      : extractedText.substring(0, 500)
    
    return {
      title,
      authors: ['Unknown'],
      abstract,
      content: extractedText,
      extractedText,
      metadata: {
        extractionMethod: 'text-layer'
      }
    }
  }
}

export async function processPDFFile(file: File): Promise<PDFParseResult> {
  const extractedText = await extractTextFromPDF(file)
  
  if (extractedText.length < 100) {
    throw new Error('Could not extract sufficient text from PDF. The file may be image-based or corrupted.')
  }
  
  const result = await parsePDFStructure(extractedText, file.name)
  
  return result
}
