import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languageNames: Record<string, string> = {
  'en-ZA': 'English',
  'af-ZA': 'Afrikaans',
  'zu-ZA': 'isiZulu',
  'xh-ZA': 'isiXhosa',
  'nso-ZA': 'Sepedi',
  'tn-ZA': 'Setswana',
  'st-ZA': 'Sesotho',
  'ts-ZA': 'Xitsonga',
  'ss-ZA': 'siSwati',
  've-ZA': 'Tshivenda',
  'nr-ZA': 'isiNdebele',
  'fr-FR': 'French',
  'de-DE': 'German',
  'pt-PT': 'Portuguese',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage, detectLanguage } = await req.json();
    
    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let detectedLanguage = sourceLanguage;
    let detectedLanguageName = languageNames[sourceLanguage] || sourceLanguage || 'unknown';

    // Auto-detect language if requested
    if (detectLanguage) {
      console.log('Auto-detecting language for:', text);
      
      const detectResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are a language detection expert. Identify the language of the given text.
Respond with ONLY the language code from this list:
en-ZA (English), af-ZA (Afrikaans), zu-ZA (isiZulu), xh-ZA (isiXhosa), nso-ZA (Sepedi), tn-ZA (Setswana), st-ZA (Sesotho), ts-ZA (Xitsonga), ss-ZA (siSwati), ve-ZA (Tshivenda), nr-ZA (isiNdebele), fr-FR (French), de-DE (German), pt-PT (Portuguese)

Only respond with the language code, nothing else.`
            },
            {
              role: 'user',
              content: text
            }
          ],
        }),
      });

      if (detectResponse.ok) {
        const detectData = await detectResponse.json();
        const detected = detectData.choices?.[0]?.message?.content?.trim();
        if (detected && languageNames[detected]) {
          detectedLanguage = detected;
          detectedLanguageName = languageNames[detected];
          console.log('Detected language:', detectedLanguageName);
        }
      }
    }

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Translate the text
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the given text from ${detectedLanguageName} to ${targetLangName}. 
Only respond with the translated text, nothing else. 
Preserve the meaning and tone of the original message.
If the text is already in the target language, return it as-is.
Keep it natural and conversational.`
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Translation failed');
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation received');
    }

    console.log(`Translated from ${detectedLanguageName} to ${targetLangName}: "${text}" -> "${translatedText}"`);

    return new Response(JSON.stringify({ 
      translatedText,
      sourceLanguage: detectedLanguageName,
      detectedLanguageCode: detectedLanguage,
      targetLanguage: targetLangName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
