import { createFileRoute } from "@tanstack/react-router";

// Instagram Graph API — Basic Display.
// Set INSTAGRAM_ACCESS_TOKEN (long-lived user token) in the environment to enable a real feed.
// Without it, the endpoint returns { posts: [], reason: "no_token" } so the UI can show a
// friendly fallback. Responses are cached in-memory per page cursor (TTL) to soften rate
// limits from Meta's Graph API (currently 200 calls/hour/user).

type IGItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
};

type Post = {
  id: string;
  permalink: string;
  media_url: string;
  caption?: string;
};

type CacheEntry = {
  expiresAt: number;
  payload: {
    posts: Post[];
    paging?: { next?: string | null; cursor?: string | null };
  };
};

// In-memory cache scoped per worker instance. Not a shared cache, but enough
// to absorb bursts and keep us well under the IG rate limits.
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const ERROR_TTL_MS = 60 * 1000; // 1 minute — avoid hammering after failures

function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1800",
      ...(init?.headers ?? {}),
    },
  });
}

export const Route = createFileRoute("/api/instagram")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = process.env.INSTAGRAM_ACCESS_TOKEN;
        const url = new URL(request.url);
        const limitRaw = Number(url.searchParams.get("limit") ?? "12");
        const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 12, 1), 24);
        const after = url.searchParams.get("after") ?? "";

        if (!token) {
          console.warn("[api/instagram] INSTAGRAM_ACCESS_TOKEN não configurado — retornando fallback vazio.");
          return json({ posts: [], reason: "no_token" });
        }

        const cacheKey = `${limit}:${after}`;
        const cached = CACHE.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
          return json({ ...cached.payload, cached: true });
        }

        try {
          const igUrl = new URL("https://graph.instagram.com/me/media");
          igUrl.searchParams.set(
            "fields",
            "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
          );
          igUrl.searchParams.set("limit", String(limit));
          igUrl.searchParams.set("access_token", token);
          if (after) igUrl.searchParams.set("after", after);

          const r = await fetch(igUrl.toString(), {
            headers: { Accept: "application/json" },
          });

          if (!r.ok) {
            const body = await r.text().catch(() => "");
            console.error(
              `[api/instagram] Graph API respondeu ${r.status} ${r.statusText}. Body: ${body.slice(0, 300)}`,
            );
            // Serve stale cache if we have any, otherwise return a structured error.
            if (cached) {
              return json({ ...cached.payload, cached: true, stale: true, reason: `ig_${r.status}` });
            }
            const reason =
              r.status === 429 || r.status === 4
                ? "rate_limited"
                : r.status === 401 || r.status === 403
                  ? "unauthorized"
                  : `ig_${r.status}`;
            CACHE.set(cacheKey, {
              expiresAt: Date.now() + ERROR_TTL_MS,
              payload: { posts: [] },
            });
            return json({ posts: [], reason }, { status: 200 });
          }

          const data = (await r.json()) as {
            data?: IGItem[];
            paging?: { next?: string; cursors?: { after?: string } };
          };

          const posts: Post[] = (data.data ?? [])
            .filter((p) => p.media_type !== "VIDEO" || !!p.thumbnail_url)
            .map((p) => ({
              id: p.id,
              permalink: p.permalink,
              media_url: p.media_type === "VIDEO" ? p.thumbnail_url! : p.media_url,
              caption: p.caption,
            }));

          const payload = {
            posts,
            paging: {
              next: data.paging?.next ?? null,
              cursor: data.paging?.cursors?.after ?? null,
            },
          };

          CACHE.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
          console.info(
            `[api/instagram] ${posts.length} posts carregados (limit=${limit}${after ? `, after=${after.slice(0, 8)}…` : ""}).`,
          );
          return json(payload);
        } catch (e) {
          const message = (e as Error).message;
          console.error("[api/instagram] Erro ao chamar Graph API:", message);
          if (cached) {
            return json({ ...cached.payload, cached: true, stale: true, reason: "network_error" });
          }
          return json({ posts: [], reason: "network_error", error: message }, { status: 200 });
        }
      },
    },
  },
});