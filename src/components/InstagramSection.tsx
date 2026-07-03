import { motion } from "framer-motion";
import { ArrowUpRight, Loader2, AlertCircle } from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
import { useEffect, useState } from "react";

const HANDLE = (import.meta.env.VITE_INSTAGRAM_HANDLE as string | undefined)?.replace(/^@/, "") || "outsee_gang";
const PROFILE_URL = `https://www.instagram.com/${HANDLE}/`;

type Post = { id: string; permalink: string; media_url: string; caption?: string };
type FeedResponse = {
  posts: Post[];
  paging?: { next?: string | null; cursor?: string | null };
  reason?: string;
  cached?: boolean;
  stale?: boolean;
};

// Fallback lifestyle photos (used when Instagram Graph API isn't wired).
const FALLBACK: Post[] = [
  "photo-1539109136881-3be0616acf4b",
  "photo-1552374196-1ab2a1c593e8",
  "photo-1492447166138-50c3889fccb1",
  "photo-1488161628813-04466f872be2",
  "photo-1503342217505-b0a15ec3261c",
  "photo-1519408469771-2586093c3f14",
].map((id) => ({
  id,
  permalink: PROFILE_URL,
  media_url: `https://images.unsplash.com/${id}?w=600&q=80`,
}));

const REASON_MESSAGE: Record<string, string> = {
  no_token:
    "Feed do Instagram ainda não conectado. Mostrando imagens do lookbook — siga @" +
    HANDLE +
    " para acompanhar em tempo real.",
  rate_limited:
    "O Instagram limitou temporariamente as consultas. Estamos exibindo o lookbook enquanto isso.",
  unauthorized:
    "O token do Instagram expirou. Renove-o para retomar o feed ao vivo.",
  network_error:
    "Não conseguimos falar com o Instagram agora. Tente novamente em instantes.",
};

function messageFor(reason?: string) {
  if (!reason) return null;
  return REASON_MESSAGE[reason] ?? "Não foi possível carregar o feed do Instagram agora.";
}

export function InstagramSection() {
  const [posts, setPosts] = useState<Post[]>(FALLBACK);
  const [isFallback, setIsFallback] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  async function loadPage(after?: string | null) {
    const params = new URLSearchParams({ limit: "6" });
    if (after) params.set("after", after);
    const res = await fetch(`/api/instagram?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as FeedResponse;
  }

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await loadPage();
        if (cancel) return;
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
          setIsFallback(false);
          setCursor(data.paging?.cursor ?? null);
          if (data.stale) {
            setNotice("Mostrando o último feed conhecido enquanto o Instagram se recupera.");
          }
          console.info("[InstagramSection] feed carregado", {
            count: data.posts.length,
            cached: data.cached,
            stale: data.stale,
          });
        } else {
          setNotice(messageFor(data.reason) ?? messageFor("no_token"));
          console.warn("[InstagramSection] usando fallback:", data.reason ?? "sem posts");
        }
      } catch (err) {
        if (cancel) return;
        console.error("[InstagramSection] falha ao buscar /api/instagram:", err);
        setNotice(messageFor("network_error"));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function handleLoadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await loadPage(cursor);
      if (data.posts?.length) {
        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.paging?.cursor ?? null);
      } else {
        setCursor(null);
      }
    } catch (err) {
      console.error("[InstagramSection] falha ao paginar:", err);
      setNotice(messageFor("network_error"));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— Comunidade</p>
          <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">Outsee na rua</h2>
        </div>
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-white/40 hover:border-white pb-1"
        >
          <InstagramIcon className="h-4 w-4" /> @{HANDLE} <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
      {(notice || (isFallback && !loading)) && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{notice ?? messageFor("no_token")}</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {posts.map((p, i) => (
          <a
            key={p.id}
            href={p.permalink || PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden bg-zinc-900 rounded-xl"
            aria-label={`Abrir Instagram @${HANDLE}`}
          >
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              src={p.media_url}
              alt={p.caption ?? `Comunidade Outsee ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 grid place-items-center">
              <InstagramIcon className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
      {!isFallback && cursor && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loadingMore ? "Carregando" : "Ver mais"}
          </button>
        </div>
      )}
    </section>
  );
}