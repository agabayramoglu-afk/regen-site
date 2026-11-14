import { createFileRoute, useRouteContext } from "@tanstack/react-router";

import { tahtaKaydet } from "@/lib/regen/api.functions";
import { SayfaBasligi } from "@/components/regen/site";
import { TahtaEditor } from "@/components/regen/tahta-editor";

export const Route = createFileRoute("/dizilis")({
  head: () => ({
    meta: [{ title: "Diziliş kur | Regen" }, { name: "description", content: "Hazır şablonlardan dizilişini kur, oyuncuları sürükle, kaydet ve paylaş." }],
  }),
  component: Dizilis,
});

function Dizilis() {
  const { user } = useRouteContext({ from: "__root__" });
  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6">
      <SayfaBasligi ust="kendi on birin" baslik="Diziliş kur" alt="Bir şablon seç, oyuncuları sürükle, numara ve isim yaz. Kaydettiğinde paylaşım bağlantısı oluşur." />
      <div className="mt-10">
        <TahtaEditor tur="dizilis" girisli={!!user} kaydet={(d) => tahtaKaydet({ data: d })} />
      </div>
    </main>
  );
}
