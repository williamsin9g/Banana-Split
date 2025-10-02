import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CreativeConcept {
  name: string;
  description: string;
  rationale: string;
}

interface ReasoningStep {
  step: string;
  analysis: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productImage = formData.get('product_image') as File;
    const language = formData.get('language') as string || 'zh-tw';
    const apiKey = formData.get('api_key') as string;

    if (!productImage) {
      return NextResponse.json({ error: '沒有上傳產品圖片' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: '需要提供 API Key' }, { status: 400 });
    }

    // 使用用戶提供的 API Key
    console.log('🤖 Initializing Gemini model...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    console.log('✅ Gemini model initialized');

    // 讀取圖片數據
    const bytes = await productImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const analysisPrompt = (language === 'zh' || language === 'zh-tw') 
      ? `用繁體中文快速分析產品，提供5個創意概念，保持簡潔。

JSON格式：
{
  "reasoning_steps": [
    {"step": "產品分析", "analysis": "簡短產品描述"},
    {"step": "目標客群", "analysis": "簡短客群分析"},
    {"step": "視覺特點", "analysis": "簡短外觀特色"},
    {"step": "市場策略", "analysis": "簡短市場定位"},
    {"step": "廣告方向", "analysis": "簡短廣告重點"}
  ],
  "product_type": "產品類別",
  "creative_concepts": [
    {"name": "英雄照片", "description": "簡短說明", "rationale": "簡短理由"},
    {"name": "生活情境", "description": "簡短說明", "rationale": "簡短理由"},
    {"name": "簡約風格", "description": "簡短說明", "rationale": "簡短理由"},
    {"name": "高端品牌", "description": "簡短說明", "rationale": "簡短理由"},
    {"name": "創意表現", "description": "簡短說明", "rationale": "簡短理由"}
  ]
}`
      : `Analyze this product quickly and provide 5 creative concepts. Be concise.

JSON format:
{
  "reasoning_steps": [
    {"step": "Product Type", "analysis": "What is this product?"},
    {"step": "Visual Style", "analysis": "Key visual elements?"},
    {"step": "Target Audience", "analysis": "Who would buy this?"},
    {"step": "Creative Strategy", "analysis": "Best advertising approach?"},
    {"step": "Execution", "analysis": "How to implement?"}
  ],
  "product_type": "product category",
  "creative_concepts": [
    {"name": "Hero Shot", "description": "Clean product focus", "rationale": "Shows product clearly"},
    {"name": "Lifestyle", "description": "Product in use", "rationale": "Shows context"},
    {"name": "Minimalist", "description": "Simple background", "rationale": "Clean aesthetic"},
    {"name": "Premium", "description": "Luxury presentation", "rationale": "High-end appeal"},
    {"name": "Creative", "description": "Artistic approach", "rationale": "Memorable impact"}
  ]
}`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: productImage.type || 'image/png'
      }
    };

    console.log('🚀 Calling Gemini API...');
    
    // 加入超時處理
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout after 30 seconds')), 30000);
    });
    
    const result = await Promise.race([
      model.generateContent([analysisPrompt, imagePart]),
      timeoutPromise
    ]);
    
    const response = await result.response;
    const text = response.text();
    console.log('✅ Response text extracted, length:', text.length);

    // 解析 JSON 響應
    let parsedAnalysisData;
    let reasoningSteps: ReasoningStep[] = [];
    let creativePrompts;

    try {
      console.log('🔍 Parsing JSON response...');
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        console.log('📝 Found JSON text:', jsonText.substring(0, 200) + '...');
        parsedAnalysisData = JSON.parse(jsonText);
        reasoningSteps = parsedAnalysisData.reasoning_steps || [];
        console.log('✅ Parsed reasoning steps:', reasoningSteps.length);
        
        if (parsedAnalysisData.creative_concepts) {
          creativePrompts = parsedAnalysisData.creative_concepts.map((concept: CreativeConcept) => ({
            concept: concept.name,
            prompt: concept.description,
            rationale: concept.rationale,
            background: '專業攝影棚背景',
            include_model: false
          }));
          console.log('✅ Parsed creative concepts:', creativePrompts.length);
        }
      } else {
        console.warn('⚠️ No JSON found in response');
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
      console.log('📄 Raw response text:', text);
      creativePrompts = generateCreativePrompts();
      reasoningSteps = [];
    }

    if (!creativePrompts) {
      creativePrompts = generateCreativePrompts();
    }

    // 將圖片轉換為 base64 URL 供前端使用
    const productImageUrl = `data:${productImage.type};base64,${base64Image}`;

    console.log('📊 Final response data:', {
      reasoning_steps_count: reasoningSteps.length,
      creative_prompts_count: creativePrompts.length,
      has_product_image: !!productImageUrl
    });

    return NextResponse.json({
      success: true,
      analysis: text,
      creative_prompts: creativePrompts,
      reasoning_steps: reasoningSteps,
      product_image_url: productImageUrl
    });

  } catch (error) {
    console.error('分析產品時發生錯誤:', error);
    return NextResponse.json(
      { 
        error: '分析產品時發生錯誤',
        details: (error as Error)?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateCreativePrompts() {
  return [
    {
      concept: '英雄照片',
      prompt: '產品突出展示，配有戲劇性照明和高級質感',
      background: '漸變背景配細微紋理',
      include_model: false
    },
    {
      concept: '生活場景',
      prompt: '產品在自然使用環境中配生活元素',
      background: '符合產品用途的真實環境',
      include_model: false
    },
    {
      concept: '模特展示',
      prompt: '有吸引力的模特以吸引人的方式展示或持有產品',
      background: '專業攝影棚或生活環境',
      include_model: true
    },
    {
      concept: '極簡潔淨',
      prompt: '乾淨、極簡的構圖，專注於產品設計',
      background: '純白或細微幾何背景',
      include_model: false
    },
    {
      concept: '動態動作',
      prompt: '產品以動態、充滿活力的構圖展示，帶有運動感',
      background: '抽象動態背景配動態模糊效果',
      include_model: false
    },
    {
      concept: '奢華高級',
      prompt: '高端、奢華的呈現，配高級材料和照明',
      background: '豐富紋理、大理石或高級材料背景',
      include_model: false
    }
  ];
}
