// Published mirror of RushPass Wix Cart Custom Element (`<rushpass-wix-toggle>`)
// Source of truth: ventures/rushpass/wix/storefront-widget/rushpass-wix-widget.js
class RushPassWixToggle extends HTMLElement {
  static get observedAttributes() { return ["instance-id", "api-base"]; }
  constructor() { super(); this.attachShadow({ mode: "open" }); this._config = null; this._checked = false; }
  connectedCallback() { this._loadConfig(); }
  attributeChangedCallback() { this._loadConfig(); }
  async _loadConfig() {
    const instanceId = this.getAttribute("instance-id") || "";
    const apiBase = (this.getAttribute("api-base") || "https://rushpass.actpack.workers.dev").replace(/\/$/, "");
    if (!instanceId) { this.shadowRoot.innerHTML = ""; return; }
    try {
      const res = await fetch(`${apiBase}/api/storefront/config?platform=wix&instanceId=${encodeURIComponent(instanceId)}`);
      if (!res.ok) { this.shadowRoot.innerHTML = ""; return; }
      const cfg = await res.json();
      if (!cfg || !cfg.enabled) { this.shadowRoot.innerHTML = ""; return; }
      this._config = cfg;
      this._render();
    } catch { this.shadowRoot.innerHTML = ""; }
  }
  _formatPrice(cents, currency) {
    const amt = (Number(cents || 0) / 100).toFixed(2);
    const symbols = { USD: "$", CAD: "CA$", AUD: "A$", EUR: "€", GBP: "£" };
    return `${symbols[currency] || `${currency} `}${amt}`;
  }
  _render() {
    const c = this._config;
    const priceText = `+${this._formatPrice(c.feeCents, c.currency)}`;
    this.shadowRoot.innerHTML = `
      <style>
        .rp-card{display:flex;align-items:flex-start;gap:12px;padding:13px 14px;border:1.5px solid ${this._checked ? "#d97706" : "#d1d5db"};border-radius:10px;background:${this._checked ? "#fffbeb" : "#ffffff"};font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;margin:10px 0}
        .rp-cb{width:18px;height:18px;margin-top:2px;accent-color:#d97706;cursor:pointer;flex-shrink:0}
        .rp-body{flex:1;min-width:0}
        .rp-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:700;font-size:14px;color:#111827}
        .rp-price{color:#b45309;font-weight:800;white-space:nowrap}
        .rp-sub{margin-top:4px;font-size:12px;line-height:1.4;color:#4b5563}
      </style>
      <label class="rp-card">
        <input class="rp-cb" type="checkbox" ${this._checked ? "checked" : ""} aria-label="${c.label}" />
        <div class="rp-body">
          <div class="rp-top"><span>⚡ ${c.label}</span><span class="rp-price">${priceText}</span></div>
          <div class="rp-sub">${c.subtitle}</div>
        </div>
      </label>`;
    const cb = this.shadowRoot.querySelector(".rp-cb");
    cb.addEventListener("change", () => {
      this._checked = cb.checked;
      this._render();
      this.dispatchEvent(new CustomEvent("rushpass-toggle", {
        bubbles: true, composed: true,
        detail: { optedIn: this._checked, feeCents: c.feeCents, currency: c.currency, label: c.label },
      }));
    });
  }
}
if (!customElements.get("rushpass-wix-toggle")) customElements.define("rushpass-wix-toggle", RushPassWixToggle);
