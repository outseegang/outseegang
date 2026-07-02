import { createFileRoute } from "@tanstack/react-router";

// Instagram Graph API — Basic Display.
// Set INSTAGRAM_ACCESS_TOKEN (long-lived user token) in your environment to enable a real feed.
// Without it, the endpoint returns an empty list and the UI keeps its fallback.

type IGItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
};

export const Route = createFileRoute("/api/instagram")({
  server: {
    handlers: {
      GET: async () => {
        const token = process.env.INSTAGRAM_ACCESS_TOKEN;
        if (!token) {
          return Response.json({ posts: [] });
        }
        try {
          const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=12&access_token=${encodeURIComponent(token)}`;
          const r = await fetch(url, { headers: { Accept: "application/json" } });
          if (!r.ok) return Response.json({ posts: [], error: `IG ${r.status}` }, { status: 200 });
          const data = (await r.json()) as { data?: IGItem[] };
          const posts = (data.data ?? [])
            .filter((p) => p.media_type !== "VIDEO" || !!p.thumbnail_url)
            .map((p) => ({
              id: p.id,
              permalink: p.permalink,
              media_url: p.media_type === "VIDEO" ? p.thumbnail_url! : p.media_url,
              caption: p.caption,
            }));
          return Response.json({ posts }, { headers: { "Cache-Control": "public, max-age=600" } });
        } catch (e) {
          return Response.json({ posts: [], error: (e as Error).message }, { status: 200 });
        }
      },
    },
  },
});