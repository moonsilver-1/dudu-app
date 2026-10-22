import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import { buildReaderDocument, type ReaderProps, type ReaderHandle } from '../lib/reader-document';
export type { ReaderHandle } from '../lib/reader-document';
export const ArticleDocument = forwardRef<ReaderHandle,ReaderProps>(function ArticleDocument(props,ref){
  const {palette,isDark}=useTheme();const {settings}=useReadingSettings();const frame=useRef<HTMLIFrameElement>(null);const progress=useRef(props.initialProgress??0);
  const doc=useMemo(()=>buildReaderDocument(props,palette,isDark,settings),[props.html,props.title,props.author,props.readingTime,props.tags,palette,isDark,settings]);
  useImperativeHandle(ref,()=>({scrollToAnchor(id){frame.current?.contentDocument?.getElementById(id)?.scrollIntoView({behavior:'smooth'});}}),[]);
  useEffect(()=>{const onMessage=(event:MessageEvent)=>{if(event.source!==frame.current?.contentWindow||event.data?.source!=='dudu-reader')return;const value=event.data.value;if(typeof value!=='string')return;if(value.startsWith('scroll:')){const ratio=Number(value.slice(7));if(Number.isFinite(ratio)){progress.current=ratio;props.onScrollRatio?.(ratio)}}else if(value.startsWith('link:'))props.onLinkPress?.(value.slice(5));};window.addEventListener('message',onMessage);return()=>window.removeEventListener('message',onMessage);},[props.onScrollRatio,props.onLinkPress]);
  return <iframe title={props.title} ref={frame} srcDoc={doc} style={{flex:1,width:'100%',minHeight:0,border:0,background:palette.contentBg}}
    onLoad={()=>{const win=frame.current?.contentWindow;if(win)win.scrollTo(0,Math.max(0,win.document.documentElement.scrollHeight-win.innerHeight)*progress.current);}}/>;
});
