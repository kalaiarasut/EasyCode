import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const userId = token?._id || token?.id;

        const serverHostedKeys: Record<string, boolean> = {
            gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5),
            groq: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 5),
            openai: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 5),
            anthropic: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 5),
            deepseek: Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim().length > 5),
            kimi: Boolean(process.env.MOONSHOT_API_KEY && process.env.MOONSHOT_API_KEY.trim().length > 5),
            qwen: Boolean(process.env.DASHSCOPE_API_KEY && process.env.DASHSCOPE_API_KEY.trim().length > 5),
            zhipu: Boolean(process.env.ZHIPU_API_KEY && process.env.ZHIPU_API_KEY.trim().length > 5),
            yi: Boolean(process.env.YI_API_KEY && process.env.YI_API_KEY.trim().length > 5),
            baichuan: Boolean(process.env.BAICHUAN_API_KEY && process.env.BAICHUAN_API_KEY.trim().length > 5),
            siliconflow: Boolean(process.env.SILICONFLOW_API_KEY && process.env.SILICONFLOW_API_KEY.trim().length > 5),
            mistral: Boolean(process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY.trim().length > 5),
            grok: Boolean(process.env.XAI_API_KEY && process.env.XAI_API_KEY.trim().length > 5),
            cohere: Boolean(process.env.COHERE_API_KEY && process.env.COHERE_API_KEY.trim().length > 5),
            perplexity: Boolean(process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_API_KEY.trim().length > 5),
            openrouter: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 5),
            cerebras: Boolean(process.env.CEREBRAS_API_KEY && process.env.CEREBRAS_API_KEY.trim().length > 5),
            sambanova: Boolean(process.env.SAMBANOVA_API_KEY && process.env.SAMBANOVA_API_KEY.trim().length > 5),
            together: Boolean(process.env.TOGETHER_API_KEY && process.env.TOGETHER_API_KEY.trim().length > 5),
            fireworks: Boolean(process.env.FIREWORKS_API_KEY && process.env.FIREWORKS_API_KEY.trim().length > 5),
            deepinfra: Boolean(process.env.DEEPINFRA_API_KEY && process.env.DEEPINFRA_API_KEY.trim().length > 5),
            hyperbolic: Boolean(process.env.HYPERBOLIC_API_KEY && process.env.HYPERBOLIC_API_KEY.trim().length > 5),
            novita: Boolean(process.env.NOVITA_API_KEY && process.env.NOVITA_API_KEY.trim().length > 5),
            huggingface: Boolean(
                (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.trim().length > 5) ||
                (process.env.HF_TOKEN && process.env.HF_TOKEN.trim().length > 5)
            ),
            cloudflare: Boolean(
                (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_API_TOKEN.trim().length > 5) &&
                (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_ACCOUNT_ID.trim().length > 5)
            ),
            stability: Boolean(process.env.STABILITY_API_KEY && process.env.STABILITY_API_KEY.trim().length > 5),
            replicate: Boolean(process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_API_TOKEN.trim().length > 5),
            fal: Boolean(process.env.FAL_KEY && process.env.FAL_KEY.trim().length > 5),
            luma: Boolean(process.env.LUMA_API_KEY && process.env.LUMA_API_KEY.trim().length > 5),
            kling: Boolean(process.env.KLING_API_KEY && process.env.KLING_API_KEY.trim().length > 5),
            pollinations: Boolean(
                (process.env.POLLINATIONS_API_KEY && process.env.POLLINATIONS_API_KEY.trim().length > 5) ||
                (process.env.POLLINATIONS_TOKEN && process.env.POLLINATIONS_TOKEN.trim().length > 5)
            ),
        };

        if (!userId) {
            return NextResponse.json({
                success: true,
                keys: {},
                serverHostedKeys,
            }, { status: 200 });
        }

        const { data, error } = await supabase
            .from('user_api_keys')
            .select('keys')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.warn("Supabase fetch keys error:", error);
            return NextResponse.json({ success: true, keys: {}, serverHostedKeys }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            keys: data?.keys || {},
            serverHostedKeys,
        }, { status: 200 });
    } catch (err: any) {
        console.error("GET /api/user/keys error:", err);
        return NextResponse.json({ success: true, keys: {}, serverHostedKeys: {} }, { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const userId = token?._id || token?.id;
        const { keys } = await req.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User session required to save keys to Supabase"
            }, { status: 401 });
        }

        const { error } = await supabase
            .from('user_api_keys')
            .upsert({
                user_id: userId,
                keys: keys || {},
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error("Supabase upsert error:", error);
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "API keys securely stored in Supabase"
        }, { status: 200 });
    } catch (err: any) {
        console.error("POST /api/user/keys error:", err);
        return NextResponse.json({
            success: false,
            message: err.message || "Failed to save keys"
        }, { status: 500 });
    }
}
