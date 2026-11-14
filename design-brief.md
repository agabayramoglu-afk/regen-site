# Regen Taktik — design brief

**Design read:** Futbolu taktik ve psikoloji üzerinden okuyan Regen takipçileri için; tonu "karakalem defter": sıcak, el yapımı, ama net ve öğretici.

**Concept spine:** Site bir taktik defteri. Siyah kâğıda tebeşir ve renkli kalemle saha çizilir, oyuncular boyanır; ziyaretçi de aynı defteri kullanır: dizilişini kurar, tahtaya çizer, yazar.

**Delivery tier:** cinema (scroll-scrub ana sayfa + sade, işlevsel araç sayfaları).

**Locked palette (kullanıcının onaylı marka renkleri ve yüklediği ton referansı; banned-family kuralını kullanıcı markası geçersiz kılar):**
- `#0B0A09` sıcak siyah zemin, `#15120F` / `#1F1A16` cam yüzeyler, `#050404` gece bandı
- `#F94B02` turuncu tek vurgu; tonlama: `#FFB27F` şeftali > `#F94B02` > `#7A1C03` kor > siyah (kullanıcının yüklediği parlayan hap referansı)
- `#FFFFFF` yazı, `#BDB2A8` soluk yazı, `#FF8A4C` koyu zeminde küçük turuncu metin
- Saha: `#4C9A36` çim, `#2E6E22` biçme şeridi
Savunma: kullanıcı açık temayı beğenmedi; koyu, premium, turuncudan siyaha tonlanan bir görünüm ve beyaz yazı istedi. Karakalem çizim dili korunur.

**Locked type (marka):** Montserrat 600/800/900 (başlık, arayüz), Kalam 700 el yazısı (isimler, kısa notlar, alıntılar). Gövde Montserrat 500.

Animation mode: animated-website

**Journey shape:** single-shot. Tek 15 sn film, ffmpeg ile aynı çekimden ardışık 4 parçaya bölünür (her bölüm bir anlatı durağı; dikişler aynı çekimin ardışık kareleri olduğu için kusursuz).

**Journey (chapters):**
1. Boş kâğıt, soluk saha çizgileri. "Futbolu birlikte okuyalım." Topluluk vaadi. CTA: Üye ol.
2. Saha çizgileri ve çim taraması belirir. "Dizilişini kur." Diziliş kurucu. CTA: Diziliş kur.
3. Kamera yayın açısına eğilir, oyuncular belirir. "Tahtaya çiz, anlat." Taktik tahta. CTA: Tahtayı aç.
4. Turuncu 10 numaraya yakınlaşma. "Haftanın konusuna yaz." Yazı ve konu sistemi. CTA: Yazmaya başla.

**World grammar:** Renkli kalem ve tebeşir, görünür çapraz tarama, mat siyah kâğıt, turuncudan kora dönen sıcak ışık; kamera tek sürekli hareket: tepeden iniş, 30° yayın açısına eğilme, 10 numaraya yavaş itme. Yazı, ok, logo yok.

**Mobile framing:** odak (10 numara) merkezde; kenarlar kırpılabilir. Mobil kodlama 720p.

**Delivery budget:** masaüstü klipler toplam ≤32 MiB, mobil ≤16 MiB.

**Section plan (ana sayfa):**
1. Journey (scroll-scrub, 4 bölüm), sabit cam üst menü
2. Araçlar: bento (taktik tahta önizlemesi, turuncu ışıklı üyelik kartı, diziliş önizlemesi, haftanın konusu)
3. Topluluktan yazılar: asimetrik ızgara (1 büyük + liste)
4. Açık konular: yatay şerit
5. Altbilgi: gece bandı, logo, turuncu tonlu çizgi, "Psikolojik ve taktik analizler için takip et"

**Diğer sayfalar:** /yazilar, /yazilar/:slug, /konular, /yaz, /dizilis, /tahta, /cizim/:id, /giris, /kayit, /profil, /yonetim.

**Asset plan:** journey filmi (+ mobil kodlama ve posterler), storyboard, Regen logosu (beyaz/siyah), Regen kâğıdı, onaylı karakter ve taktik çizimleri (kullanıcının mevcut varlıkları), favicon seti, OG/kapak.

**CTA inventory:**
- Üye ol: turuncu dolgu, basınca 1px aşağı
- Diziliş kur: mürekkep dolgu, turuncu alt çizgi kayar
- Tahtayı aç: kesikli turuncu çerçeve (vurgu çemberi dili)
- Yazmaya başla: kâğıt üzerinde el yazısı (Kalam) bağlantı + elle çizilmiş ok
- Takip et (menü): küçük turuncu hap

**Previous build ledger:** bu sohbette önceki Higgsfield sitesi yok.
