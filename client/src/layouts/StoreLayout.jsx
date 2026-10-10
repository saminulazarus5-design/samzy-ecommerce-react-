import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import css from "../styles/store.css?inline";

// Injects the storefront stylesheet only while the storefront is on screen,
// so it never clashes with the admin stylesheet (both use classes like .btn).
export function useScopedCss(cssText) {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = cssText;
    document.head.appendChild(el);
    return () => el.remove();
  }, [cssText]);
}

export default function StoreLayout() {
  useScopedCss(css);
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}
