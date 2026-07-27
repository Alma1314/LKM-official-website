// Post-build: pre-compress text-based static assets with gzip & brotli.
// The Node standalone server will serve .gz/.br files with proper Content-Encoding.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { glob } from 'tinyglobby';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';

const DIST = 'dist/client';

const compressible = /\.(html|css|js|xml|txt|json|svg|ico)$/i;
const skipOver = 2_000; // skip files < 2KB

const files = await glob(`${DIST}/**/*`, { absolute: false, onlyFiles: true });

let count = 0;
let totalSaved = 0;

for (const file of files) {
  if (!compressible.test(file)) continue;
  const size = statSync(file).size;
  if (size < skipOver) continue;

  const original = readFileSync(file);

  const gzPath = file + '.gz';
  const brPath = file + '.br';

  writeFileSync(gzPath, gzipSync(original, { level: 9 }));
  writeFileSync(brPath, brotliCompressSync(original, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }));

  totalSaved += size;
  count += 2;
}

console.log(`Pre-compressed: ${count} files generated (${(totalSaved / 1024).toFixed(0)} KB total sources)`);
