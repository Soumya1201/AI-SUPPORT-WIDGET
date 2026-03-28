/**
 * pages/BotDetailPage.jsx — Bot details, embed code, and analytics
 */

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { botsAPI, analyticsAPI } from "../api/services";
import toast from "react-hot-toast";
import {
  ArrowLeft, Code, Copy, Check, Settings,
  MessageSquare, Activity, TrendingUp, ExternalLink,
} from "lucide-react";

// ─── Copy to clipboard button ─────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100
        bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

export default function BotDetailPage() {
  const { id } = useParams();
  const [bot, setBot] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const WIDGET_URL = import.meta.env.VITE_WIDGET_URL || "https://yourdomain.com/widget/widget.js";

  const embedCode = `<script
  src="${WIDGET_URL}"
  data-bot-id="${id}"
></script>`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [botRes, analyticsRes] = await Promise.all([
          botsAPI.getById(id),
          analyticsAPI.getBotAnalytics(id),
        ]);
        setBot(botRes.data.bot);
        setAnalytics(analyticsRes.data.analytics);
      } catch {
        toast.error("Failed to load bot details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Bot not found.</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-2xl">{bot.settings?.botAvatar || "🤖"}</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{bot.name}</h1>
            <span className={bot.isActive ? "badge-active" : "badge-inactive"}>
              <span className={`w-1.5 h-1.5 rounded-full ${bot.isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
              {bot.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/bots/${id}/conversations`} className="btn-secondary flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Conversations</span>
          </Link>
          <Link to={`/bots/${id}/edit`} className="btn-primary flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Bot</span>
          </Link>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Conversations", value: analytics?.totalConversations || 0, icon: MessageSquare, color: "text-brand-400 bg-brand-500/10" },
          { label: "Total Messages", value: analytics?.totalMessages || 0, icon: Activity, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Avg per Session", value: analytics?.totalConversations
              ? Math.round((analytics.totalMessages || 0) / analytics.totalConversations)
              : 0, icon: TrendingUp, color: "text-amber-400 bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Embed Code */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2">
            <Code className="w-4 h-4 text-brand-400" />
            Embed on Your Website
          </h2>
          <CopyButton text={embedCode} />
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Paste this snippet before the <code className="text-brand-400 font-mono text-xs bg-brand-500/10 px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag on any webpage.
        </p>
        <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm font-mono
          text-emerald-400 overflow-x-auto leading-relaxed">
          {embedCode}
        </pre>
        <p className="text-xs text-slate-500 mt-3">
          The widget will appear as a floating chat button. No additional setup required.
        </p>
      </div>

      {/* Bot Configuration Summary */}
      <div className="card">
        <h2 className="font-semibold text-slate-100 mb-4">Configuration</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-slate-500 text-sm w-32 shrink-0">Welcome Message</span>
            <span className="text-slate-300 text-sm">{bot.welcomeMessage}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-slate-500 text-sm w-32 shrink-0">Knowledge Base</span>
            <span className="text-slate-300 text-sm">
              {bot.knowledgeBase
                ? `${bot.knowledgeBase.length} characters`
                : <span className="text-slate-500 italic">Not configured</span>
              }
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-slate-500 text-sm w-32 shrink-0">Widget Position</span>
            <span className="text-slate-300 text-sm capitalize">{bot.settings?.position || "bottom-right"}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-slate-500 text-sm w-32 shrink-0">Brand Color</span>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-slate-700"
                style={{ backgroundColor: bot.settings?.primaryColor || "#6366f1" }}
              />
              <span className="text-slate-300 text-sm font-mono">{bot.settings?.primaryColor || "#6366f1"}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-slate-500 text-sm w-32 shrink-0">Bot ID</span>
            <span className="text-slate-300 text-sm font-mono text-xs bg-slate-800 px-2 py-0.5 rounded">{bot._id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
