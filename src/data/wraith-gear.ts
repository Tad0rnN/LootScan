export interface WraithGearItem {
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  handle: string;
  category: "keyboards" | "mice" | "headsets" | "mousepads" | "keycaps" | "switches" | "accessories";
  badge?: "Yeni" | "Ön Sipariş" | "İndirim";
}

export const WRAITH_GEAR_ITEMS: WraithGearItem[] = [
  // Keyboards
  {
    name: "Wraith W75 V2 [BBL Edition] Klavye (Manyetik Switch / HE)",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/1_b314c595-a01f-4d81-96c0-cdfb4145464f.png?v=1751279296",
    price: 4599,
    handle: "wraith-w75-bbl-edition-klavye",
    category: "keyboards",
    badge: "Yeni",
  },
  {
    name: "Wraith W75 V2 Klavye (Manyetik Switch / HE)",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/w75_mavi.png?v=1765545835",
    price: 4299,
    compareAtPrice: 4599,
    handle: "wraith-w75-analog-klavye-founders-edition-on-siparis",
    category: "keyboards",
    badge: "İndirim",
  },
  {
    name: "Wraith W60 [BBL Edition] Klavye (Manyetik Switch / HE)",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Beyaz_Fon_cd57c73e-5553-4a2c-b0d8-84e4891266c1.png?v=1760350589",
    price: 2999,
    compareAtPrice: 2599,
    handle: "wraith-w60-bbl-edition-klavye-manyetik-switch-he",
    category: "keyboards",
  },
  {
    name: "Wraith W60 Klavye (Manyetik Switch / HE)",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Blue_1_copy.jpg?v=1769432134",
    price: 2699,
    compareAtPrice: 2999,
    handle: "wraith-w60",
    category: "keyboards",
    badge: "İndirim",
  },

  // Mice
  {
    name: "Wraith W1 Wireless Mouse",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Beyaz-1.png?v=1766136550",
    price: 3599,
    compareAtPrice: 3999,
    handle: "wraith-w1-wireless-mouse",
    category: "mice",
    badge: "İndirim",
  },

  // Headsets
  {
    name: "Wraith EVA Kablosuz Kulaklık [Ön Sipariş]",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/B1_5935f5d7-7dab-4c68-ba75-32011a0b4b6f.png?v=1776069154",
    price: 2999,
    compareAtPrice: 3399,
    handle: "wraith-eva-kablosuz-kulaklik",
    category: "headsets",
    badge: "Ön Sipariş",
  },
  {
    name: "Wraith evoX IEM Kulaklık",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/1_782616c3-73b3-45a6-b4ed-9b411a3c338d.png?v=1757074015",
    price: 2899,
    handle: "wraith-evox-iem-kulaklik",
    category: "headsets",
  },
  {
    name: "Wraith Sense IEM Kulaklık",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/ICE1.jpg?v=1754479975",
    price: 1099,
    handle: "wraith-sense-iem-kulaklik",
    category: "headsets",
  },

  // Mousepads
  {
    name: "Wraith Cosmic Glass V2 Cam Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/cosmic-glass-1.png?v=1774873673",
    price: 3999,
    handle: "wraith-cosmic-glass-v2-cam-mousepad",
    category: "mousepads",
    badge: "Yeni",
  },
  {
    name: "Wraith Ace Series [Glimpse] Limited Edition Poron Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/48x43.png?v=1759489035",
    price: 2199,
    handle: "wraith-ace-series-storm-glimpse-edition-poron-mousepad",
    category: "mousepads",
  },
  {
    name: "Wraith Ace Series Poron Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Surge_43x48_Koyu_Mavi.png?v=1780660479",
    price: 1799,
    handle: "wraith-ace-series-poron-mousepad",
    category: "mousepads",
  },
  {
    name: "Wraith Spirit of Aim Pro Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/KirmiziKutu.png?v=1763985598",
    price: 1899,
    handle: "spirit-of-aim-pro-mousepad",
    category: "mousepads",
  },
  {
    name: "Wraith Spirit of Aim Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Mavi_Kutu.png?v=1763986648",
    price: 1499,
    handle: "wraith-spirit-of-aim-mousepad",
    category: "mousepads",
  },
  {
    name: "Wraith Litepad Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Untitled-1.jpg?v=1739273156",
    price: 749,
    handle: "wraith-litepad-mousepad",
    category: "mousepads",
  },
  {
    name: "Wraith Blade Y Hard Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/BladeY-product-1.png?v=1688064975",
    price: 1199,
    handle: "wraith-blade-y-hard-mousepad",
    category: "mousepads",
  },
  {
    name: "Wraith Blade X Semi-Hard Mousepad",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/BladeX-product-1.png?v=1688064815",
    price: 1199,
    handle: "blade-x-semi-hard-mousepad",
    category: "mousepads",
  },
  {
    name: "Wraith Kitsune Edition Deskmat",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Kitsune.png?v=1776088228",
    price: 799,
    handle: "wraith-kitsune-deskmat",
    category: "mousepads",
  },
  {
    name: "Wraith Studio Daydream Deskmat",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Beyaz_87c1cd1a-1178-4d42-acf7-5956d463d772.png?v=1776080419",
    price: 699,
    handle: "wraith-studio-daydream-deskmat",
    category: "mousepads",
  },
  {
    name: "Wraith Studio Jungle Maze Deskmat",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Acik_Mavi.png?v=1760427854",
    price: 699,
    handle: "wraith-studio-jungle-maze-deskmat",
    category: "mousepads",
  },

  // Keycaps
  {
    name: "Wraith Shine-Through Tuş Takımı",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Keykap.jpg?v=1752485217",
    price: 599,
    handle: "wraith-shine-through-tus-takimi",
    category: "keycaps",
  },
  {
    name: "Wraith Çift Enjeksiyonlu PBT Türkçe Tuş Takımı",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/BlackandWhite.png?v=1723474319",
    price: 899,
    handle: "wraith-turkce-keycap-seti",
    category: "keycaps",
  },

  // Switches
  {
    name: "Wraith Flow Manyetik Switch",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/1_35c8759a-dcaa-4717-bafb-3a0a4d5e622a.png?v=1757513395",
    price: 219,
    handle: "wraith-flow-manyetik-switch",
    category: "switches",
  },

  // Accessories
  {
    name: "Wraith Alüminyum Bilek Desteği",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/60mavi.png?v=1774882220",
    price: 1899,
    handle: "wraith-aluminyum-bilek-destegi",
    category: "accessories",
  },
  {
    name: "Wraith Ahşap Bilek Desteği",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Bilek_Destegi.jpg?v=1738594158",
    price: 349,
    handle: "wraith-ahsap-bilek-destegi",
    category: "accessories",
  },
  {
    name: "Wraith Studio LP-01 Low-Profile Mikrofon Standı",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/lp1.png?v=1762944847",
    price: 2999,
    handle: "wraith-studio-lp-01-low-profile-mikrofon-kolu",
    category: "accessories",
  },
  {
    name: "Wraith Studio HP-01 Mikrofon Standı",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/hp1.png?v=1762944850",
    price: 2999,
    handle: "wraith-studio-hp-01-mikrofon-kolu",
    category: "accessories",
  },
  {
    name: "Wraith Esports Arm Sleeve",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/kitsune-parmakli.png?v=1762437101",
    price: 799,
    handle: "wraith-esports-arm-sleeve",
    category: "accessories",
  },
  {
    name: "Wraith Klavye Matı",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/60_816be6c9-378a-4427-87ea-8ba191d147ef.png?v=1760527686",
    price: 299,
    handle: "wraith-klavye-mati",
    category: "accessories",
  },
  {
    name: "Wraith Klavye Lube Kit",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/4.jpg?v=1757672161",
    price: 399,
    handle: "wraith-klavye-lube-kit",
    category: "accessories",
  },
  {
    name: "Wraith Glass Mouse Skates",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/glass.png?v=1755687828",
    price: 549,
    compareAtPrice: 499,
    handle: "wraith-glass-mouse-skates",
    category: "accessories",
  },
  {
    name: "Wraith Çift Başlıklı Kablo",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Siyah_79a34e20-32ba-43ea-bee6-46f4b453683e.png?v=1759217239",
    price: 1199,
    handle: "wraith-cift-baslikli-kablo",
    category: "accessories",
  },
  {
    name: "Wraith Çift Yönlü Coiled Kablo",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/Beyaz.jpg?v=1776321352",
    price: 999,
    handle: "wraith-bidirectional-coiled-kablo",
    category: "accessories",
  },
  {
    name: "Universal Hoverpad V3 Mouse Skate",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/profil_1.png?v=1751290516",
    price: 299,
    compareAtPrice: 269,
    handle: "universal-hoverpad-v2-mouse-skate",
    category: "accessories",
  },
  {
    name: "Universal Kesim Grip Tape V2",
    image: "https://cdn.shopify.com/s/files/1/0564/0096/9921/files/grip_tape_siyah2.jpg?v=1701342013",
    price: 299,
    handle: "universal-kesim-grip-tape-v2",
    category: "accessories",
  },
];

export const WRAITH_STORE_URL = "https://wraithesports.com";

export function getWraithProductUrl(handle: string): string {
  return `${WRAITH_STORE_URL}/products/${handle}?utm_source=lootscan&utm_medium=affiliate`;
}

export function formatTRY(price: number): string {
  return `₺${price.toLocaleString("tr-TR")}`;
}
