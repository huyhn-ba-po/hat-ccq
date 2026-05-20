// Detail page for one fund.

const FMT_VND = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const FMT_PCT = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const params = new URLSearchParams(location.search);
const CODE = params.get('code');

function fmtPct(v, signed = true) {
  if (v == null) return '<span class="muted">—</span>';
  const cls = v > 0 ? 'pos' : v < 0 ? 'neg' : 'muted';
  const sign = signed && v > 0 ? '+' : '';
  return `<span class="num ${cls}">${sign}${FMT_PCT.format(v)}%</span>`;
}
function fmtVnd(v) {
  if (v == null) return '—';
  return FMT_VND.format(v);
}
function fmtMoney(v) {
  if (v == null) return '—';
  if (v >= 1e9) return FMT_VND.format(v / 1e9) + ' tỷ';
  if (v >= 1e6) return FMT_VND.format(v / 1e6) + ' triệu';
  return FMT_VND.format(v);
}
function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('vi-VN');
}
function assetBadge(code) {
  if (code === 'STOCK') return '<span class="badge stock">Cổ phiếu</span>';
  if (code === 'BOND') return '<span class="badge bond">Trái phiếu</span>';
  if (code === 'BALANCED') return '<span class="badge balance">Cân bằng</span>';
  return `<span class="badge">${code || '—'}</span>`;
}

