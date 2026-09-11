import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import ToastContainer from '@/components/Toast';

export const metadata: Metadata = {
  title: '采选AI · 跨平台智能比价',
  description: '拼多多、京东、淘宝三平台智能比价,价格预警,AI对话比价',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
