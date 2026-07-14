# Boycott dataset

`boycott-list.json` is a trimmed snapshot of the [TechForPalestine/boycott-israeli-consumer-goods-dataset](https://github.com/TechForPalestine/boycott-israeli-consumer-goods-dataset)
(aggregates Who Profits, BDS Movement, and AFSC sources into `brands` and `companies`).

Snapshot date: 2026-07-11. No public live API exists for this data, so it's bundled as a static
asset and matched against Open Food Facts `brands`/`manufacturing_places` in `src/lib/boycott.ts`.

## Refreshing the snapshot

```
curl -sS -o /tmp/tfp-data.json \
  https://raw.githubusercontent.com/TechForPalestine/boycott-israeli-consumer-goods-dataset/main/output/json/data.json
node -e "
const fs = require('fs');
const d = require('/tmp/tfp-data.json');
const brands = {};
for (const [id, b] of Object.entries(d.brands)) {
  brands[id] = { id: b.id, name: b.name, status: b.status, reasons: b.reasons || [], stakeholders: (b.stakeholders || []).map(s => s.id) };
}
const companies = {};
for (const [id, c] of Object.entries(d.companies)) {
  companies[id] = { id: c.id, name: c.name, status: c.status };
}
fs.writeFileSync('src/data/boycott-list.json', JSON.stringify({ source: 'https://github.com/TechForPalestine/boycott-israeli-consumer-goods-dataset', snapshotDate: new Date().toISOString().slice(0,10), brands, companies }));
"
```

Update the `snapshotDate` note above after refreshing.
