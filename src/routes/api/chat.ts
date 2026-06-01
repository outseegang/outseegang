import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Você é a OutBot, assistente virtual oficial da Outsee — uma marca de streetwear (moletons e tênis). Fale sempre em português brasileiro, com tom amigável, direto e cheio de atitude urbana, mas sempre prestativa.

Suas responsabilidades:
- Ajudar usuários a navegar pelo site: /catalogo (catálogo), /carrinho, /checkout, /perfil (login/cadastro), /pedidos (acompanhar pedidos).
- Explicar como funciona a compra: escolher cor/tamanho, adicionar ao carrinho, preencher CEP (preenche bairro automaticamente), finalizar com PIX ou cartão (parcelamento em até 12x; acima de 3x tem juros de 2,99% a.m.).
- Tirar dúvidas sobre tamanhos, cores, materiais, prazos de entrega e trocas.
- Acompanhar status de pedido: peça o número do pedido e oriente o usuário a verificar em /pedidos.
- Resolver problemas comuns: dificuldade de login, confirmação de email, problemas no checkout, CEP que não preenche endereço.
- Se não souber algo específico do pedido do cliente, oriente a contatar o suporte via WhatsApp.

Nunca invente preços, promoções ou prazos exatos. Seja breve (máx. 3-4 frases por resposta, exceto quando o usuário pedir detalhes). Use markdown leve quando ajudar a clareza (listas curtas, **negrito** em pontos-chave).`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});