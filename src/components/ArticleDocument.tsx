import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import WebView from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import { buildReaderDocument, type ReaderProps, type ReaderHandle } from '../lib/reader-document';
export type { ReaderHandle } from '../lib/reader-document';
export const ArticleDocument = forwardRef<ReaderHandle, ReaderProps>(function ArticleDocument(props, ref) {
  const { palette, isDark } = useTheme();
  const { settings } = useReadingSettings();
  const web = useRef<WebView>(null);
  const progress = useRef(props.initialProgress ?? 0);
  const doc = useMemo(()=>buildReaderDocument(props,palette,isDark,settings),[props.html,props.title,props.author,props.readingTime,props.tags,palette,isDark,settings]);
  useImperativeHandle(ref,()=>({scrollToAnchor(id){web.current?.injectJavaScript(`window.duduAnchor(${JSON.stringify(id)});true;`);}}),[]);
  return <WebView ref={web} source={{html:doc,baseUrl:'https://www.hdu-wiki.cn/'}} originWhitelist={['*']}
    style={{flex:1,backgroundColor:palette.contentBg}} onLoadEnd={()=>web.current?.injectJavaScript(`window.duduScroll(${progress.current});true;`)}
    onShouldStartLoadWithRequest={request=>request.url==='about:blank'||request.url==='https://www.hdu-wiki.cn/'}
    onMessage={event=>{const message=event.nativeEvent.data;if(message.startsWith('scroll:')){const ratio=Number(message.slice(7));if(Number.isFinite(ratio)){progress.current=Math.max(0,Math.min(1,ratio));props.onScrollRatio?.(progress.current)}}else if(message.startsWith('link:'))props.onLinkPress?.(message.slice(5));}}
    showsVerticalScrollIndicator decelerationRate="normal" androidLayerType="hardware" />;
});