async function loadJson(url) {
  const res = await fetch(url + '?_=' + Date.now());
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

function renderError(msg) {
  document.getElementById('root').innerHTML = `
    <a class="back-link" href="./quy.html">← Về danh sách</a>
    <div class="section"><p class="empty">${msg}</p></div>`;
}

async function main() {
  if (!CODE) return renderError('Thiếu tham số ?code=…');
  let detail, nav;
  try {
    [detail, nav] = await Promise.all([
      loadJson(`./data/details/${CODE}.json`),
      loadJson(`./data/nav-history/${CODE}.json`),
    ]);
  } catch (err) {
    return renderError('Không tìm thấy data cho quỹ ' + CODE);
  }

  document.title = `${CODE} — ${detail.shortName} | CCQ Dashboard`;
  const ch = detail.productNavChange ?? {};

  const root = document.getElementById('root');
  root.innerHTML = `
    <a class="back-link" href="./quy.html">← Về danh sách</a>

    <div class="detail-hero">
      <div>
        <div class="hero-code">${detail.code}</div>
        <div class="hero-name">${detail.name}</div>
        <div class="hero-owner">${detail.owner?.name ?? '—'}</div>
        <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap">
          ${assetBadge(detail.assetType?.code)}
          <span class="badge">${detail.fundType?.name ?? '—'}</span>
          <span class="badge">Rủi ro: ${detail.riskLevel?.name ?? '—'}</span>
          <span class="badge">T+${detail.completeTransactionDuration ?? '?'}</span>
        </div>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="label">NAV/CCQ hiện tại</div>
          <div class="value num">${fmtVnd(detail.nav)} <span style="font-size:13px; color:var(--text-3)">VND</span></div>
        </div>
        <div class="hero-stat">
          <div class="label">Từ thành lập</div>
          <div class="value">${fmtPct(ch.navToBeginning)}</div>
        </div>
        <div class="hero-stat">
          <div class="label">Lợi nhuận YoY</div>
          <div class="value">${fmtPct(ch.navToLastYear)}</div>
        </div>
        <div class="hero-stat">
          <div class="label">Annualized 3Y</div>
          <div class="value">${fmtPct(ch.annualizedReturn36Months)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Hiệu suất</h3>
      <div class="perf-grid">
        <div class="perf-cell"><div class="label">1 tháng</div><div class="value">${fmtPct(ch.navTo1Months)}</div></div>
        <div class="perf-cell"><div class="label">3 tháng</div><div class="value">${fmtPct(ch.navTo3Months)}</div></div>
        <div class="perf-cell"><div class="label">6 tháng</div><div class="value">${fmtPct(ch.navTo6Months)}</div></div>
        <div class="perf-cell"><div class="label">12 tháng</div><div class="value">${fmtPct(ch.navTo12Months)}</div></div>
        <div class="perf-cell"><div class="label">24 tháng</div><div class="value">${fmtPct(ch.navTo24Months)}</div></div>
        <div class="perf-cell"><div class="label">36 tháng</div><div class="value">${fmtPct(ch.navTo36Months)}</div></div>
        <div class="perf-cell"><div class="label">60 tháng</div><div class="value">${fmtPct(ch.navTo60Months)}</div></div>
      </div>
    </div>

    <div class="section">
      <h3>Lịch sử NAV/CCQ</h3>
      <div class="chart-wrap"><canvas id="navChart"></canvas></div>
      <div id="navChartNote" style="margin-top:8px; font-size:12px; color:var(--text-3); text-align:right"></div>
    </div>

    <div class="grid-2">
      <div class="section">
        <h3>Phân bổ tài sản</h3>
        <div id="assetAlloc">${renderBars(detail.assetAllocation, 'assetType')}</div>
      </div>
      <div class="section">
        <h3>Phân bổ ngành</h3>
        <div id="industries">${renderBars(detail.industries, null, 'industry')}</div>
      </div>
    </div>

    <div class="section">
      <h3>Top nắm giữ</h3>
      <div class="holding-list">
        ${
          (detail.topHoldings && detail.topHoldings.length)
            ? detail.topHoldings
                .map(
                  (h) => `
          <div class="holding-row">
            <div class="ticker">${h.stockCode}</div>
            <div class="industry">${h.industry ?? ''}</div>
            <div class="price num">${h.price ?? ''}</div>
            <div class="pct">${FMT_PCT.format(h.netAssetPercent)}%</div>
          </div>`,
                )
                .join('')
            : detail.topHoldingsBond && detail.topHoldingsBond.length
              ? detail.topHoldingsBond
                  .map(
                    (h) => `
            <div class="holding-row">
              <div class="ticker">${h.stockCode ?? h.bondCode ?? '—'}</div>
              <div class="industry">${h.industry ?? h.issuerName ?? ''}</div>
              <div class="price num">${h.price ?? ''}</div>
              <div class="pct">${FMT_PCT.format(h.netAssetPercent ?? 0)}%</div>
            </div>`,
                  )
                  .join('')
              : '<div class="empty">Chưa có dữ liệu top holdings</div>'
        }
      </div>
    </div>

    <div class="grid-2">
      <div class="section">
        <h3>Thông tin giao dịch</h3>
        <dl class="kv">
          <dt>Phí quản lý</dt><dd>${detail.managementFee != null ? FMT_PCT.format(detail.managementFee) + '% / năm' : '—'}</dd>
          <dt>Mua tối thiểu</dt><dd>${fmtMoney(detail.buyMinValue)} VND</dd>
          <dt>Bán tối thiểu</dt><dd>${detail.sellMin ?? '—'} CCQ</dd>
          <dt>Chu kỳ giao dịch</dt><dd>T+${detail.completeTransactionDuration ?? '?'}</dd>
          <dt>Cắt sổ lệnh</dt><dd>${detail.closedOrderBookAt ?? '—'}</dd>
          <dt>Ngày thành lập</dt><dd>${fmtDate(detail.firstIssueAt)}</dd>
          <dt>Website</dt><dd>${detail.websiteURL ? `<a href="${detail.websiteURL}" target="_blank">${detail.websiteURL}</a>` : '—'}</dd>
        </dl>
      </div>
      <div class="section">
        <h3>Phí mua/bán theo bậc</h3>
        ${renderFeeTable(detail.fees)}
      </div>
    </div>

    <div class="section">
      <h3>Mô tả</h3>
      <p style="color: var(--text-2); line-height: 1.6;">${detail.description ?? '—'}</p>
    </div>
  `;

  drawChart(nav.history, detail);
}

function renderBars(items, codeField, labelField) {
  if (!items || !items.length) return '<div class="empty">Chưa có dữ liệu</div>';
  const max = Math.max(...items.map((i) => i.assetPercent ?? 0)) || 1;
  return items
    .map((it) => {
      const label = labelField
        ? it[labelField]
        : it.assetType?.name ?? '—';
      const pct = it.assetPercent ?? 0;
      return `
        <div class="bar">
          <div class="label">${label}</div>
          <div class="track"><div class="fill" style="width:${(pct / max) * 100}%"></div></div>
          <div class="pct">${FMT_PCT.format(pct)}%</div>
        </div>`;
    })
    .join('');
}

function renderFeeTable(fees) {
  if (!fees || !fees.length) return '<div class="empty">Chưa có dữ liệu phí</div>';
  const byType = { BUY: [], SELL: [] };
  fees.forEach((f) => {
    if (byType[f.type]) byType[f.type].push(f);
  });
  const fmtRange = (f) => {
    const begin = f.beginVolume != null ? FMT_VND.format(f.beginVolume) : '0';
    const end = f.endVolume != null ? FMT_VND.format(f.endVolume) : '∞';
    return `${begin} – ${end}`;
  };
  const rows = [];
  if (byType.BUY.length) {
    rows.push('<tr><td colspan="3" style="color:var(--accent); font-weight:600">MUA</td></tr>');
    byType.BUY.forEach((f) =>
      rows.push(
        `<tr><td>${fmtRange(f)}</td><td class="num">${FMT_PCT.format(f.fee)}%</td><td class="muted">${f.program ?? ''}</td></tr>`,
      ),
    );
  }
  if (byType.SELL.length) {
    rows.push('<tr><td colspan="3" style="color:var(--accent-2); font-weight:600">BÁN</td></tr>');
    byType.SELL.forEach((f) => {
      const range = f.isUnitByDay
        ? `Nắm giữ ${f.beginVolume ?? 0} – ${f.endVolume ?? '∞'} ngày`
        : fmtRange(f);
      rows.push(
        `<tr><td>${range}</td><td class="num">${FMT_PCT.format(f.fee)}%</td><td class="muted">${f.program ?? ''}</td></tr>`,
      );
    });
  }
  return `
    <div class="fee-table-wrap">
      <table class="fee-table">
        <thead><tr><th>Khoảng / thời gian</th><th>Phí</th><th>Chương trình</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>`;
}

function drawChart(history, detail) {
  if (!history || !history.length) return;

  // Reduce density: take ~250 points max for nice rendering
  const step = Math.max(1, Math.floor(history.length / 250));
  const points = history.filter((_, i) => i % step === 0);

  // Append current NAV as extra point if history is stale (>7 days behind today)
  const lastDate = history[history.length - 1].d;
  const today = new Date().toISOString().slice(0, 10);
  const daysGap = Math.floor((new Date(today) - new Date(lastDate)) / 86400000);
  const noteEl = document.getElementById('navChartNote');
  if (daysGap > 7 && detail?.nav) {
    points.push({ d: today, v: detail.nav });
    if (noteEl) {
      noteEl.innerHTML = `Lịch sử chi tiết từ Fmarket cập nhật đến <b>${lastDate}</b> · NAV hiện tại <b>${FMT_VND.format(detail.nav)} đ</b> (${daysGap} ngày sau)`;
    }
  } else if (noteEl) {
    noteEl.innerHTML = `Cập nhật đến <b>${lastDate}</b>`;
  }

  const ctx = document.getElementById('navChart').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 380);
  gradient.addColorStop(0, 'rgba(122, 162, 255, 0.45)');
  gradient.addColorStop(1, 'rgba(122, 162, 255, 0.02)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: points.map((p) => p.d),
      datasets: [
        {
          label: 'NAV/CCQ',
          data: points.map((p) => p.v),
          borderColor: '#7aa2ff',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#121925',
          borderColor: '#2b3a52',
          borderWidth: 1,
          padding: 10,
          titleColor: '#e6edf7',
          bodyColor: '#97a3b6',
          callbacks: {
            label: (c) => 'NAV: ' + FMT_VND.format(c.parsed.y) + ' VND',
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#5b6577', maxTicksLimit: 8 },
          grid: { color: 'rgba(31, 42, 58, 0.6)' },
        },
        y: {
          ticks: {
            color: '#5b6577',
            callback: (v) => FMT_VND.format(v),
          },
          grid: { color: 'rgba(31, 42, 58, 0.6)' },
        },
      },
    },
  });
}

main();
