import {encodeV3State} from '../session/permalink-v3.js';

export function counterpartPermalink(path) {
 if(typeof path!=='string' || !path || /^[\\/]|[\\\x00-\x1f]/.test(path) || path.includes(':') || path.split('/').some(part=>part==='..'))return null;
 const url=new URL('https://s53m.com/SH6/');
 url.searchParams.set('state',encodeV3State({v:2,s:[{i:'A',p:path,t:'a'}]}));
 return url.toString();
}
