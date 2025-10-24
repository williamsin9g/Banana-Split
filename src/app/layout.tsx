import type { Metadata } from 'next'
import './globals.css'
import 'reactflow/dist/style.css'
import '../styles/combine-mode-switch.css'

export const metadata: Metadata = {
  title: 'Banana Editor - Open Source',
  description: 'AI 創意編輯器開源版本 - 使用您自己的 Gemini API Key',
  keywords: ['AI', '圖片生成', 'Gemini', '開源', 'Editor'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        {children}
      </body>
    </html>
  )
}
