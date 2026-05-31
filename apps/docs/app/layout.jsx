import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: "Tokovo Documentation",
  description:
    "Production-grade documentation for the Tokovo phone simulation engine",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={
            <Navbar logo={<span style={{ fontWeight: 700 }}>Tokovo</span>} />
          }
          footer={<Footer>MIT {new Date().getFullYear()} © Tokovo</Footer>}
          pageMap={await getPageMap()}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
