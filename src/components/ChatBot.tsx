import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import outbot from "@/assets/outbot.png";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const transportRef = useRef(new DefaultChatTransport({ api: "/api/chat" }));

  const { messages, sendMessage, status, error } = useChat({
    id: "outbot-session",
    transport: transportRef.current,
  });

  const handleSubmit = (msg: PromptInputMessage) => {
    const text = msg.text?.trim();
    if (!text) return;
    void sendMessage({ text });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar chat" : "Abrir chat com OutBot"}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xl ring-1 ring-border hover:scale-105 transition-transform"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-[60] w-[calc(100vw-2.5rem)] max-w-md h-[min(70vh,600px)] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-4 py-3">
              <img src={outbot} alt="OutBot" width={36} height={36} className="h-9 w-9 rounded-full bg-white object-contain" />
              <div className="flex-1">
                <p className="font-bold text-sm leading-none">OutBot</p>
                <p className="text-xs text-muted-foreground mt-1">Assistente Outsee · online</p>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 min-h-0">
              <Conversation className="h-full">
                <ConversationContent>
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center text-center gap-3 py-8 px-4">
                      <img src={outbot} alt="OutBot" width={64} height={64} className="h-16 w-16 rounded-xl bg-white p-1" />
                      <p className="text-sm font-semibold">Olá! Sou a OutBot.</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Posso te ajudar com produtos, pedidos, pagamento, entrega e dúvidas do site. Como posso ajudar hoje?
                      </p>
                    </div>
                  )}

                  {messages.map((message) => {
                    const text = message.parts
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("");
                    if (message.role === "user") {
                      return (
                        <Message from="user" key={message.id}>
                          <MessageContent className="bg-primary text-primary-foreground">
                            {text}
                          </MessageContent>
                        </Message>
                      );
                    }
                    return (
                      <Message from="assistant" key={message.id}>
                        <div className="text-sm leading-relaxed">
                          <MessageResponse>{text}</MessageResponse>
                        </div>
                      </Message>
                    );
                  })}

                  {status === "submitted" && (
                    <Message from="assistant">
                      <Shimmer className="text-sm">Pensando...</Shimmer>
                    </Message>
                  )}

                  {error && (
                    <p className="text-xs text-destructive px-2">
                      Ops, não consegui responder agora. Tente novamente.
                    </p>
                  )}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            </div>

            {/* Composer */}
            <div className="border-t border-border p-3">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputTextarea placeholder="Pergunte sobre produtos, pedidos, entrega..." />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} disabled={isLoading} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}