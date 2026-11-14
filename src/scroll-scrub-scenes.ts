/**
 * Ana sayfa yolculuğu. Tek sürekli çekim (single-shot), aynı filmden ardışık
 * dört parçaya bölündü: her parçanın posteri kendi kodlanmış klibinin ilk karesi.
 * Bu dizi modül sabitidir; kimliği değişirse oynatıcı yeniden kurulur.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#FF8A4C",
  background: "#0B0A09",
  ink: "#FFFFFF",
  muted: "#E6DCD3",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    body: "Regen takipçilerinin taktik ve psikoloji üzerine yazdığı, çizdiği ve tartıştığı defter.",
    clip: "/assets/world/scene-01.mp4",
    id: "defter",
    kicker: "Regen topluluğu",
    label: "Defter",
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.jpg",
    poster: "/assets/world/scene-01-poster.jpg",
    scroll: 1.2,
    title: "Futbolu birlikte okuyalım",
  },
  {
    body: "Hazır şablondan başla, oyuncuları sürükle, isimlerini yaz. Dizilişini kaydet, paylaş, yazına ekle.",
    clip: "/assets/world/scene-02.mp4",
    id: "dizilis",
    kicker: "4-3-3 mü, 3-5-2 mi?",
    label: "Diziliş",
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobilePoster: "/assets/world/scene-02-mobile-poster.jpg",
    poster: "/assets/world/scene-02-poster.jpg",
    tags: ["7 hazır şablon", "Sürükle bırak"],
    title: "Dizilişini kur",
  },
  {
    body: "Pas, topsuz koşu, rakip presi, boş alan. Regen'in çizim diliyle pozisyonu sahada anlat.",
    clip: "/assets/world/scene-03.mp4",
    id: "tahta",
    kicker: "turuncu biziz, siyah rakip",
    label: "Tahta",
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobilePoster: "/assets/world/scene-03-mobile-poster.jpg",
    poster: "/assets/world/scene-03-poster.jpg",
    title: "Tahtaya çiz, anlat",
  },
  {
    body: "Taktik, psikoloji, oyuncu ve maç kategorilerine ya da haftanın konusuna yaz. Onaylanan yazılar yayına girer.",
    clip: "/assets/world/scene-04.mp4",
    id: "yaz",
    kicker: "haftanın konusu açık",
    label: "Yaz",
    mobileClip: "/assets/world/scene-04-mobile.mp4",
    mobilePoster: "/assets/world/scene-04-mobile-poster.jpg",
    poster: "/assets/world/scene-04-poster.jpg",
    scroll: 1.6,
    title: "Fikrini yazıya dök",
  },
];
