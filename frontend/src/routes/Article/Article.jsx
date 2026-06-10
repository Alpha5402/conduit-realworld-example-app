--- frontend/src/routes/Article/Article.jsx
+++ frontend/src/routes/Article/Article.jsx
@@ -8,7 +8,7 @@ import getArticle from "../../services/getArticle";
 /** 统计纯文本字数（排除空白和 Markdown 标记） */
-function countWords(text) {
+export function countWords(text) {
   if (!text) return 0;
   const cleaned = text
     .replace(/[#*_~>\-`\[\]()!|]/g, "")
@@ -16,11 +16,11 @@ function countWords(text) {
     .trim();
   if (cleaned.length === 0) return 0;
-  return cleaned.split(/\s+/).length;
+  const validChars = cleaned.match(/[\u4e00-\u9fa5a-zA-Z0-9]/g);
+  return validChars ? validChars.length : 0;
 }
 
 /** 按平均阅读速度估算阅读时长（分钟） */
-function estimateReadingTime(wordCount, wordsPerMinute = 250) {
+export function estimateReadingTime(wordCount, wordsPerMinute = 250) {
   if (wordCount === 0) return "< 1";
   const minutes = Math.ceil(wordCount / wordsPerMinute);
   return String(minutes);
@@ -58,9 +58,13 @@ function Article() {
         <div className="row article-content">
           <div className="col-md-12">
             {body && <Markdown options={{ forceBlock: true }}>{body}</Markdown>}
-            <div className="article-stats" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #e5e5e5", color: "#999", fontSize: 13 }}>
+            <div 
+              className="article-stats" 
+              style={{ 
+                position: "fixed", top: 200, right: 24, backgroundColor: "#fff", 
+                padding: "12px 16px", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
+                color: "#999", fontSize: 13, zIndex: 10 
+              }}
+            >
               <span>共 {wordCount} 字</span>
               <span style={{ marginLeft: 16 }}>预计阅读 {readingTime} 分钟</span>
             </div>
             <ArticleTags tagList={tagList} />
--- frontend/src/routes/Article/Article.test.jsx
+++ frontend/src/routes/Article/Article.test.jsx
@@ -0,0 +1,40 @@
+import { countWords, estimateReadingTime } from './Article';
+
+describe('countWords 字数统计逻辑校验', () => {
+  test('空内容/空值返回0', () => {
+    expect(countWords('')).toBe(0);
+    expect(countWords(null)).toBe(0);
+    expect(countWords(undefined)).toBe(0);
+  });
+
+  test('纯中文内容正确逐字计数', () => {
+    expect(countWords('我爱中国')).toBe(4);
+    expect(countWords('今天天气真不错')).toBe(7);
+  });
+
+  test('纯英文内容正确逐字符计数', () => {
+    expect(countWords('HelloWorld')).toBe(10);
+    expect(countWords('React 18')).toBe(6);
+  });
+
+  test('中英数字混合内容正确计数', () => {
+    expect(countWords('我今年25岁 Hello')).toBe(9);
+  });
+
+  test('仅包含Markdown标记的内容返回0', () => {
+    expect(countWords('## **[]()!`~>')).toBe(0);
+  });
+});
+
+describe('estimateReadingTime 阅读时长估算逻辑校验', () => {
+  test('0字场景返回< 1', () => {
+    expect(estimateReadingTime(0)).toBe('< 1');
+  });
+
+  test('小于等于250字返回1分钟', () => {
+    expect(estimateReadingTime(10)).toBe('1');
+    expect(estimateReadingTime(250)).toBe('1');
+  });
+
+  test('超过阈值自动向上取整', () => {
+    expect(estimateReadingTime(251)).toBe('2');
+    expect(estimateReadingTime(500)).toBe('2');
+    expect(estimateReadingTime(751)).toBe('4');
+  });
+});