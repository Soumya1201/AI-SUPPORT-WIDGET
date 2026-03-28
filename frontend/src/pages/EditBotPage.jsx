/**
 * pages/EditBotPage.jsx — Edit an existing chatbot
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { botsAPI } from "../api/services";
import toast from "react-hot-toast";
import { ArrowLeft, Bot, Lightbulb, Trash2 } from "lucide-react";

export default function EditBotPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "",
    welcomeMessage: "",
    knowledgeBase: "",
    isActive: true,
    settings: { primaryColor: "#6366f1", botAvatar: "🤖", position: "bottom-right" },
  });

  // Load existing bot data
  useEffect(() => {
    const fetchBot = async () => {
      try {
        const res = await botsAPI.getById(id);
        const bot = res.data.bot;
        setForm({
          name: bot.name,
          welcomeMessage: bot.welcomeMessage,
          knowledgeBase: bot.knowledgeBase || "",
          isActive: bot.isActive,
          settings: bot.settings || { primaryColor: "#6366f1", botAvatar: "🤖", position: "bottom-right" },
        });
      } catch {
        toast.error("Failed to load bot.");
        navigate("/dashboard");
      } finally {
        setFetching(false);
      }
    };
    fetchBot();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("settings.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await botsAPI.update(id, form);
      toast.success("Bot updated successfully!");
      navigate(`/bots/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bot.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    try {
      await botsAPI.delete(id);
      toast.success("Bot deleted.");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to delete bot.");
    }
  };

  const avatarOptions = ["🤖", "💬", "🧠", "⚡", "🎯", "🌟", "💡", "🦾"];

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link to={`/bots/${id}`} className="text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Edit Chatbot</h1>
          <p className="text-slate-400 text-sm mt-0.5">Update your bot's configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-5">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-brand-400" />
            Basic Information
          </h2>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-200">Bot Status</p>
              <p className="text-xs text-slate-400">Disable to stop the widget from responding</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 rounded-full peer
                peer-checked:bg-brand-500 peer-checked:after:translate-x-full
                after:content-[''] after:absolute after:top-0.5 after:left-0.5
                after:bg-white after:rounded-full after:h-5 after:w-5
                after:transition-all transition-colors" />
            </label>
          </div>

          <div>
            <label className="label">Bot Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="label">Welcome Message</label>
            <textarea name="welcomeMessage" value={form.welcomeMessage} onChange={handleChange} rows={2} className="input resize-none" />
          </div>

          <div>
            <label className="label">Bot Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {avatarOptions.map((emoji) => (
                <button key={emoji} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, settings: { ...prev.settings, botAvatar: emoji } }))}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-all
                    ${form.settings.botAvatar === emoji ? "border-brand-500 bg-brand-500/10" : "border-slate-700 hover:border-slate-500"}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" name="settings.primaryColor" value={form.settings.primaryColor}
                  onChange={handleChange} className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer" />
                <input type="text" value={form.settings.primaryColor}
                  onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, primaryColor: e.target.value } }))}
                  className="input font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="label">Widget Position</label>
              <select name="settings.position" value={form.settings.position} onChange={handleChange} className="input">
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Knowledge Base
          </h2>
          <textarea name="knowledgeBase" value={form.knowledgeBase} onChange={handleChange}
            rows={12} className="input resize-y font-mono text-sm leading-relaxed"
            placeholder="Add your FAQs, product info, and policies here..." />
          <p className="text-xs text-slate-500">{form.knowledgeBase.length}/10,000 characters</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : "Save Changes"}
            </button>
            <Link to={`/bots/${id}`} className="btn-secondary px-6 py-2.5">Cancel</Link>
          </div>
          <button type="button" onClick={handleDelete}
            className="btn-danger flex items-center gap-2 text-sm px-4 py-2.5">
            <Trash2 className="w-4 h-4" />
            Delete Bot
          </button>
        </div>
      </form>
    </div>
  );
}
