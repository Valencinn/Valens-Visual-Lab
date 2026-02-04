(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(e){if(e.ep)return;e.ep=!0;const t=n(e);fetch(e.href,t)}})();const c=document.getElementById("algorithmsContainer");async function a(){try{const r=await fetch("./algorithms.json");if(!r.ok)throw new Error("Error al cargar JSON");return await r.json()}catch(r){return console.error(r),[]}}function l(r){const o=document.createElement("article");o.className="algo-card";const n=`difficulty-${r.difficulty.toLowerCase()}`;return o.innerHTML=`
    <div class="algo-image">
      <img src="${r.image}" alt="${r.name}">
    </div>

    <span class="difficulty-badge ${n}">
      ${r.difficulty}
    </span>

    <h3>${r.name}</h3>
    <p class="algo-description">${r.description}</p>
  `,o}async function f(){const r=await a();c&&(c.innerHTML="",r.forEach(o=>c.appendChild(l(o))))}f();
