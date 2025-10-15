"use client";
import { useEffect, useState } from "react";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date(Date.now() + days*24*60*60*1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d}; path=/; SameSite=Lax`;
}

export function CookieBanner(){
  const [show,setShow] = useState(false);
  useEffect(()=>{ setShow(getCookie("anshin_consent") !== "1"); },[]);
  if (!show) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-label="cookie consent">
      <div className="cookie-text">
        当サイトは体験改善のためCookieを使用します。
        <a className="underline" href="/privacy">プライバシー</a> をご確認ください。
      </div>
      <div className="cookie-actions">
        <button className="btn-accept" onClick={()=>{ setCookie("anshin_consent","1"); setShow(false); }}>同意する</button>
        <button className="btn-decline" onClick={()=>{ setCookie("anshin_consent","0"); setShow(false); }}>同意しない</button>
      </div>
    </div>
  );
}