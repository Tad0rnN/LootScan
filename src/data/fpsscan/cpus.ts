import type { CPU } from "@/types/fpsscan";

export const CPUS: CPU[] = [
  // Intel Core i9 (14th/13th Gen)
  { id: "i9-14900k", name: "Intel Core i9-14900K", brand: "intel", cpuScore: 185 },
  { id: "i9-14900kf", name: "Intel Core i9-14900KF", brand: "intel", cpuScore: 185 },
  { id: "i9-13900k", name: "Intel Core i9-13900K", brand: "intel", cpuScore: 180 },
  { id: "i9-13900kf", name: "Intel Core i9-13900KF", brand: "intel", cpuScore: 180 },
  // Intel Core i7
  { id: "i7-14700k", name: "Intel Core i7-14700K", brand: "intel", cpuScore: 165 },
  { id: "i7-13700k", name: "Intel Core i7-13700K", brand: "intel", cpuScore: 160 },
  { id: "i7-12700k", name: "Intel Core i7-12700K", brand: "intel", cpuScore: 148 },
  { id: "i7-11700k", name: "Intel Core i7-11700K", brand: "intel", cpuScore: 128 },
  { id: "i7-10700k", name: "Intel Core i7-10700K", brand: "intel", cpuScore: 120 },
  { id: "i7-9700k", name: "Intel Core i7-9700K", brand: "intel", cpuScore: 110 },
  // Intel Core i5
  { id: "i5-14600k", name: "Intel Core i5-14600K", brand: "intel", cpuScore: 155 },
  { id: "i5-13600k", name: "Intel Core i5-13600K", brand: "intel", cpuScore: 150 },
  { id: "i5-12600k", name: "Intel Core i5-12600K", brand: "intel", cpuScore: 138 },
  { id: "i5-12400", name: "Intel Core i5-12400", brand: "intel", cpuScore: 100 },
  { id: "i5-12400f", name: "Intel Core i5-12400F", brand: "intel", cpuScore: 100 },
  { id: "i5-11600k", name: "Intel Core i5-11600K", brand: "intel", cpuScore: 115 },
  { id: "i5-10600k", name: "Intel Core i5-10600K", brand: "intel", cpuScore: 108 },
  { id: "i5-10400", name: "Intel Core i5-10400", brand: "intel", cpuScore: 88 },
  { id: "i5-9600k", name: "Intel Core i5-9600K", brand: "intel", cpuScore: 95 },
  { id: "i5-9400f", name: "Intel Core i5-9400F", brand: "intel", cpuScore: 80 },
  // Intel Core i3
  { id: "i3-13100", name: "Intel Core i3-13100", brand: "intel", cpuScore: 85 },
  { id: "i3-12100", name: "Intel Core i3-12100", brand: "intel", cpuScore: 80 },
  { id: "i3-10100", name: "Intel Core i3-10100", brand: "intel", cpuScore: 68 },
  // AMD Ryzen 9
  { id: "r9-7950x", name: "AMD Ryzen 9 7950X", brand: "amd", cpuScore: 200 },
  { id: "r9-7900x", name: "AMD Ryzen 9 7900X", brand: "amd", cpuScore: 188 },
  { id: "r9-5950x", name: "AMD Ryzen 9 5950X", brand: "amd", cpuScore: 175 },
  { id: "r9-5900x", name: "AMD Ryzen 9 5900X", brand: "amd", cpuScore: 165 },
  { id: "r9-3900x", name: "AMD Ryzen 9 3900X", brand: "amd", cpuScore: 140 },
  // AMD Ryzen 7
  { id: "r7-9700x", name: "AMD Ryzen 7 9700X", brand: "amd", cpuScore: 180 },
  { id: "r7-7700x", name: "AMD Ryzen 7 7700X", brand: "amd", cpuScore: 168 },
  { id: "r7-7700", name: "AMD Ryzen 7 7700", brand: "amd", cpuScore: 158 },
  { id: "r7-5800x3d", name: "AMD Ryzen 7 5800X3D", brand: "amd", cpuScore: 175 },
  { id: "r7-5800x", name: "AMD Ryzen 7 5800X", brand: "amd", cpuScore: 150 },
  { id: "r7-5700x", name: "AMD Ryzen 7 5700X", brand: "amd", cpuScore: 140 },
  { id: "r7-3700x", name: "AMD Ryzen 7 3700X", brand: "amd", cpuScore: 120 },
  { id: "r7-2700x", name: "AMD Ryzen 7 2700X", brand: "amd", cpuScore: 100 },
  // AMD Ryzen 5
  { id: "r5-9600x", name: "AMD Ryzen 5 9600X", brand: "amd", cpuScore: 170 },
  { id: "r5-7600x", name: "AMD Ryzen 5 7600X", brand: "amd", cpuScore: 158 },
  { id: "r5-7600", name: "AMD Ryzen 5 7600", brand: "amd", cpuScore: 148 },
  { id: "r5-5600x", name: "AMD Ryzen 5 5600X", brand: "amd", cpuScore: 130 },
  { id: "r5-5600", name: "AMD Ryzen 5 5600", brand: "amd", cpuScore: 122 },
  { id: "r5-3600", name: "AMD Ryzen 5 3600", brand: "amd", cpuScore: 100 },
  { id: "r5-3600x", name: "AMD Ryzen 5 3600X", brand: "amd", cpuScore: 105 },
  { id: "r5-2600", name: "AMD Ryzen 5 2600", brand: "amd", cpuScore: 82 },
  // AMD Ryzen 3
  { id: "r3-5300g", name: "AMD Ryzen 3 5300G", brand: "amd", cpuScore: 85 },
  { id: "r3-3300x", name: "AMD Ryzen 3 3300X", brand: "amd", cpuScore: 78 },
];

export function getCPUById(id: string): CPU | undefined {
  return CPUS.find((c) => c.id === id);
}

export function searchCPUs(query: string): CPU[] {
  const q = query.toLowerCase();
  return CPUS.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 15);
}
