import type { GPU } from "@/types/fpsscan";

export const GPUS: GPU[] = [
  // NVIDIA RTX 40 Series
  { id: "rtx-4090", name: "RTX 4090", brand: "nvidia", score: 360, vram: 24, tier: 6 },
  { id: "rtx-4080-super", name: "RTX 4080 Super", brand: "nvidia", score: 300, vram: 16, tier: 6 },
  { id: "rtx-4080", name: "RTX 4080", brand: "nvidia", score: 280, vram: 16, tier: 6 },
  { id: "rtx-4070-ti-super", name: "RTX 4070 Ti Super", brand: "nvidia", score: 250, vram: 16, tier: 5 },
  { id: "rtx-4070-ti", name: "RTX 4070 Ti", brand: "nvidia", score: 230, vram: 12, tier: 5 },
  { id: "rtx-4070-super", name: "RTX 4070 Super", brand: "nvidia", score: 200, vram: 12, tier: 5 },
  { id: "rtx-4070", name: "RTX 4070", brand: "nvidia", score: 175, vram: 12, tier: 5 },
  { id: "rtx-4060-ti-16gb", name: "RTX 4060 Ti 16GB", brand: "nvidia", score: 140, vram: 16, tier: 4 },
  { id: "rtx-4060-ti", name: "RTX 4060 Ti", brand: "nvidia", score: 135, vram: 8, tier: 4 },
  { id: "rtx-4060", name: "RTX 4060", brand: "nvidia", score: 115, vram: 8, tier: 3 },
  // NVIDIA RTX 30 Series
  { id: "rtx-3090-ti", name: "RTX 3090 Ti", brand: "nvidia", score: 245, vram: 24, tier: 5 },
  { id: "rtx-3090", name: "RTX 3090", brand: "nvidia", score: 220, vram: 24, tier: 5 },
  { id: "rtx-3080-ti", name: "RTX 3080 Ti", brand: "nvidia", score: 210, vram: 12, tier: 5 },
  { id: "rtx-3080-12gb", name: "RTX 3080 12GB", brand: "nvidia", score: 205, vram: 12, tier: 5 },
  { id: "rtx-3080", name: "RTX 3080", brand: "nvidia", score: 195, vram: 10, tier: 4 },
  { id: "rtx-3070-ti", name: "RTX 3070 Ti", brand: "nvidia", score: 165, vram: 8, tier: 4 },
  { id: "rtx-3070", name: "RTX 3070", brand: "nvidia", score: 155, vram: 8, tier: 4 },
  { id: "rtx-3060-ti", name: "RTX 3060 Ti", brand: "nvidia", score: 130, vram: 8, tier: 4 },
  { id: "rtx-3060", name: "RTX 3060", brand: "nvidia", score: 100, vram: 12, tier: 3 },
  { id: "rtx-3050", name: "RTX 3050", brand: "nvidia", score: 75, vram: 8, tier: 2 },
  // NVIDIA RTX 20 Series
  { id: "rtx-2080-ti", name: "RTX 2080 Ti", brand: "nvidia", score: 180, vram: 11, tier: 4 },
  { id: "rtx-2080-super", name: "RTX 2080 Super", brand: "nvidia", score: 155, vram: 8, tier: 4 },
  { id: "rtx-2080", name: "RTX 2080", brand: "nvidia", score: 145, vram: 8, tier: 4 },
  { id: "rtx-2070-super", name: "RTX 2070 Super", brand: "nvidia", score: 135, vram: 8, tier: 4 },
  { id: "rtx-2070", name: "RTX 2070", brand: "nvidia", score: 122, vram: 8, tier: 3 },
  { id: "rtx-2060-super", name: "RTX 2060 Super", brand: "nvidia", score: 110, vram: 8, tier: 3 },
  { id: "rtx-2060", name: "RTX 2060", brand: "nvidia", score: 95, vram: 6, tier: 3 },
  // NVIDIA GTX 16/10 Series
  { id: "gtx-1660-ti", name: "GTX 1660 Ti", brand: "nvidia", score: 85, vram: 6, tier: 2 },
  { id: "gtx-1660-super", name: "GTX 1660 Super", brand: "nvidia", score: 82, vram: 6, tier: 2 },
  { id: "gtx-1660", name: "GTX 1660", brand: "nvidia", score: 76, vram: 6, tier: 2 },
  { id: "gtx-1650", name: "GTX 1650", brand: "nvidia", score: 55, vram: 4, tier: 1 },
  { id: "gtx-1080-ti", name: "GTX 1080 Ti", brand: "nvidia", score: 112, vram: 11, tier: 3 },
  { id: "gtx-1080", name: "GTX 1080", brand: "nvidia", score: 88, vram: 8, tier: 2 },
  { id: "gtx-1070-ti", name: "GTX 1070 Ti", brand: "nvidia", score: 78, vram: 8, tier: 2 },
  { id: "gtx-1070", name: "GTX 1070", brand: "nvidia", score: 72, vram: 8, tier: 2 },
  { id: "gtx-1060-6gb", name: "GTX 1060 6GB", brand: "nvidia", score: 55, vram: 6, tier: 1 },
  { id: "gtx-1060-3gb", name: "GTX 1060 3GB", brand: "nvidia", score: 48, vram: 3, tier: 1 },
  { id: "gtx-1050-ti", name: "GTX 1050 Ti", brand: "nvidia", score: 35, vram: 4, tier: 1 },
  // AMD RX 7000 Series
  { id: "rx-7900-xtx", name: "RX 7900 XTX", brand: "amd", score: 320, vram: 24, tier: 6 },
  { id: "rx-7900-xt", name: "RX 7900 XT", brand: "amd", score: 270, vram: 20, tier: 6 },
  { id: "rx-7900-gre", name: "RX 7900 GRE", brand: "amd", score: 225, vram: 16, tier: 5 },
  { id: "rx-7800-xt", name: "RX 7800 XT", brand: "amd", score: 185, vram: 16, tier: 4 },
  { id: "rx-7700-xt", name: "RX 7700 XT", brand: "amd", score: 155, vram: 12, tier: 4 },
  { id: "rx-7600", name: "RX 7600", brand: "amd", score: 108, vram: 8, tier: 3 },
  { id: "rx-7600-xt", name: "RX 7600 XT", brand: "amd", score: 118, vram: 16, tier: 3 },
  // AMD RX 6000 Series
  { id: "rx-6950-xt", name: "RX 6950 XT", brand: "amd", score: 240, vram: 16, tier: 5 },
  { id: "rx-6900-xt", name: "RX 6900 XT", brand: "amd", score: 220, vram: 16, tier: 5 },
  { id: "rx-6800-xt", name: "RX 6800 XT", brand: "amd", score: 195, vram: 16, tier: 4 },
  { id: "rx-6800", name: "RX 6800", brand: "amd", score: 175, vram: 16, tier: 4 },
  { id: "rx-6750-xt", name: "RX 6750 XT", brand: "amd", score: 155, vram: 12, tier: 4 },
  { id: "rx-6700-xt", name: "RX 6700 XT", brand: "amd", score: 140, vram: 12, tier: 4 },
  { id: "rx-6650-xt", name: "RX 6650 XT", brand: "amd", score: 118, vram: 8, tier: 3 },
  { id: "rx-6600-xt", name: "RX 6600 XT", brand: "amd", score: 110, vram: 8, tier: 3 },
  { id: "rx-6600", name: "RX 6600", brand: "amd", score: 100, vram: 8, tier: 3 },
  { id: "rx-6500-xt", name: "RX 6500 XT", brand: "amd", score: 55, vram: 4, tier: 1 },
  // AMD RX 5000 Series
  { id: "rx-5700-xt", name: "RX 5700 XT", brand: "amd", score: 118, vram: 8, tier: 3 },
  { id: "rx-5700", name: "RX 5700", brand: "amd", score: 105, vram: 8, tier: 3 },
  { id: "rx-5600-xt", name: "RX 5600 XT", brand: "amd", score: 88, vram: 6, tier: 2 },
  { id: "rx-5500-xt-8gb", name: "RX 5500 XT 8GB", brand: "amd", score: 65, vram: 8, tier: 2 },
  // AMD RX 500 Series
  { id: "rx-590", name: "RX 590", brand: "amd", score: 58, vram: 8, tier: 1 },
  { id: "rx-580-8gb", name: "RX 580 8GB", brand: "amd", score: 52, vram: 8, tier: 1 },
  { id: "rx-570-4gb", name: "RX 570 4GB", brand: "amd", score: 44, vram: 4, tier: 1 },
  // Intel Arc
  { id: "arc-a770", name: "Intel Arc A770 16GB", brand: "intel", score: 108, vram: 16, tier: 3 },
  { id: "arc-a750", name: "Intel Arc A750", brand: "intel", score: 92, vram: 8, tier: 3 },
  { id: "arc-b580", name: "Intel Arc B580", brand: "intel", score: 125, vram: 12, tier: 3 },
  { id: "arc-b770", name: "Intel Arc B770", brand: "intel", score: 165, vram: 16, tier: 4 },
];

export function getGPUById(id: string): GPU | undefined {
  return GPUS.find((g) => g.id === id);
}

export function searchGPUs(query: string): GPU[] {
  const q = query.toLowerCase();
  return GPUS.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 15);
}
