'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Helper to check if text contains Devanagari script (Hindi/Sanskrit)
const containsDevanagari = (text: string) => /[\u0900-\u097F]/.test(text);

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Preprocess content: Transform English\n---\nHindi into clean structured bilingual blocks
  const processedContent = content
    .replace(/([^\n]+)\n+---+\n+([^\n]+)/g, (match, p1, p2) => {
      // If one part is Devanagari or translation, format as bilingual
      if (containsDevanagari(p2) || containsDevanagari(p1)) {
        const en = containsDevanagari(p1) ? p2.trim() : p1.trim();
        const hi = containsDevanagari(p1) ? p1.trim() : p2.trim();
        return `${en}\n\n*${hi}*`;
      }
      return match;
    });

  return (
    <div className={`text-xs text-slate-800 leading-relaxed space-y-2.5 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h2 className="text-sm font-extrabold text-slate-900 mt-2 mb-1 border-b border-slate-200 pb-1">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block" />
              <span>{children}</span>
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide mt-1.5 mb-0.5">
              {children}
            </h4>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 bg-teal-50/90 text-teal-950 px-1 py-0.5 rounded border border-teal-200/50">
              {children}
            </strong>
          ),
          em: ({ children }) => {
            const str = String(children);
            // If it's a Devanagari/Hindi translation, format it cleanly in muted secondary font
            if (containsDevanagari(str)) {
              return (
                <span className="block text-[11px] text-slate-500 font-normal italic mt-0.5 leading-normal">
                  {children}
                </span>
              );
            }
            return <em className="italic text-slate-600">{children}</em>;
          },
          p: ({ children }) => {
            const childArray = React.Children.toArray(children);
            const strContent = childArray.map((c) => (typeof c === 'string' ? c : '')).join('');

            // Check if paragraph contains bilingual separator "---"
            if (strContent.includes('---')) {
              const parts = strContent.split(/\s*---\s*/);
              if (parts.length >= 2) {
                const enPart = parts[0].trim();
                const hiPart = parts.slice(1).join(' - ').trim();
                return (
                  <div className="my-1.5 space-y-0.5">
                    <p className="text-slate-900 font-medium leading-relaxed">{enPart}</p>
                    <p className="text-[11px] text-slate-500 font-normal italic leading-relaxed">
                      {hiPart}
                    </p>
                  </div>
                );
              }
            }

            return <p className="text-slate-800 leading-relaxed my-1">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="space-y-1.5 pl-4 list-disc marker:text-teal-700 my-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 pl-4 list-decimal marker:text-teal-700 my-1">{children}</ol>
          ),
          li: ({ children }) => <li className="text-slate-800 pl-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-teal-600 pl-3 py-1 my-1.5 bg-teal-50/50 rounded-r text-teal-900 italic text-[11px]">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-slate-100 text-slate-800 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200">
              {children}
            </code>
          ),
          hr: () => <hr className="my-2 border-t border-slate-200" />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
