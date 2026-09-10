import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('ToolLayout analytics identity', () => {
  it('uses the canonical page slug instead of the navigation slug', () => {
    const layout = readFileSync(join(process.cwd(), 'src/layouts/ToolLayout.astro'), 'utf8');
    expect(layout).toContain("<body data-tool-slug={slug ?? current ?? ''}>");
  });
});
