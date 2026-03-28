/**
 * pages/DashboardPage.jsx — Main dashboard showing bots + analytics
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { botsAPI, analyticsAPI } from "../api/services";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Bot, Plus, MessageSquare, TrendingUp,
  ExternalLink, Settings, Trash2, Activity,
} from "lucide-react";

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </div>
);

// ─── Bot Card ──────────────────────────────────────────────────────────────────
const BotCard = ({ bot, onDelete }) => (
  <div className="card hover:border-slate-700 transition-all duration-200 group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{bot.settings?.botAvatar || "🤖"}</div>
        <div>
          <h3 className="font-semibold text-slate-100 group-hover:text-brand-400 transition-colors">
            {bot.name}
          </h3>
          <span className={bot.isActive ? "badge-active" : "badge-inactive"}>
            <span className={`w-1.5 h-1.5 rounded-full ${bot.isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
            {bot.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/bots/${bot._id}/edit`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          title="Edit bot"
        >
          <Settings className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete(bot._id, bot.name)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete bot"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>

    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
      {bot.welcomeMessage || "No welcome message set."}
    </p>

    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
      <span className="flex items-center gap-1">
        <MessageSquare className="w-3.5 h-3.5" />
        {bot.analytics?.totalConversations || 0} conversations
      </span>
      <span className="flex items-center gap-1">
        <Activity className="w-3.5 h-3.5" />
        {bot.analytics?.totalMessages || 0} messages
      </span>
    </div>

    <div className="flex items-center gap-2">
      <Link
        to={`/bots/${bot._id}`}
        className="btn-secondary text-sm flex-1 text-center"
      >
        View Details
      </Link>
      <Link
        to={`/bots/${bot._id}/conversations`}
        className="btn-secondary text-sm px-3"
        title="View conversations"
      >
        <MessageSquare className="w-4 h-4" />
      </Link>
    </div>
  </div>
);

// ─── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [bots, setBots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [botsRes, analyticsRes] = await Promise.all([
        botsAPI.getAll(),
        analyticsAPI.getOverview(),
      ]);
      setBots(botsRes.data.bots);
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (botId, botName) => {
    if (!window.confirm(`Delete "${botName}"? This will also delete all its conversations.`)) return;
    try {
      await botsAPI.delete(botId);
      setBots((prev) => prev.filter((b) => b._id !== botId));
      toast.success(`"${botName}" deleted.`);
    } catch {
      toast.error("Failed to delete bot.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your chatbots.</p>
        </div>
        <Link to="/bots/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chatbot</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Chatbots"
          value={bots.length}
          icon={Bot}
          color="bg-brand-500/10 text-brand-400"
        />
        <StatCard
          label="Total Conversations"
          value={analytics?.totals?.totalConversations || 0}
          icon={MessageSquare}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label="Total Messages"
          value={analytics?.totals?.totalMessages || 0}
          icon={TrendingUp}
          color="bg-amber-500/10 text-amber-400"
        />
      </div>

      {/* Bots Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Your Chatbots</h2>
        {bots.length === 0 ? (
          <div className="card text-center py-16">
            <Bot className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-300 font-medium mb-2">No chatbots yet</h3>
            <p className="text-slate-500 text-sm mb-6">
              Create your first AI chatbot and embed it on any website.
            </p>
            <Link to="/bots/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create your first bot
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map((bot) => (
              <BotCard key={bot._id} bot={bot} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};
