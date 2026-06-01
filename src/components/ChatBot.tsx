import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X, Headset, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffSent, setHandoffSent] = useState(false);
  const transportRef = useRef(new DefaultChatTransport({ api: "/api/chat" }));
  const { user } = useAuth();

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

  const transcript = messages.map((m) => ({
    role: m.role,
    text: m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
  }));

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
              <button
                onClick={() => setHandoffOpen(true)}
                title="Falar com atendente humano"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 hover:opacity-90 transition"
              >
                <Headset className="h-3.5 w-3.5" /> Atendente
              </button>
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

            <AnimatePresence>
              {handoffOpen && (
                <HandoffForm
                  defaultEmail={user?.email ?? ""}
                  defaultName={(user?.user_metadata?.full_name as string) ?? ""}
                  transcript={transcript}
                  sent={handoffSent}
                  onClose={() => { setHandoffOpen(false); setTimeout(() => setHandoffSent(false), 400); }}
                  onSent={() => { setHandoffSent(true); toast.success("Pedido enviado! Um atendente vai responder em breve."); }}
                  userId={user?.id ?? null}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HandoffForm({
  defaultEmail, defaultName, transcript, sent, onClose, onSent, userId,
}: {
  defaultEmail: string;
  defaultName: string;
  transcript: Array<{ role: string; text: string }>;
  sent: boolean;
  onClose: () => void;
  onSent: () => void;
  userId: string | null;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() && transcript.length === 0) {
      toast.error("Conte rapidamente como podemos ajudar.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: userId,
      user_email: email.trim() || null,
      user_name: name.trim() || null,
      subject: subject.trim() || null,
      transcript: transcript as unknown as never,
      status: "open",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não conseguimos enviar agora. Tente de novo.");
      return;
    }
    onSent();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Headset className="h-4 w-4 text-accent" />
          <p className="font-bold text-sm">Falar com atendente</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary"><X className="h-4 w-4" /></button>
      </div>

      {sent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
          <div className="h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Check className="h-7 w-7" />
          </div>
          <p className="font-bold">Recebemos seu pedido!</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Um atendente Outsee vai assumir essa conversa e responder por email em breve.
          </p>
          <button onClick={onClose} className="mt-2 rounded-full bg-accent text-accent-foreground font-bold text-xs px-4 py-2">
            Voltar ao chat
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
          <p className="text-xs text-muted-foreground">
            Vamos repassar essa conversa para um atendente humano. Deixe seu contato para receber a resposta.
          </p>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">Email *</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">Como podemos ajudar?</span>
            <textarea rows={3} value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex.: meu pedido #123 não chegou…"
              className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>
          <div className="text-[11px] text-muted-foreground bg-secondary/40 rounded-lg p-2">
            {transcript.length > 0
              ? `A conversa atual (${transcript.length} mensagens) será enviada junto.`
              : "Nenhuma conversa anterior será enviada."}
          </div>
          <button disabled={submitting}
            className="w-full rounded-lg bg-accent text-accent-foreground font-bold py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50">
            {submitting ? "Enviando…" : "Enviar para atendente"}
          </button>
        </form>
      )}
    </motion.div>
  );
}