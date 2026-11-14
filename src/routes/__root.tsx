import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { getMe } from "../lib/regen/api.functions";
import { TEMA_RENGI } from "../lib/regen/marka";
import { Altbilgi, UstMenu } from "../components/regen/site";
// Sayfa başlığı, açıklaması ve paylaşım görseli bu dosyadan okunur.
import appMetaJson from "../app-meta.json";

const DEFAULT_TITLE = "Regen";
const DEFAULT_DESCRIPTION = "Psikolojik ve taktik futbol analizleri: yazılar, diziliş kurucu ve taktik tahta.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
  marketplace_cover_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

function toOwnAssetUrl(value: string | null | undefined): string | null {
  return value ? value : null;
}

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = toOwnAssetUrl(meta.og_video_url);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "theme-color", content: TEMA_RENGI },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "tr_TR" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Montserrat:wght@500;600;700;800;900&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/assets/regen/favicon-32.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/assets/regen/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      ...(favicon ? [{ rel: "icon", href: favicon }] : []),
    ],
  };
}

function NotFoundComponent() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-start justify-center gap-5 px-6 py-24">
      <span className="font-el text-3xl font-bold text-turuncu-acik">ofsayt</span>
      <h1 className="text-5xl font-black leading-none">Bu sayfa sahada yok.</h1>
      <p className="text-lg text-soluk">Bağlantı eski olabilir ya da sayfa kaldırılmış olabilir.</p>
      <Link to="/" className="rounded-lg bg-white px-5 py-3 font-extrabold text-zemin">Ana sayfaya dön</Link>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-start justify-center gap-5 px-6 py-24">
      <h1 className="text-4xl font-black leading-none">Sayfa yüklenemedi.</h1>
      <p className="text-lg text-soluk">Bir şeyler ters gitti. Yeniden deneyebilir ya da ana sayfaya dönebilirsin.</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="min-h-11 regen-parlak rounded-full px-5 font-extrabold text-white"
        >
          Yeniden dene
        </button>
        <a href="/" className="flex min-h-11 items-center rounded-lg border-2 border-white/25 px-5 font-extrabold">
          Ana sayfa
        </a>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  beforeLoad: async () => {
    const user = await getMe();
    return { user };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body className="regen-govde">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, user } = Route.useRouteContext();


  return (
    <QueryClientProvider client={queryClient}>
      <UstMenu uye={user} />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Altbilgi />
    </QueryClientProvider>
  );
}
