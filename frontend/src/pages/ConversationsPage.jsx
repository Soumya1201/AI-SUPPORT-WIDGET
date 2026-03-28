/**
 * pages/ConversationsPage.jsx — View all chat conversations for a bot
 */

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { botsAPI } from "../api/services";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, User, Bot, ChevronDown, ChevronUp } from "lucide-react";

// ─── Single Conversation Card ─────────────────────────────────────────────────
const ConversationCard = ({ conversation }) => {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(conversation.createdAt).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="card overflow-hidden transition-all duration-200">
      {/* Summary row */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              Session <span className="font-mono text-xs text-slate-500">{conversation.sessionId.slice(0, 8)}...</span>
            </p>
            <p className="text-xs text-slate-500">{formattedDate} · {conversation.messageCount} messages</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            conversation.status === "active"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-slate-700 text-slate-400"
          }`}>
            {conversation.status}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </div>
      </div>

      {/* Message thread */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          {conversation.messages?.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No messages in this conversation.</p>
          ) : (
            conversation.messages?.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
                  ${msg.role === "assistant" ? "bg-brand-500/20" : "bg-slate-700"}`}>
                  {msg.role === "assistant"
                    ? <Bot className="w-3.5 h-3.5 text-brand-400" />
                    : <User className="w-3.5 h-3.5 text-slate-400" />
                  }
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed
                  ${msg.role === "assistant"
                    ? "bg-slate-800 text-slate-200 rounded-tl-sm"
                    : "bg-brand-500/15 text-slate-200 rounded-tr-sm"
                  }`}>
                  {msg.content}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ConversationsPage() {
  const { id } = useParams();
  const [conversations, setConversations] = useState([]);
  const [botName, setBotName] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchConversations = async (p = 1) => {
    try {
      const [convRes, botRes] = await Promise.all([
        botsAPI.getConversations(id, p),
        botsAPI.getById(id),
      ]);
      setConversations(convRes.data.conversations);
      setPagination(convRes.data.pagination);
      setBotName(botRes.data.bot.name);
    } catch {
      toast.error("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConversations(page); }, [id, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/bots/${id}`} className="text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Conversations</h1>
          <p className="text-slate-400 text-sm mt-0.5">{botName}</p>
        </div>
      </div>

      {/* List */}
      {conversations.length === 0 ? (
        <div className="card text-center py-16">
          <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No conversations yet.</p>
          <p className="text-slate-500 text-sm mt-1">
            Embed your widget and start chatting to see conversations here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <ConversationCard key={conv._id} conversation={conv} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
