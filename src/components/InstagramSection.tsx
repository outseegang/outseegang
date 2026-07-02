import { motion } from "framer-motion";
import { ArrowUpRight, Instagram } from "lucide-react";
import { useEffect, useState } from "react";

const HANDLE = (import.meta.env.VITE_INSTAGRAM_HANDLE as string | undefined)?.replace(/^@/, "") || "outseegang";
const PROFILE_URL = `https://www.instagram.com/${HANDLE}/`;

type Post = { id: string; permalink: string; media_url: string; caption?: string };

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

export function InstagramSection() {
  const [posts, setPosts] = useState<Post[]>(FALLBACK);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/instagram");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancel && Array.isArray(data?.posts) && data.posts.length > 0) {
          setPosts(data.posts.slice(0, 6));
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => { cancel = true; };
  }, []);

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
          <Instagram className="h-4 w-4" /> @{HANDLE} <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
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
              <Instagram className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}