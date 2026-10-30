import { Providers } from './providers';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata = {
  title: 'IA Curriculum',
  description: 'Asesor profesional guiado para construir tu próximo paso laboral.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
