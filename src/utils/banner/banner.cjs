"use strict";var u=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var z=Object.prototype.hasOwnProperty;var E=(e,t)=>{for(var a in t)u(e,a,{get:t[a],enumerable:!0})},L=(e,t,a,l)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of k(t))!z.call(e,r)&&r!==a&&u(e,r,{get:()=>t[r],enumerable:!(l=B(t,r))||l.enumerable});return e};var T=e=>L(u({},"__esModule",{value:!0}),e);var O={};E(O,{default:()=>I,showBanner:()=>y});module.exports=T(O);var o={question:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8.75c-.69 0-1.25.56-1.25 1.25v.107a.75.75 0 1 1-1.5 0V10A2.75 2.75 0 0 1 12 7.25h.116a2.634 2.634 0 0 1 1.714 4.633l-.77.66a.9.9 0 0 0-.31.674v.533a.75.75 0 0 1-1.5 0v-.533c0-.697.304-1.359.833-1.812l.771-.66a1.134 1.134 0 0 0-.738-1.995zM12 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path fill="currentColor" d="M3.25 12a8.75 8.75 0 1 1 17.5 0a8.75 8.75 0 0 1-17.5 0M12 4.75a7.25 7.25 0 1 0 0 14.5a7.25 7.25 0 0 0 0-14.5"/></svg>',success_square:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.53 10.53a.75.75 0 1 0-1.06-1.06L11 12.94l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"/><path fill="currentColor" d="M12.633 4.25h-1.266c-1.092 0-1.958 0-2.655.057c-.714.058-1.317.18-1.868.46a4.75 4.75 0 0 0-2.076 2.077c-.281.55-.403 1.154-.461 1.868c-.057.697-.057 1.563-.057 2.655v1.266c0 1.092 0 1.958.057 2.655c.058.714.18 1.317.46 1.869a4.75 4.75 0 0 0 2.077 2.075c.55.281 1.154.403 1.868.461c.697.057 1.563.057 2.655.057h1.266c1.092 0 1.958 0 2.655-.057c.714-.058 1.317-.18 1.869-.46a4.75 4.75 0 0 0 2.075-2.076c.281-.552.403-1.155.461-1.869c.057-.697.057-1.563.057-2.655v-1.266c0-1.092 0-1.958-.057-2.655c-.058-.714-.18-1.317-.46-1.868a4.75 4.75 0 0 0-2.076-2.076c-.552-.281-1.155-.403-1.869-.461c-.697-.057-1.563-.057-2.655-.057M7.525 6.104c.304-.155.688-.251 1.309-.302c.63-.051 1.434-.052 2.566-.052h1.2c1.133 0 1.937 0 2.566.052c.62.05 1.005.147 1.31.302a3.25 3.25 0 0 1 1.42 1.42c.155.305.251.69.302 1.31c.051.63.052 1.434.052 2.566v1.2c0 1.133 0 1.937-.052 2.566c-.05.62-.147 1.005-.302 1.31a3.25 3.25 0 0 1-1.42 1.42c-.305.155-.69.251-1.31.302c-.63.051-1.434.052-2.566.052h-1.2c-1.133 0-1.937 0-2.566-.052c-.62-.05-1.005-.147-1.31-.302a3.25 3.25 0 0 1-1.42-1.42c-.155-.305-.251-.69-.302-1.31c-.051-.63-.052-1.434-.052-2.566v-1.2c0-1.133 0-1.937.052-2.566c.05-.62.147-1.005.302-1.31a3.25 3.25 0 0 1 1.42-1.42"/></svg>',success_circle:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.53 10.53a.75.75 0 1 0-1.06-1.06L11 12.94l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"/><path fill="currentColor" d="M12 20.75a8.75 8.75 0 1 1 0-17.5a8.75 8.75 0 0 1 0 17.5M4.75 12a7.25 7.25 0 1 0 14.5 0a7.25 7.25 0 0 0-14.5 0"/></svg>',success:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.53 10.53a.75.75 0 1 0-1.06-1.06L11 12.94l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"/><path fill="currentColor" d="M12 20.75a8.75 8.75 0 1 1 0-17.5a8.75 8.75 0 0 1 0 17.5M4.75 12a7.25 7.25 0 1 0 14.5 0a7.25 7.25 0 0 0-14.5 0"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10.756 9.4C10.686 8.65 11.264 8 12 8s1.313.649 1.244 1.4l-.494 4.15a.76.76 0 0 1-.75.7a.76.76 0 0 1-.75-.7zm2.494 7.35a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0"/><path fill="currentColor" fill-rule="evenodd" d="M13.164 3.492a2.92 2.92 0 0 0-2.328 0c-.506.22-.881.634-1.222 1.115c-.338.477-.711 1.123-1.173 1.923l-4.815 8.34c-.438.758-.794 1.374-1.026 1.881c-.235.51-.4 1.025-.336 1.558c.095.782.526 1.48 1.175 1.929c.438.303.97.411 1.543.462c.57.05 1.3.05 2.205.05h9.626c.905 0 1.635 0 2.205-.05c.573-.05 1.105-.16 1.543-.462a2.75 2.75 0 0 0 1.175-1.929c.065-.533-.102-1.047-.336-1.558c-.232-.507-.588-1.123-1.026-1.882l-4.815-8.34c-.462-.799-.835-1.445-1.173-1.922c-.34-.48-.716-.894-1.222-1.115m-1.729 1.375a1.42 1.42 0 0 1 1.13 0c.123.054.303.192.597.608c.293.413.632.998 1.117 1.839l4.776 8.272c.463.8.782 1.356.982 1.79c.201.44.223.64.21.752a1.25 1.25 0 0 1-.54.876c-.11.076-.32.157-.82.201c-.497.044-1.16.045-2.11.045H7.223c-.951 0-1.614 0-2.11-.044c-.5-.045-.711-.126-.821-.202a1.25 1.25 0 0 1-.54-.876c-.013-.111.009-.313.21-.751c.2-.435.52-.99.982-1.791L9.72 7.314c.485-.841.824-1.426 1.117-1.84s.474-.553.597-.607" clip-rule="evenodd"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.53 8.47a.75.75 0 0 0-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 1 0 1.06 1.06L12 13.06l2.47 2.47a.75.75 0 1 0 1.06-1.06L13.06 12l2.47-2.47a.75.75 0 0 0-1.06-1.06L12 10.94z"/><path fill="currentColor" d="M12 3.25a8.75 8.75 0 1 0 0 17.5a8.75 8.75 0 0 0 0-17.5M4.75 12a7.25 7.25 0 1 1 14.5 0a7.25 7.25 0 0 1-14.5 0"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-.736 0-1.313.649-1.244 1.4l.494 4.15a.76.76 0 0 0 .75.7a.76.76 0 0 0 .75-.7l.494-4.15C13.314 7.65 12.736 7 12 7m0 10a1.25 1.25 0 1 0 0-2.5a1.25 1.25 0 0 0 0 2.5"/><path fill="currentColor" d="M12 4.75a7.25 7.25 0 1 0 0 14.5a7.25 7.25 0 0 0 0-14.5M3.25 12a8.75 8.75 0 1 1 17.5 0a8.75 8.75 0 0 1-17.5 0"/></svg>',loading:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="message-spinner"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',rightArrow:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m0 0l-6-6m6 6l-6 6"/></svg>'};var N={success:o.success,warning:o.warning,error:o.error,info:o.info},n=null,d=null,g=null;function H(){if(document.getElementById("banner-styles"))return;let e=document.createElement("style");e.id="banner-styles",e.textContent=`
    .banner-wrap {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: var(--banner-z-index, 10000);
      padding: var(--banner-padding, 12px 16px);
      box-sizing: border-box;
      opacity: 0;
      transform: translateY(-100%);
      transition: opacity var(--banner-transition-duration, 0.3s) ease,
                  transform var(--banner-transition-duration, 0.3s) ease;
    }
    .banner-wrap.banner-show {
      opacity: 1;
      transform: translateY(0);
    }

    .banner-inner {
      display: flex;
      align-items: center;
      gap: var(--banner-gap, 12px);
      max-width: var(--banner-max-width, 400px);
      margin: 0 auto;
      padding: var(--banner-inner-padding, 14px 16px);
      border-radius: var(--banner-radius, 10px);
      background: var(--banner-bg, #fff);
      box-shadow: var(--banner-shadow, 0 4px 12px rgba(0,0,0,0.12));
      cursor: var(--banner-cursor, default);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .banner-wrap[data-clickable] .banner-inner { cursor: pointer; }

    .banner-icon {
      flex-shrink: 0;
      width: var(--banner-icon-size, 24px);
      height: var(--banner-icon-size, 24px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--banner-icon-color, #3b82f6);
    }
    .banner-icon svg { width: 100%; height: 100%; display: block; }

    .banner-text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .banner-title {
      font-size: var(--banner-title-size, 15px);
      font-weight: 600;
      color: var(--banner-title-color, #1e293b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }
    .banner-content {
      font-size: var(--banner-content-size, 13px);
      color: var(--banner-content-color, #64748b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }
  `,document.head.appendChild(e)}function b(){d!==null&&(window.clearTimeout(d),d=null)}function x(){if(!n)return;b(),n.classList.remove("banner-show");let e=g;g=null,setTimeout(()=>{n?.parentNode&&n.parentNode.removeChild(n),n=null,e?.()},300)}function j(e){let{title:t,content:a,type:l="info",icon:r,onClick:p,duration:f=3e3,onClose:m}=e,c=document.createElement("div");c.className="banner-wrap",p&&c.setAttribute("data-clickable","1");let i=document.createElement("div");i.className="banner-inner";let h=document.createElement("div");h.className="banner-icon",h.innerHTML=r??N[l],i.appendChild(h);let s=document.createElement("div");s.className="banner-text";let w=document.createElement("div");w.className="banner-title",w.textContent=t;let v=document.createElement("div");return v.className="banner-content",v.textContent=a,s.appendChild(w),s.appendChild(v),i.appendChild(s),c.appendChild(i),p&&i.addEventListener("click",M=>{M.stopPropagation(),p(),x(),m?.()}),g=m??null,f>0&&(d=window.setTimeout(()=>x(),f)),c}function y(e){return H(),n?.parentNode&&(n.parentNode.removeChild(n),b()),n=j(e),document.body.appendChild(n),n.offsetHeight,n.classList.add("banner-show"),{close:x}}var C={showBanner:y},I=C;typeof window<"u"&&(window.banner=C);0&&(module.exports={showBanner});
