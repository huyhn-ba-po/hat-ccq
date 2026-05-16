// Dashboard for fund certificates. Loads ../data/funds.json and renders.

const FMT_VND = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const FMT_PCT = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const state = {
  all: [],
  filtered: [],
  search: '',
  type: 'ALL',
  owner: '',
  sortKey: 'nav6M',
  sortDir: 'desc',
};

function fmtNum(v) {
  if (v == null) return '<span class="muted">—</span>';
  return FMT_VND.format(v);
}
function fmtPct(v) {
  if (v == null) return '<span class="muted">—</span>';
  const cls = v > 0 ? 'pos' : v < 0 ? 'neg' : 'muted';
  const sign = v > 0 ? '+' : '';
  return `<span class="num ${cls}">${sign}${FMT_PCT.format(v)}%</span>`;
}
function fmtMoney(v) {
  if (v == null) return '<span class="muted">—</span>';
  if (v >= 1e9) return FMT_VND.format(v / 1e9) + ' tỷ';
  if (v >= 1e6) return FMT_VND.format(v / 1e6) + ' tr';
  return FMT_VND.format(v);
}

function assetBadge(code) {
  if (code === 'STOCK') return '<span class="badge stock">Cổ phiếu</span>';
  if (code === 'BOND') return '<span class="badge bond">Trái phiếu</span>';
  if (code === 'BALANCED') return '<span class="badge balance">Cân bằng</span>';
  return `<span class="badge">${code || '—'}</span>`;
}

async function load() {
  const res = await fetch('./data/funds.json?_=' + Date.now());
  const json = await res.json();
  state.all = json.funds;
  document.getElementById('totalCount').textContent = json.total;
  document.getElementById('updatedAt').textContent = json.date;

  const cnt = { STOCK: 0, BOND: 0, BALANCED: 0 };
  state.all.forEach((f) => {
    if (cnt[f.assetCode] != null) cnt[f.assetCode]++;
  });
  document.getElementById('cntStock').textContent = cnt.STOCK;
  document.getElementById('cntBond').textContent = cnt.BOND;
  document.getElementById('cntBalance').textContent = cnt.BALANCED;

  const top = [...state.all]
    .filter((f) => f.nav6M != null)
    .sort((a, b) => b.nav6M - a.nav6M)[0];
  if (top) {
    document.getElementById('topReturn').innerHTML = `+${FMT_PCT.format(top.nav6M)}%`;
    document.getElementById('topReturnCode').textContent = `${top.code} · 6 tháng`;
  }

  const owners = [...new Set(state.all.map((f) => f.owner).filter(Boolean))].sort();
  const sel = document.getElementById('ownerSelect');
  owners.forEach((o) => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    sel.appendChild(opt);
  });

  bindUi();
  apply();
}

function bindUi() {
  document.getElementById('search').addEventListener('input', (e) => {
    state.search = e.target.value.trim().toLowerCase();
    apply();
  });
  document.getElementById('ownerSelect').addEventListener('change', (e) => {
    state.owner = e.target.value;
    apply();
  });
  document.querySelectorAll('#typeChips .chip').forEach((c) => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#typeChips .chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      state.type = c.dataset.type;
      apply();
    });
  });
  document.querySelectorAll('th.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
      } else {
        state.sortKey = key;
        state.sortDir = 'desc';
      }
      document.querySelectorAll('th.sortable').forEach((x) => {
        x.classList.remove('active', 'asc');
      });
      th.classList.add('active');
      if (state.sortDir === 'asc') th.classList.add('asc');
      apply();
    });
  });
}

function apply() {
  let rows = state.all;
  if (state.type !== 'ALL') rows = rows.filter((f) => f.assetCode === state.type);
  if (state.owner) rows = rows.filter((f) => f.owner === state.owner);
  if (state.search) {
    const q = state.search;
    rows = rows.filter(
      (f) =>
        (f.code && f.code.toLowerCase().includes(q)) ||
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.shortName && f.shortName.toLowerCase().includes(q)) ||
        (f.owner && f.owner.toLowerCase().includes(q)),
    );
  }
  const k = state.sortKey;
  const dir = state.sortDir === 'asc' ? 1 : -1;
  rows = [...rows].sort((a, b) => {
    const va = a[k];
    const vb = b[k];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') return va.localeCompare(vb) * dir;
    return (va - vb) * dir;
  });
  state.filtered = rows;
  render();
}

function render() {
  const body = document.getElementById('fundsBody');
  if (!state.filtered.length) {
    body.innerHTML = `<tr><td colspan="13" class="loader">Không có quỹ nào khớp.</td></tr>`;
    return;
  }
  body.innerHTML = state.filtered
    .map(
      (f) => `
    <tr>
      <td class="l">
        <div class="code-cell">
          <a class="code" href="fund.html?code=${encodeURIComponent(f.code)}">${f.code}</a>
          <span class="name">${f.shortName ?? ''} — ${f.name ?? ''}</span>
        </div>
      </td>
      <td class="l">${assetBadge(f.assetCode)}</td>
      <td class="l muted">${f.owner ?? '—'}</td>
      <td><span class="num">${fmtNum(f.nav)}</span></td>
      <td>${fmtPct(f.nav1M)}</td>
      <td>${fmtPct(f.nav3M)}</td>
      <td>${fmtPct(f.nav6M)}</td>
      <td>${fmtPct(f.nav12M)}</td>
      <td>${fmtPct(f.nav36M)}</td>
      <td>${fmtPct(f.navBeginning)}</td>
      <td><span class="num">${f.managementFee != null ? FMT_PCT.format(f.managementFee) + '%' : '—'}</span></td>
      <td><span class="num">${fmtMoney(f.buyMinValue)}</span></td>
      <td class="muted">${f.riskLevel ?? '—'}</td>
    </tr>
  `,
    )
    .join('');
}

load().catch((err) => {
  document.getElementById('fundsBody').innerHTML = `
    <tr><td colspan="13" class="loader neg">Lỗi tải data: ${err.message}</td></tr>`;
});
