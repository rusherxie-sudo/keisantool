import { it, expect } from 'vitest';
import { relatedPosts } from '../src/lib/related-posts.js';
const post=(id,category,relatedTools=[])=>({id,data:{category,relatedTools}});
it('prefers overlapping tool tasks over arbitrary collection order; excludes itself',()=>{
 const posts=[post('tax','tax',['shotokuzei']),post('other','insurance',['shakaihoken']),post('relief','insurance',['kokuho']),post('calculation','insurance',['kokuho'])];
 expect(relatedPosts(posts,'calculation','insurance',3).map(p=>p.id)).toEqual(['relief','other','tax']);
});
it('does not invent unrelated fallback recommendations when same-category candidates suffice',()=>{
 const posts=[post('a','culture'),post('b','culture'),post('c','tax'),post('d','culture')];
 expect(relatedPosts(posts,'a','culture',2).map(p=>p.id)).toEqual(['b','d']);
});
