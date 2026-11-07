// Prefer the same task (shared tool) within the article's category; deterministic ties.
export function relatedPosts(posts, current, category, count = 3) {
  const currentTools = new Set(posts.find(p => p.id === current)?.data.relatedTools || []);
  const overlap = p => (p.data.relatedTools || []).filter(tool => currentTools.has(tool)).length;
  return posts.filter(p => p.id !== current).sort((a,b) =>
    Number(b.data.category === category) - Number(a.data.category === category) ||
    overlap(b) - overlap(a) || a.id.localeCompare(b.id)
  ).slice(0, count);
}
