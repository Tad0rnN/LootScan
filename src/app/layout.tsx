import type { Metadata } from "next";

export const metadata: Metadata = {
  // Başlık (title), açıklama (description) gibi diğer meta verilerinizi buraya ekleyebilirsiniz.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* @ts-ignore: React meta etiketinde 'value' kullanımına TypeScript hatası verir, Vercel build'ini geçmek için susturuyoruz */}
        <meta name="impact-site-verification" {...({ value: "256553c0-22fe-4c4c-88be-3c7c5a474f69" } as any)} />
      </head>
      <body>{children}</body>
    </html>
  );
}
