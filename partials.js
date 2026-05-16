// Shared nav, floating referral CTA, and footer — injected into every page.

const REFERRAL_CODE = '007F326665339';

// Detect depth — articles live in /bai-viet/, root pages live at /
function basePrefix() {
  return location.pathname.includes('/bai-viet/') ? '../' : './';
}
const BASE = basePrefix();

const NAV_ITEMS = [
  { href: BASE + 'index.html', label: 'Trang chủ' },
  { href: BASE + 'bai-viet.html', label: 'Hướng dẫn' },
  { href: BASE + 'quy.html', label: 'Xem quỹ' },
  { href: BASE + 'so-sanh.html', label: 'So sánh' },
  { href: BASE + 'tinh-lai.html', label: 'Tính lãi' },
  { href: BASE + 'quiz.html', label: 'Quiz' },
];

function currentPath() {
  const p = location.pathname.split('/').pop() || 'index.html';
  return p;
}

function navHtml() {
  const cur = currentPath();
  const links = NAV_ITEMS.map((it) => {
    const file = it.href.replace('./', '');
    const active = cur === file ? 'active' : '';
    return `<a href="${it.href}" class="nav-link ${active}">${it.label}</a>`;
  }).join('');
  return `
    <nav class="topnav">
      <a class="brand" href="${BASE}index.html">
        <span class="brand-logo">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M32 34 C36 22, 46 18, 52 22 C49 32, 42 38, 32 34 Z" fill="#0a1a14"/>
            <path d="M32 38 C28 30, 20 28, 14 32 C17 40, 24 43, 32 38 Z" fill="#0a1a14" opacity="0.7"/>
            <path d="M32 50 Q32 42 32 36" stroke="#0a1a14" stroke-width="3" stroke-linecap="round" fill="none"/>
            <ellipse cx="32" cy="50" rx="5" ry="3" fill="#f5c451"/>
          </svg>
        </span>
        <span class="brand-text">
          <span class="brand-name">Hạt</span>
          <span class="brand-sub">Đầu tư từ một hạt nhỏ</span>
        </span>
      </a>
      <div class="nav-links">${links}</div>
      <button class="nav-cta" onclick="copyReferral(this)">
        Mã GT: <b>${REFERRAL_CODE}</b>
        <span class="copy-hint">Copy</span>
      </button>
    </nav>`;
}

function footerHtml() {
  return `
    <footer class="site-footer">
      <div class="footer-cta">
        <div>
          <div class="footer-cta-title">Bắt đầu đầu tư từ 100.000đ</div>
          <div class="footer-cta-sub">
            Đăng ký Fmarket, nhập mã <b>${REFERRAL_CODE}</b> để nhận ưu đãi cho người mới.
          </div>
        </div>
        <a class="btn btn-primary" href="https://fmarket.vn" target="_blank" rel="noopener">
          Mở tài khoản Fmarket →
        </a>
      </div>
      <div class="footer-meta">
        Dữ liệu quỹ lấy từ <a href="https://fmarket.vn" target="_blank">fmarket.vn</a> Public API ·
        Cập nhật hàng ngày · Trang dành cho mục đích tham khảo, không phải tư vấn đầu tư.
      </div>
    </footer>`;
}

function floatingCtaHtml() {
  return `
    <div class="floating-cta" id="floatingCta">
      <div class="floating-label">Mã giới thiệu Fmarket</div>
      <div class="floating-code" onclick="copyReferral(this)">
        ${REFERRAL_CODE}
        <span class="copy-mini">📋</span>
      </div>
    </div>`;
}

window.copyReferral = function (el) {
  navigator.clipboard
    .writeText(REFERRAL_CODE)
    .then(() => {
      const orig = el.innerHTML;
      el.classList.add('copied');
      const hintEls = el.querySelectorAll('.copy-hint, .copy-mini');
      hintEls.forEach((h) => (h.textContent = '✓ Đã copy'));
      setTimeout(() => {
        el.classList.remove('copied');
        hintEls.forEach((h) => {
          h.textContent = h.classList.contains('copy-mini') ? '📋' : 'Copy';
        });
      }, 1500);
    })
    .catch(() => alert('Không copy được. Mã: ' + REFERRAL_CODE));
};

function inject() {
  const navSlot = document.getElementById('site-nav');
  if (navSlot) navSlot.innerHTML = navHtml();
  const footerSlot = document.getElementById('site-footer');
  if (footerSlot) footerSlot.innerHTML = footerHtml();
  // Floating CTA always
  if (!document.getElementById('floatingCta')) {
    document.body.insertAdjacentHTML('beforeend', floatingCtaHtml());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inject);
} else {
  inject();
}
