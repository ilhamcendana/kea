import type { AppProps } from "next/app";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { PAGE_URL } from "@/helpers/constants";
import LayoutAuth from "@/molecules/LayoutAuth";
import "@/styles/globals.css";
import { ConfigProvider, ThemeConfig } from "antd";

const PlusJKT = Plus_Jakarta_Sans({
  variable: "--plus-jkt",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#4388d6",
    fontFamily: PlusJKT.style.fontFamily,    
  },
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const tokenRaw = JSON.parse(localStorage.getItem("auth-store") || "{}");
    const token = tokenRaw?.state?.session?.access_token;
    const NoAuthPaths = [PAGE_URL.LOGIN];

    if (
      router.pathname?.includes(PAGE_URL.LANDING_PAGE) &&
      !router.pathname?.includes("manage")
    ) {
      return;
    }

    if (NoAuthPaths?.includes(router.pathname) && token) {
      router.push("/");
    }

    if (!NoAuthPaths?.includes(router.pathname) && !token) {
      router.push(PAGE_URL.LOGIN);
    }
  }, [router.pathname]);
  return (
    <ConfigProvider theme={{ ...theme }}>
      <LayoutAuth>
        <Component {...pageProps} />
      </LayoutAuth>
    </ConfigProvider>
  );
}
