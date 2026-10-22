import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getAllArticles, getAdjacent, search, articleUrl } from '../src/lib/content';
import { validateContent } from '../src/lib/content-validation';
import { fetchContentUpdate } from '../src/lib/content-sync-core';
import { scrollRatio } from '../src/lib/reader-document';

const data = JSON.parse(fs.readFileSync('assets/content.json','utf8'));
test('bundled content is valid and every TOC target exists',()=>{
  validateContent(data);
  assert.equal(data.total,302);
  for(const article of getAllArticles()) for(const item of article.toc) assert.ok(article.html.includes(`id="${item.id}"`),`${article.slug}#${item.id}`);
});
test('course navigation stays in the same section and follows website order',()=>{
  const result=getAdjacent('strassen-matrix-multiplication');
  assert.equal(result.prev?.slug,'convex-hull');assert.equal(result.next?.slug,'fft');
  assert.equal(getAdjacent('preparation-before-learning-ML').next,undefined);
});
test('shared links use the category route',()=>assert.equal(articleUrl({category:'courses',slug:'fft'}),'https://www.hdu-wiki.cn/courses/fft'));
test('progress represents document percentage, not scroll pixels',()=>{
  assert.equal(scrollRatio(100,2000,1000),.1);assert.equal(scrollRatio(1000,2000,1000),1);
  assert.equal(scrollRatio(0,400,800),1);assert.equal(scrollRatio(-100,2000,1000),0);
});
test('search includes articles added after the old 156-article bundle',()=>{
  assert.ok(search('云 GPU').some(hit=>hit.article.title.includes('GPU')));
  assert.ok(search('Strassen').some(hit=>hit.article.slug==='strassen-matrix-multiplication'));
});
test('unchanged manifest skips downloading the full snapshot',async()=>{
  let requests=0;
  const fake=async()=>{requests++;return new Response(JSON.stringify({schemaVersion:1,version:data.version}));};
  assert.equal(await fetchContentUpdate(data.version,fake as typeof fetch),null);assert.equal(requests,1);
});
test('update validates the snapshot before replacing offline content',async()=>{
  const fake=async(url: string|URL|Request)=>new Response(JSON.stringify(String(url).endsWith('manifest')?{schemaVersion:1,version:data.version}:data));
  const next=await fetchContentUpdate('old',fake as typeof fetch);assert.equal(next?.total,data.total);
  const bad={...data,total:1};assert.throws(()=>validateContent(bad));
  assert.throws(()=>validateContent({...data,articles:[...data.articles.slice(1),data.articles[1]]}));
});
test('network errors and deployments with mismatched manifests never replace content',async()=>{
  await assert.rejects(fetchContentUpdate('old',(async()=>new Response('',{status:503})) as typeof fetch));
  const fake=async(url: string|URL|Request)=>new Response(JSON.stringify(String(url).endsWith('manifest')?{schemaVersion:1,version:'f'.repeat(64)}:data));
  await assert.rejects(fetchContentUpdate('old',fake as typeof fetch),/正在更新/);
  assert.equal(getAllArticles().length,302);
});
