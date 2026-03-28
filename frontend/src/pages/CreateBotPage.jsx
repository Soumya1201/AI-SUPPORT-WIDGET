/**
 * pages/CreateBotPage.jsx — Form to create a new chatbot
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { botsAPI } from "../api/services";
import toast from "react-hot-toast";
import { ArrowLeft, Bot, Lightbulb } from "lucide-react";

const KNOWLEDGE_BASE_PLACEHOLDER = `Add your business's FAQ and product information here.

Examples:
Q: What are your business hours?
A: We're open Monday–Friday, 9am to 6pm EST.

Q: How can I contact support?
A: Email us at support@yourcompany.com or call 1-800-XXX-XXXX.

Q: What is your return policy?
A: We offer a 30-day no-questions-asked return policy.

Q: What products do you offer?
A: We sell [describe your products/services here].`;

export default function CreateBotPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    welcomeMessage: "Hi there! 👋 How can I help you today?",
    knowledgeBase: "",
    settings: {
      primaryColor: "#6366f1",
      botAvatar: "🤖",
      position: "bottom-right",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("settings.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await botsAPI.create(form);
      toast.success("Chatbot created successfully! 🎉");
      navigate(`/bots/${res.data.bot._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create bot.");
    } finally {
      setLoading(false);
    }
  };

  const avatarOptions = ["🤖", "💬", "🧠", "⚡", "🎯", "🌟", "💡", "🦾"];

  return (
    <div className="max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Create a Chatbot</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure your AI support agent</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-5">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-brand-400" />
            Basic Information
          </h2>

          <div>
            <label className="label">Bot Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Acme Support Bot"
              required
            />
          </div>

          <div>
            <label className="label">Welcome Message</label>
            <textarea
              name="welcomeMessage"
              value={form.welcomeMessage}
              onChange={handleChange}
              rows={2}
              className="input resize-none"
              placeholder="What should the bot say when a visitor opens the chat?"
            />
          </div>

          {/* Avatar picker */}
          <div>
            <label className="label">Bot Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, settings: { ...prev.settings, botAvatar: emoji } }))
                  }
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-all
                    ${form.settings.botAvatar === emoji
                      ? "border-brand-500 bg-brand-500/10"
                      : "border-slate-700 hover:border-slate-500"
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="settings.primaryColor"
                  value={form.settings.primaryColor}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.settings.primaryColor}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, primaryColor: e.target.value },
                    }))
                  }
                  className="input font-mono text-sm"
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <div>
              <label className="label">Widget Position</label>
              <select
                name="settings.position"
                value={form.settings.position}
                onChange={handleChange}
                className="input"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="card space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="font-semibold text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Knowledge Base
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Write your FAQs, product info, and policies here. The AI uses this to answer customer questions accurately.
          </p>
          <textarea
            name="knowledgeBase"
            value={form.knowledgeBase}
            onChange={handleChange}
            rows={12}
            className="input resize-y font-mono text-sm leading-relaxed"
            placeholder={KNOWLEDGE_BASE_PLACEHOLDER}
          />
          <p className="text-xs text-slate-500">
            {form.knowledgeBase.length}/10,000 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-6 py-2.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "Create Chatbot"
            )}
          </button>
          <Link to="/dashboard" className="btn-secondary px-6 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
