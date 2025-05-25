import { Open_Sans } from "next/font/google";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getMenuByIdentifier, transformContentfulMenu } from "@/utils/contentful";
import getConfig from 'next/config';
import AdminBarWrapper from "@/components/admin/AdminBarWrapper";

import './globals.css'

const font = Open_Sans({ subsets: ["latin"] });
const { publicRuntimeConfig } = getConfig();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get menu data from Contentful
  let menuData = null;
  let footerData = null;

  try {
    const [mainMenu, footerMenu] = await Promise.all([
      getMenuByIdentifier('main'),
      getMenuByIdentifier('footer'),
    ]);

    menuData = transformContentfulMenu(mainMenu);
    footerData = transformContentfulMenu(footerMenu);
  } catch (error) {
    console.warn('Failed to fetch menus from Contentful:', error);
  }

  const isPreviewMode = process.env.ENVIRONMENT === 'preview';

  return (
    <html lang="en">
      <body className={font.className}>
        <AdminBarWrapper isPreviewMode={isPreviewMode} />
        <Container>
          <Header
            mainMenu={menuData?.menu || null}
            config={publicRuntimeConfig}
          />
          {children}
          <Footer footerMenu={footerData?.menu || null} />
        </Container>
      </body>
    </html>
  );
}
