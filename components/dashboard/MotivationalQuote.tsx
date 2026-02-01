'use client';

import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';

interface QuoteData {
  content: string;
  author: string;
  date: string;
}

const FALLBACK_QUOTES = [
  { content: "Consistency is key. Keep pushing.", author: "DailyFlow" },
  { content: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { content: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { content: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { content: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

export function MotivationalQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `dailyflow_quote_${today}`;
      
      // Check localStorage for today's quote
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setQuote(JSON.parse(cached));
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        const response = await fetch('https://api.quotable.io/random?tags=inspirational|motivational');
        if (response.ok) {
          const data = await response.json();
          const quoteData: QuoteData = {
            content: data.content,
            author: data.author,
            date: today,
          };
          localStorage.setItem(storageKey, JSON.stringify(quoteData));
          setQuote(quoteData);
        } else {
          throw new Error('API failed');
        }
      } catch (error) {
        // Fallback to local quote
        const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
        const fallbackQuote = {
          ...FALLBACK_QUOTES[randomIndex],
          date: today,
        };
        localStorage.setItem(storageKey, JSON.stringify(fallbackQuote));
        setQuote(fallbackQuote);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-full">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 h-full flex flex-col">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
        <Quote className="text-blue-500 flex-shrink-0" size={16} />
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Motivational Quote</h3>
      </div>
      <blockquote className="flex-1">
        <p className="text-gray-800 text-sm sm:text-lg leading-relaxed mb-2 sm:mb-3 line-clamp-3">
          "{quote?.content}"
        </p>
        <footer className="text-xs sm:text-sm text-gray-500">
          — {quote?.author}
        </footer>
      </blockquote>
    </div>
  );
}
