import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { hostels } from "../data/hostels";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Loader2, User, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface QuickSuggestion {
  label: string;
  prompt: string;
}

// ─── Hostel context (injected into system prompt) ─────────────────────────────
const hostelContext = hostels
  .map(
    (h) =>
      `- ${h.name} | ${h.location} | ₹${h.price}/night | Rating: ${h.rating}/5 | AC: ${h.isAC ? "Yes" : "No"} | Rooms: ${h.availableRooms} available | Types: ${h.roomTypes.join(", ")} | Amenities: ${h.amenities.join(", ")} | Policy: ${h.cancellationPolicy}`
  )
  .join("\n");

const SYSTEM_PROMPT = `You are NestAI, a smart and friendly AI travel assistant for StayNest — a premium hostel booking platform focused on India, especially Tamil Nadu.

## Your Capabilities
- Recommend hostels based on budget, location, amenities, vibe (party, chill, cultural, adventure)
- Compare hostels side-by-side
- Give travel tips for Indian cities, especially Tamil Nadu destinations
- Explain booking policies, check-in times, and hostel etiquette
- Help plan complete itineraries (best time to visit, local food, transport)
- Answer FAQs about hostels vs hotels, backpacking in India

## Available Hostels on StayNest
${hostelContext}

## Personality
- Warm, helpful, and conversational — like a knowledgeable travel buddy
- Use emojis sparingly but effectively 🌏
- Keep answers concise but thorough
- When recommending, always mention price, rating, and one standout feature
- If asked something outside travel/hostels, gently redirect

## Response Format
- Use **bold** for hostel names and key info
- Use bullet points for comparisons and lists
- For itineraries, use numbered lists with day-by-day structure
- Always end recommendations with a helpful follow-up offer (e.g. "Want to know more about this hostel?")`;

const QUICK_SUGGESTIONS: QuickSuggestion[] = [
  { label: "Best hostels in Chennai", prompt: "What are the best hostels in Chennai?" },
  { label: "Budget under ₹800", prompt: "Show me hostels under ₹800 per night" },
  { label: "Tamil Nadu itinerary", prompt: "Plan a 7-day Tamil Nadu backpacker itinerary" },
  { label: "Ooty vs Kodaikanal", prompt: "Compare Ooty and Kodaikanal hostels for a weekend trip" },
  { label: "Best for solo travel", prompt: "Which hostels are best for solo female travelers?" },
  { label: "Hostel with pool/beach", prompt: "Any hostels with beach access or pool?" },
];

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h4 class='font-semibold text-indigo-700 mt-2 mb-1'>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3 class='font-bold text-indigo-800 mt-3 mb-1'>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2 class='font-bold text-indigo-900 mt-3 mb-1 text-lg'>$1</h2>")
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
    .replace(/^[-•] (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br/>");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm **NestAI** 👋 — your personal travel assistant for StayNest.\n\nI can help you find the perfect hostel, plan itineraries, compare locations, and answer any travel questions about India.\n\nWhat can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ReturnType<GoogleGenAI["chats"]["create"]> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Init Gemini chat session ──────────────────────────────────────────────
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setHasApiKey(false);
      return;
    }
    setHasApiKey(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const session = ai.chats.create({
        model: "gemini-3.8-flash",
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.85,
          maxOutputTokens: 1024,
        },
      });
      setChatSession(session);
    } catch (err) {
      console.error("Failed to init Gemini chat:", err);
    }
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setShowSuggestions(false);

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      const assistantMsgId = `a-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        text: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsLoading(true);

      if (!chatSession) {
        // No API key — use a graceful fallback
        const fallback = getFallbackResponse(text);
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: fallback, isStreaming: false } : m
            )
          );
          setIsLoading(false);
        }, 800);
        return;
      }

      try {
        const stream = await chatSession.sendMessageStream({ message: text.trim() });
        let fullText = "";

        for await (const chunk of stream) {
          const chunkText = chunk.text ?? "";
          fullText += chunkText;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: fullText, isStreaming: true } : m
            )
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, text: fullText, isStreaming: false } : m
          )
        );
      } catch (err) {
        console.error("Gemini error:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: "Sorry, I ran into a hiccup! Please try again in a moment. 🙏",
                  isStreaming: false,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [chatSession, isLoading]
  );

  // ── Fallback (no API key) ─────────────────────────────────────────────────
  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("chennai") || q.includes("marina")) {
      return "🏖️ **Marina Beach Backpackers** in Chennai is a fantastic pick! It's located near the iconic Marina Beach with sea views, WiFi, and breakfast included — all for ₹900/night.\n\nTo get real-time AI recommendations, add your Gemini API key in the `.env` file as `VITE_GEMINI_API_KEY`.";
    }
    if (q.includes("budget") || q.includes("cheap") || q.includes("₹")) {
      const budget = hostels.filter((h) => h.price <= 800).slice(0, 3);
      return `💰 Here are our most budget-friendly hostels:\n\n${budget.map((h) => `• **${h.name}** — ₹${h.price}/night | ${h.location} | ⭐ ${h.rating}`).join("\n")}\n\nWant details on any of these?`;
    }
    if (q.includes("tamil") || q.includes("ooty") || q.includes("madurai") || q.includes("kodai")) {
      const tn = hostels.filter((h) => h.location.includes("Tamil Nadu")).slice(0, 4);
      return `🌴 Tamil Nadu has some incredible hostels:\n\n${tn.map((h) => `• **${h.name}** | ${h.location} | ₹${h.price}/night | ⭐ ${h.rating}`).join("\n")}\n\nFor AI-powered travel planning, add your Gemini API key to get full itinerary suggestions!`;
    }
    return `Thanks for your question! I'm running in demo mode without an AI key right now.\n\nTo unlock full AI features:\n1. Get a free Gemini API key at **ai.google.dev**\n2. Add it to your \`.env\` as \`VITE_GEMINI_API_KEY=your_key\`\n3. Restart the dev server\n\nMeanwhile, browse our ${hostels.length} hostels across India! 🇮🇳`;
  };

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        } bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-400/40 hover:scale-105`}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="size-5 animate-pulse" />
        <span className="text-sm font-semibold">NestAI</span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        } ${
          isMinimized
            ? "bottom-6 right-6 w-72 h-14"
            : "bottom-6 right-6 w-[380px] sm:w-[420px] h-[600px] max-h-[85vh]"
        } rounded-2xl shadow-2xl flex flex-col bg-white border border-slate-200 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">NestAI</p>
              <p className="text-[10px] text-indigo-200 mt-0.5">
                {hasApiKey ? "Powered by Gemini 3.8 Flash" : "Demo mode"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body (hidden when minimized) */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="size-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm"
                        : "bg-white shadow-sm border border-slate-100 text-slate-700 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                        className="prose-sm"
                      />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-indigo-400 animate-pulse ml-0.5 rounded-sm align-middle" />
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="size-3.5 text-slate-500" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                    <Bot className="size-3.5 text-white" />
                  </div>
                  <div className="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {showSuggestions && (
              <div className="px-3 pb-2 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-center gap-1 py-2">
                  <ChevronDown className="size-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Quick asks</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.prompt)}
                      disabled={isLoading}
                      className="text-[11px] px-2.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-3 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about hostels…"
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none outline-none max-h-32 leading-relaxed disabled:opacity-50"
                  style={{ scrollbarWidth: "none" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                {hasApiKey ? "NestAI · Gemini 3.8 Flash" : "Demo mode — add VITE_GEMINI_API_KEY to unlock full AI"}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
