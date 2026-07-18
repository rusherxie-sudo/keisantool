import { describe, expect, it } from 'vitest';
import { buildLlms } from '../src/lib/llms.js';
import { tools } from '../src/data/tools.js';

describe('llms.txt generator', () => {
  it('lists every live tool exactly once', () => {
    const document = buildLlms();
    const links = document.match(/https:\/\/keisantool\.com\/[^/]+\//g) ?? [];
    const liveTools = tools.filter((tool) => tool.live !== false);
    expect(links.filter((link) => !link.includes('/blog/') && !link.includes('/about/') && !link.includes('/privacy/') && !link.includes('/terms/') && !link.includes('/contact/'))).toHaveLength(liveTools.length);
    for (const tool of liveTools) expect(document).toContain(`https://keisantool.com/${tool.slug}/`);
  });
});
