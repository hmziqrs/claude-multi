/**
 * Generates the site footer as a plain HTML string.
 * Used by the Vite plugin to inject the footer at body level
 * (outside Starlight's .page wrapper) for proper full-width rendering.
 */
export function getSiteFooterHtml(version: string): string {
  return `
<footer class="site-footer">
  <div class="site-footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-brand-row">
          <span class="footer-dot"></span>
          <span class="footer-brand-name">claude-multi</span>
        </div>
        <p class="footer-desc">Run Claude Code against 8+ AI providers from the same machine. Each instance is isolated. Plugins sync automatically.</p>
      </div>
      <div class="footer-col">
        <h4 class="footer-heading">Product</h4>
        <ul class="footer-list">
          <li><a href="/docs/getting-started/">Get started</a></li>
          <li><a href="/docs/usage/">Usage</a></li>
          <li><a href="/docs/configuration/">Configuration</a></li>
          <li><a href="/changelog/">Changelog</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-heading">Resources</h4>
        <ul class="footer-list">
          <li><a href="/providers/">Providers</a></li>
          <li><a href="/docs/how-it-works/">How it works</a></li>
          <li><a href="/docs/plugins-mcp/">Plugins &amp; MCP</a></li>
          <li><a href="/faq/">FAQ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-heading">Community</h4>
        <ul class="footer-list">
          <li><a href="/about/">About</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="https://github.com/hmziqrs/claude-multi" target="_blank" rel="noopener">GitHub</a></li>
          <li><a href="https://github.com/hmziqrs/claude-multi/issues" target="_blank" rel="noopener">Issues</a></li>
          <li><a href="/docs/troubleshooting/">Troubleshooting</a></li>
          <li><a href="/docs/contributing/">Contributing</a></li>
          <li><a href="https://hmziq.rs" target="_blank" rel="noopener">hmziq.rs</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-heading">Legal</h4>
        <ul class="footer-list">
          <li><a href="/privacy/">Privacy policy</a></li>
          <li><a href="/terms/">Terms of use</a></li>
          <li><a href="https://github.com/hmziqrs/claude-multi/blob/master/LICENSE" target="_blank" rel="noopener">MIT license</a></li>
        </ul>
      </div>
    </div>
    <hr class="footer-divider" />
    <div class="footer-bottom">
      <span>MIT licensed &copy; 2026 hmziqrs</span>
      <div class="footer-bottom-links">
        <a href="/sitemap-index.xml">Sitemap</a>
        <span class="footer-version">v${version}</span>
      </div>
    </div>
  </div>
</footer>`;
}
