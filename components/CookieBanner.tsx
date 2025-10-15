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
        蠖薙し繧､繝医・菴馴ｨ捺隼蝟・・縺溘ａCookie繧剃ｽｿ逕ｨ縺励∪縺吶・        <a className="underline" href="/privacy">繝励Λ繧､繝舌す繝ｼ</a> 繧偵＃遒ｺ隱阪￥縺縺輔＞縲・      </div>
      <div className="cookie-actions">
        <button className="btn-accept" onClick={()=>{ setCookie("anshin_consent","1"); setShow(false); }}>蜷梧э縺吶ｋ</button>
        <button className="btn-decline" onClick={()=>{ setCookie("anshin_consent","0"); setShow(false); }}>蜷梧э縺励↑縺・/button>
      </div>
    </div>
  );
}