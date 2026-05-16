#!/usr/bin/env node
// Crawl fmarket.vn public API for all open-end mutual fund certificates.
// Outputs: data/funds.json, data/details/{CODE}.json, data/nav-history/{CODE}.json,
//          data/snapshot-YYYY-MM-DD.json

const fs = require('fs');
const path = require('path');

const BASE = 'https://api.fmarket.vn/res';
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DETAILS_DIR = path.join(DATA_DIR, 'details');
const NAV_DIR = path.join(DATA_DIR, 'nav-history');

const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
  'Accept': 'application/json',
  'Origin': 'https://fmarket.vn',
  'Referer': 'https://fmarket.vn/',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

async function fetchJson(url, opts = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, ...opts });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const json = await res.json();
      if (json.status && json.status !== 200) {
        throw new Error(`API ${json.status}: ${json.message}`);
      }
      return json.data;
    } catch (err) {
      if (i === retries - 1) throw err;
      log(`  retry ${i + 1}/${retries} for ${url}: ${err.message}`);
      await sleep(1000 * (i + 1));
    }
  }
}

async function listFunds() {
  const body = JSON.stringify({
    types: ['NEW_FUND', 'TRADING_FUND'],
    issuerIds: [],
    sortOrder: 'DESC',
    sortField: 'navTo6Months',
    page: 1,
    pageSize: 500,
    isIpo: false,
    fundAssetTypes: [],
    bondRemainPeriods: [],
    searchField: '',
    isBuyByReward: false,
    thirdAppIds: [],
  });
  const data = await fetchJson(`${BASE}/products/filter`, { method: 'POST', body });
  return data.rows;
}

async function fundDetail(id) {
  return fetchJson(`${BASE}/products/${id}`);
}

async function navHistory(id, fromDate = '2014-01-01') {
  const today = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify({ isAllData: 1, productId: id, fromDate, toDate: today });
  return fetchJson(`${BASE}/product/get-nav-history`, { method: 'POST', body });
}

function slimList(rows) {
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    shortName: r.shortName,
    name: r.name,
    nav: r.nav,
    lastYearNav: r.lastYearNav,
    managementFee: r.managementFee,
    avgAnnualReturn: r.avgAnnualReturn,
    riskLevel: r.riskLevel?.name ?? null,
    fundType: r.fundType?.name ?? null,
    assetType: r.dataFundAssetType?.name ?? null,
    assetCode: r.dataFundAssetType?.code ?? null,
    owner: r.owner?.shortName ?? null,
    ownerName: r.owner?.name ?? null,
    status: r.type,
    firstIssueAt: r.firstIssueAt,
    buyMinValue: r.buyMinValue,
    sellMin: r.sellMin,
    completeTransactionDuration: r.completeTransactionDuration,
    websiteURL: r.websiteURL,
    description: r.description,
    nav1M: r.productNavChange?.navTo1Months ?? null,
    nav3M: r.productNavChange?.navTo3Months ?? null,
    nav6M: r.productNavChange?.navTo6Months ?? null,
    nav12M: r.productNavChange?.navTo12Months ?? null,
    nav24M: r.productNavChange?.navTo24Months ?? null,
    nav36M: r.productNavChange?.navTo36Months ?? null,
    nav60M: r.productNavChange?.navTo60Months ?? null,
    navBeginning: r.productNavChange?.navToBeginning ?? null,
    annualizedReturn36M: r.productNavChange?.annualizedReturn36Months ?? null,
  }));
}

function slimDetail(d) {
  return {
    id: d.id,
    code: d.code,
    shortName: d.shortName,
    name: d.name,
    description: d.description,
    nav: d.nav,
    managementFee: d.managementFee,
    buyMinValue: d.buyMinValue,
    sellMin: d.sellMin,
    completeTransactionDuration: d.completeTransactionDuration,
    closedOrderBookAt: d.closedOrderBookAt,
    websiteURL: d.websiteURL,
    firstIssueAt: d.firstIssueAt,
    riskLevel: d.riskLevel,
    fundType: d.fundType,
    assetType: d.dataFundAssetType,
    owner: d.owner
      ? {
          id: d.owner.id,
          name: d.owner.name,
          shortName: d.owner.shortName,
          website: d.owner.website,
          avatarUrl: d.owner.avatarUrl,
        }
      : null,
    productNavChange: d.productNavChange,
    topHoldings: d.productTopHoldingList ?? [],
    topHoldingsBond: d.productTopHoldingBondList ?? [],
    industries: d.productIndustriesHoldingList ?? [],
    assetAllocation: d.productAssetHoldingList ?? [],
    fees: (d.productFeeList ?? []).map((f) => ({
      type: f.type,
      beginVolume: f.beginVolume,
      endVolume: f.endVolume,
      fee: f.fee,
      feeUnitType: f.feeUnitType,
      program: f.productProgram?.name ?? null,
    })),
  };
}

function slimNav(nav) {
  return nav.map((n) => ({ d: n.navDate, v: n.nav }));
}

async function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj));
}

async function main() {
  await ensureDir(DATA_DIR);
  await ensureDir(DETAILS_DIR);
  await ensureDir(NAV_DIR);

  log('Fetching fund list…');
  const rows = await listFunds();
  log(`  → ${rows.length} funds`);

  const slim = slimList(rows);
  const today = new Date().toISOString().slice(0, 10);
  writeJson(path.join(DATA_DIR, 'funds.json'), {
    generatedAt: new Date().toISOString(),
    date: today,
    total: slim.length,
    funds: slim,
  });
  writeJson(path.join(DATA_DIR, `snapshot-${today}.json`), {
    generatedAt: new Date().toISOString(),
    funds: slim,
  });

  log('Fetching details + NAV history per fund…');
  let ok = 0;
  let fail = 0;
  for (const r of rows) {
    try {
      const [detail, nav] = await Promise.all([fundDetail(r.id), navHistory(r.id)]);
      writeJson(path.join(DETAILS_DIR, `${r.code}.json`), slimDetail(detail));
      writeJson(path.join(NAV_DIR, `${r.code}.json`), {
        code: r.code,
        id: r.id,
        history: slimNav(nav),
      });
      ok++;
      if (ok % 10 === 0) log(`  progress ${ok}/${rows.length}`);
    } catch (err) {
      fail++;
      log(`  FAIL ${r.code} (id=${r.id}): ${err.message}`);
    }
    await sleep(150); // be polite
  }
  log(`Done. ok=${ok} fail=${fail}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
