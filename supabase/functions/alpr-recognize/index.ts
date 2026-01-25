import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// South African license plate patterns
const SA_PLATE_PATTERNS = {
  // Standard provincial formats
  GP: /^[A-Z]{2,3}\s?\d{2,3}\s?[A-Z]{2,3}\s?GP$/i,      // Gauteng: ABC 123 GP
  WC: /^CA[A-Z]?\s?\d{3,6}$/i,                           // Western Cape: CA 123456
  KZN: /^[A-Z]{2,3}\s?\d{2,4}\s?[A-Z]{0,2}\s?N[A-Z]?$/i, // KwaZulu-Natal
  EC: /^[A-Z]{2,3}\s?\d{2,4}\s?EC$/i,                    // Eastern Cape
  FS: /^[A-Z]{2,3}\s?\d{2,4}\s?FS$/i,                    // Free State
  LP: /^[A-Z]{2,3}\s?\d{2,4}\s?L$/i,                     // Limpopo
  MP: /^[A-Z]{2,3}\s?\d{2,4}\s?MP$/i,                    // Mpumalanga
  NC: /^[A-Z]{2,3}\s?\d{2,4}\s?NC$/i,                    // Northern Cape
  NW: /^[A-Z]{2,3}\s?\d{2,4}\s?NW$/i,                    // North West
  // Generic pattern for any SA plate
  GENERIC: /^[A-Z]{2,3}\s?\d{2,6}\s?[A-Z]{0,3}\s?[A-Z]{0,2}$/i,
};

interface PlateResult {
  plate_number: string;
  confidence: number;
  province: string | null;
  is_valid_sa_format: boolean;
  bounding_box?: { x: number; y: number; width: number; height: number };
}

interface ALPRResponse {
  success: boolean;
  plates_detected: number;
  plates: PlateResult[];
  processing_time_ms: number;
  image_quality: 'poor' | 'fair' | 'good' | 'excellent';
  recommendations: string[];
}

function validateSAPlate(plate: string): { isValid: boolean; province: string | null } {
  const cleanPlate = plate.replace(/\s+/g, ' ').trim().toUpperCase();
  
  // Check each provincial pattern
  const provinces: Record<string, RegExp> = {
    'Gauteng': SA_PLATE_PATTERNS.GP,
    'Western Cape': SA_PLATE_PATTERNS.WC,
    'KwaZulu-Natal': SA_PLATE_PATTERNS.KZN,
    'Eastern Cape': SA_PLATE_PATTERNS.EC,
    'Free State': SA_PLATE_PATTERNS.FS,
    'Limpopo': SA_PLATE_PATTERNS.LP,
    'Mpumalanga': SA_PLATE_PATTERNS.MP,
    'Northern Cape': SA_PLATE_PATTERNS.NC,
    'North West': SA_PLATE_PATTERNS.NW,
  };

  for (const [province, pattern] of Object.entries(provinces)) {
    if (pattern.test(cleanPlate)) {
      return { isValid: true, province };
    }
  }

  // Check generic pattern
  if (SA_PLATE_PATTERNS.GENERIC.test(cleanPlate)) {
    return { isValid: true, province: 'Unknown' };
  }

  return { isValid: false, province: null };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user for ALPR:", userId);

    const { imageUrl, imageBase64 } = await req.json();

    if (!imageUrl && !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Either imageUrl or imageBase64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare image content for the API
    let imageContent: { type: string; image_url?: { url: string }; text?: string };
    
    if (imageBase64) {
      imageContent = {
        type: "image_url",
        image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
      };
    } else {
      imageContent = {
        type: "image_url",
        image_url: { url: imageUrl }
      };
    }

    console.log('Starting ALPR analysis...');

    // Call Lovable AI Gateway with optimized ALPR prompt
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
            content: `You are an expert Automatic License Plate Recognition (ALPR) system specialized in South African vehicle license plates.

Your ONLY task is to detect and read license plates from images. Focus exclusively on:
1. Identifying all visible license plates in the image
2. Reading the exact characters on each plate
3. Estimating confidence level (0-1) for each reading
4. Assessing image quality for plate reading

South African plate formats to recognize:
- Gauteng: ABC 123 GP (letters, numbers, GP suffix)
- Western Cape: CA 123456 (CA prefix with numbers)
- KwaZulu-Natal: ND/NP followed by numbers
- Other provinces: 2-3 letters, 2-4 numbers, province code suffix

You MUST respond with valid JSON only, no markdown. Use this exact structure:
{
  "plates": [
    {
      "plate_number": "ABC 123 GP",
      "confidence": 0.95,
      "approximate_position": "center-left"
    }
  ],
  "image_quality": "good",
  "quality_issues": ["list any issues like blur, glare, angle, distance"],
  "vehicle_count": 1
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image and extract all visible South African license plates. Return ONLY the JSON response.' },
              imageContent
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for accuracy
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI Response received, parsing...');

    // Parse the AI response
    let parsedResult;
    try {
      // Clean the response (remove markdown if present)
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      parsedResult = { plates: [], image_quality: 'unknown', quality_issues: ['Failed to parse response'] };
    }

    // Process and validate each detected plate
    const processedPlates: PlateResult[] = (parsedResult.plates || []).map((plate: any) => {
      const validation = validateSAPlate(plate.plate_number || '');
      return {
        plate_number: (plate.plate_number || '').toUpperCase().trim(),
        confidence: Math.min(1, Math.max(0, plate.confidence || 0.5)),
        province: validation.province,
        is_valid_sa_format: validation.isValid,
      };
    });

    // Build recommendations based on results
    const recommendations: string[] = [];
    if (parsedResult.quality_issues?.length > 0) {
      recommendations.push(...parsedResult.quality_issues);
    }
    if (processedPlates.length === 0) {
      recommendations.push('No plates detected. Try capturing from a closer distance or better angle.');
    }
    if (processedPlates.some(p => p.confidence < 0.7)) {
      recommendations.push('Low confidence readings detected. Verify manually.');
    }

    const processingTime = Date.now() - startTime;

    const result: ALPRResponse = {
      success: true,
      plates_detected: processedPlates.length,
      plates: processedPlates,
      processing_time_ms: processingTime,
      image_quality: parsedResult.image_quality || 'unknown',
      recommendations,
    };

    console.log(`ALPR completed in ${processingTime}ms, found ${processedPlates.length} plates`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ALPR error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        plates_detected: 0,
        plates: [],
        processing_time_ms: Date.now() - startTime,
        image_quality: 'unknown',
        recommendations: ['An error occurred during processing']
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
