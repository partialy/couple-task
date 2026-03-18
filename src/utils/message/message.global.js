"use strict";(()=>{var t={question:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8.75c-.69 0-1.25.56-1.25 1.25v.107a.75.75 0 1 1-1.5 0V10A2.75 2.75 0 0 1 12 7.25h.116a2.634 2.634 0 0 1 1.714 4.633l-.77.66a.9.9 0 0 0-.31.674v.533a.75.75 0 0 1-1.5 0v-.533c0-.697.304-1.359.833-1.812l.771-.66a1.134 1.134 0 0 0-.738-1.995zM12 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path fill="currentColor" d="M3.25 12a8.75 8.75 0 1 1 17.5 0a8.75 8.75 0 0 1-17.5 0M12 4.75a7.25 7.25 0 1 0 0 14.5a7.25 7.25 0 0 0 0-14.5"/></svg>',success_square:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.53 10.53a.75.75 0 1 0-1.06-1.06L11 12.94l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"/><path fill="currentColor" d="M12.633 4.25h-1.266c-1.092 0-1.958 0-2.655.057c-.714.058-1.317.18-1.868.46a4.75 4.75 0 0 0-2.076 2.077c-.281.55-.403 1.154-.461 1.868c-.057.697-.057 1.563-.057 2.655v1.266c0 1.092 0 1.958.057 2.655c.058.714.18 1.317.46 1.869a4.75 4.75 0 0 0 2.077 2.075c.55.281 1.154.403 1.868.461c.697.057 1.563.057 2.655.057h1.266c1.092 0 1.958 0 2.655-.057c.714-.058 1.317-.18 1.869-.46a4.75 4.75 0 0 0 2.075-2.076c.281-.552.403-1.155.461-1.869c.057-.697.057-1.563.057-2.655v-1.266c0-1.092 0-1.958-.057-2.655c-.058-.714-.18-1.317-.46-1.868a4.75 4.75 0 0 0-2.076-2.076c-.552-.281-1.155-.403-1.869-.461c-.697-.057-1.563-.057-2.655-.057M7.525 6.104c.304-.155.688-.251 1.309-.302c.63-.051 1.434-.052 2.566-.052h1.2c1.133 0 1.937 0 2.566.052c.62.05 1.005.147 1.31.302a3.25 3.25 0 0 1 1.42 1.42c.155.305.251.69.302 1.31c.051.63.052 1.434.052 2.566v1.2c0 1.133 0 1.937-.052 2.566c-.05.62-.147 1.005-.302 1.31a3.25 3.25 0 0 1-1.42 1.42c-.305.155-.69.251-1.31.302c-.63.051-1.434.052-2.566.052h-1.2c-1.133 0-1.937 0-2.566-.052c-.62-.05-1.005-.147-1.31-.302a3.25 3.25 0 0 1-1.42-1.42c-.155-.305-.251-.69-.302-1.31c-.051-.63-.052-1.434-.052-2.566v-1.2c0-1.133 0-1.937.052-2.566c.05-.62.147-1.005.302-1.31a3.25 3.25 0 0 1 1.42-1.42"/></svg>',success_circle:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.53 10.53a.75.75 0 1 0-1.06-1.06L11 12.94l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"/><path fill="currentColor" d="M12 20.75a8.75 8.75 0 1 1 0-17.5a8.75 8.75 0 0 1 0 17.5M4.75 12a7.25 7.25 0 1 0 14.5 0a7.25 7.25 0 0 0-14.5 0"/></svg>',success:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.53 10.53a.75.75 0 1 0-1.06-1.06L11 12.94l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"/><path fill="currentColor" d="M12 20.75a8.75 8.75 0 1 1 0-17.5a8.75 8.75 0 0 1 0 17.5M4.75 12a7.25 7.25 0 1 0 14.5 0a7.25 7.25 0 0 0-14.5 0"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10.756 9.4C10.686 8.65 11.264 8 12 8s1.313.649 1.244 1.4l-.494 4.15a.76.76 0 0 1-.75.7a.76.76 0 0 1-.75-.7zm2.494 7.35a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0"/><path fill="currentColor" fill-rule="evenodd" d="M13.164 3.492a2.92 2.92 0 0 0-2.328 0c-.506.22-.881.634-1.222 1.115c-.338.477-.711 1.123-1.173 1.923l-4.815 8.34c-.438.758-.794 1.374-1.026 1.881c-.235.51-.4 1.025-.336 1.558c.095.782.526 1.48 1.175 1.929c.438.303.97.411 1.543.462c.57.05 1.3.05 2.205.05h9.626c.905 0 1.635 0 2.205-.05c.573-.05 1.105-.16 1.543-.462a2.75 2.75 0 0 0 1.175-1.929c.065-.533-.102-1.047-.336-1.558c-.232-.507-.588-1.123-1.026-1.882l-4.815-8.34c-.462-.799-.835-1.445-1.173-1.922c-.34-.48-.716-.894-1.222-1.115m-1.729 1.375a1.42 1.42 0 0 1 1.13 0c.123.054.303.192.597.608c.293.413.632.998 1.117 1.839l4.776 8.272c.463.8.782 1.356.982 1.79c.201.44.223.64.21.752a1.25 1.25 0 0 1-.54.876c-.11.076-.32.157-.82.201c-.497.044-1.16.045-2.11.045H7.223c-.951 0-1.614 0-2.11-.044c-.5-.045-.711-.126-.821-.202a1.25 1.25 0 0 1-.54-.876c-.013-.111.009-.313.21-.751c.2-.435.52-.99.982-1.791L9.72 7.314c.485-.841.824-1.426 1.117-1.84s.474-.553.597-.607" clip-rule="evenodd"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.53 8.47a.75.75 0 0 0-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 1 0 1.06 1.06L12 13.06l2.47 2.47a.75.75 0 1 0 1.06-1.06L13.06 12l2.47-2.47a.75.75 0 0 0-1.06-1.06L12 10.94z"/><path fill="currentColor" d="M12 3.25a8.75 8.75 0 1 0 0 17.5a8.75 8.75 0 0 0 0-17.5M4.75 12a7.25 7.25 0 1 1 14.5 0a7.25 7.25 0 0 1-14.5 0"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-.736 0-1.313.649-1.244 1.4l.494 4.15a.76.76 0 0 0 .75.7a.76.76 0 0 0 .75-.7l.494-4.15C13.314 7.65 12.736 7 12 7m0 10a1.25 1.25 0 1 0 0-2.5a1.25 1.25 0 0 0 0 2.5"/><path fill="currentColor" d="M12 4.75a7.25 7.25 0 1 0 0 14.5a7.25 7.25 0 0 0 0-14.5M3.25 12a8.75 8.75 0 1 1 17.5 0a8.75 8.75 0 0 1-17.5 0"/></svg>',loading:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="message-spinner"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',rightArrow:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m0 0l-6-6m6 6l-6 6"/></svg>'};var f={success:t.success,warning:t.warning,error:t.error,info:t.info,loading:t.loading},a=null,h=0;function w(){return a||(a=document.createElement("div"),a.className="message-container",document.body.appendChild(a),u()),a}function u(){let e=document.createElement("style");e.textContent=`
    /* \u6D88\u606F\u5BB9\u5668\u6837\u5F0F */
    .message-container {
      position: fixed;
      top: var(--message-container-top, 20px);
      left: 50%;
      transform: translateX(-50%);
      z-index: var(--message-container-z-index, 9999);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--message-container-gap, 12px);
      pointer-events: none;
    }

    /* \u5355\u4E2A\u6D88\u606F\u6837\u5F0F */
    .message-item {
      pointer-events: auto;
      min-width: var(--message-min-width, 300px);
      max-width: var(--message-max-width, 500px);
      padding: var(--message-padding, 14px 18px);
      border-radius: var(--message-border-radius, 8px);
      font-size: var(--message-font-size, 14px);
      line-height: var(--message-line-height, 1.5);
      box-shadow: var(--message-box-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;
      overflow: hidden;
      opacity: 0;
      transform: translateY(-20px);
      transition: 
        opacity var(--message-transition-duration, 0.3s) ease,
        transform var(--message-transition-duration, 0.3s) ease,
        margin-bottom var(--message-transition-duration, 0.3s) ease;
      box-sizing: border-box;
    }

    /* \u6D88\u606F\u663E\u793A\u72B6\u6001 */
    .message-item.message-show {
      opacity: 1;
      transform: translateY(0);
    }

    /* \u6D88\u606F\u9690\u85CF\u72B6\u6001 */
    .message-item.message-hide {
      opacity: 0;
      transform: translateY(-20px);
      margin-bottom: -100%;
    }

    /* \u6210\u529F\u6D88\u606F\u6837\u5F0F */
    .message-item.message-type-success {
      background-color: var(--message-success-bg-color, #f0fdf4);
      border: 1px solid var(--message-success-border-color, #86efac);
      color: var(--message-success-text-color, #166534);
    }

    .message-item.message-type-success .message-icon {
      color: var(--message-success-icon-color, #22c55e);
    }

    /* \u8B66\u544A\u6D88\u606F\u6837\u5F0F */
    .message-item.message-type-warning {
      background-color: var(--message-warning-bg-color, #fffbeb);
      border: 1px solid var(--message-warning-border-color, #fcd34d);
      color: var(--message-warning-text-color, #92400e);
    }

    .message-item.message-type-warning .message-icon {
      color: var(--message-warning-icon-color, #f59e0b);
    }

    /* \u9519\u8BEF\u6D88\u606F\u6837\u5F0F */
    .message-item.message-type-error {
      background-color: var(--message-error-bg-color, #fef2f2);
      border: 1px solid var(--message-error-border-color, #fca5a5);
      color: var(--message-error-text-color, #991b1b);
    }

    .message-item.message-type-error .message-icon {
      color: var(--message-error-icon-color, #ef4444);
    }

    /* \u4FE1\u606F\u6D88\u606F\u6837\u5F0F */
    .message-item.message-type-info {
      background-color: var(--message-info-bg-color, #eff6ff);
      border: 1px solid var(--message-info-border-color, #93c5fd);
      color: var(--message-info-text-color, #1e40af);
    }

    .message-item.message-type-info .message-icon {
      color: var(--message-info-icon-color, #3b82f6);
    }

    /* \u52A0\u8F7D\u6D88\u606F\u6837\u5F0F */
    .message-item.message-type-loading {
      background-color: var(--message-loading-bg-color, #f8fafc);
      border: 1px solid var(--message-loading-border-color, #e2e8f0);
      color: var(--message-loading-text-color, #475569);
    }

    .message-item.message-type-loading .message-icon {
      color: var(--message-loading-icon-color, #64748b);
    }

    /* \u56FE\u6807\u6837\u5F0F */
    .message-icon {
      width: var(--message-icon-size, 18px);
      height: var(--message-icon-size, 18px);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .message-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* \u52A0\u8F7D\u52A8\u753B */
    .message-spinner {
      animation: message-spin 1s linear infinite;
    }

    @keyframes message-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* \u6D88\u606F\u5185\u5BB9 */
    .message-content {
      flex: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* \u5173\u95ED\u6309\u94AE */
    .message-close {
      width: var(--message-close-btn-size, 18px);
      height: var(--message-close-btn-size, 18px);
      flex-shrink: 0;
      cursor: pointer;
      color: var(--message-close-btn-color, #94a3b8);
      transition: color 0.2s ease;
    }

    .message-close:hover {
      color: var(--message-close-btn-hover-color, #475569);
    }

    .message-close svg {
      width: 100%;
      height: 100%;
    }
  `,document.head.appendChild(e)}function x(e){let{content:s,type:i="info",icon:c,closable:g=!1,onClose:n}=e,o=document.createElement("div");o.className=`message-item message-type-${i}`,o.setAttribute("data-message-id",String(++h));let m=document.createElement("div");m.className="message-icon",m.innerHTML=c||f[i],o.appendChild(m);let d=document.createElement("div");if(d.className="message-content",d.textContent=s,o.appendChild(d),g){let l=document.createElement("div");l.className="message-close",l.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',l.addEventListener("click",()=>{p(o,n)}),o.appendChild(l)}return o}function p(e,s){e.classList.remove("message-show"),e.classList.add("message-hide"),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e),s&&s(),a&&a.children.length===0&&(document.body.removeChild(a),a=null)},300)}function r(e){let s=typeof e=="string"?{content:e}:e,{duration:i=3e3,onClose:c}=s,g=w(),n=x(s);g.appendChild(n),n.offsetHeight,n.classList.add("message-show");let o=null;return i>0&&(o=window.setTimeout(()=>{p(n,c)},i)),{close:()=>{o!==null&&clearTimeout(o),p(n,c)}}}function y(e,s){return r({content:e,type:"success",...s})}function b(e,s){return r({content:e,type:"warning",...s})}function M(e,s){return r({content:e,type:"error",...s})}function C(e,s){return r({content:e,type:"info",...s})}function k(e,s){return r({content:e,type:"loading",duration:0,...s})}var v={show:r,success:y,warning:b,error:M,info:C,loading:k};typeof window<"u"&&(window.message=v);var O=v;})();
