import { ApiError } from '../utilities/ApiError.js';

export const SUPPORTED_LANGUAGES = [
    ['en','English'],['hi','Hindi'],['bn','Bengali'],['te','Telugu'],['mr','Marathi'],['ta','Tamil'],['gu','Gujarati'],['ur','Urdu'],['kn','Kannada'],['or','Odia'],['ml','Malayalam'],['pa','Punjabi'],['as','Assamese'],['mai','Maithili'],['sa','Sanskrit'],['ne','Nepali'],['kok','Konkani'],['mni','Manipuri'],['sd','Sindhi'],['doi','Dogri'],['sat','Santali'],['ks','Kashmiri']
].map(([code,name])=>({code,name}));

const callBhashini = async (body) => {
    const url=(process.env.BHASHINI_GATEWAY_URL||'').replace(/\/$/,'');
    if(!url) throw new ApiError(503,'Bhashini gateway is not configured');
    const headers={'Content-Type':'application/json'};
    if(process.env.BHASHINI_API_KEY) headers.Authorization=`Bearer ${process.env.BHASHINI_API_KEY}`;
    let r; try { r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)}); } catch(e){ throw new ApiError(502,'Unable to reach Bhashini gateway',[e.message]); }
    const text=await r.text(); let data={}; try{data=text?JSON.parse(text):{};}catch{data={raw:text};}
    if(!r.ok) throw new ApiError(r.status>=500?502:r.status,data?.message||'Bhashini request failed',[data]);
    return data;
};
export const translate=(text,sourceLanguage,targetLanguage)=>callBhashini({task:'translation',source_language:sourceLanguage,target_language:targetLanguage,text});
export const tts=(text,language)=>callBhashini({task:'tts',language,text});
export const asr=(audioBase64,language)=>callBhashini({task:'asr',language,audio_base64:audioBase64});
