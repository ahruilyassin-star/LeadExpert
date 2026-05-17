"use client";

import { useState } from "react";
import Header from "@/components/header";
import { conversations } from "@/lib/mock-data";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import {
  Search, Send, Paperclip, Smile, Phone, Mail,
  MessageSquare, ChevronDown, MoreHorizontal, Star, MessageCircle, AtSign
} from "lucide-react";

type Channel = "All" | "SMS" | "Email" | "Facebook" | "Instagram";

const channelIcon = (channel: string) => {
  if (channel === "Email") return <Mail className="w-3.5 h-3.5" />;
  if (channel === "Facebook") return <MessageCircle className="w-3.5 h-3.5" />;
  if (channel === "Instagram") return <AtSign className="w-3.5 h-3.5" />;
  return <Phone className="w-3.5 h-3.5" />;
};

const channelColor = (channel: string) => {
  if (channel === "Email") return "bg-purple-100 text-purple-600";
  if (channel === "Facebook") return "bg-blue-100 text-blue-600";
  if (channel === "Instagram") return "bg-pink-100 text-pink-600";
  return "bg-green-100 text-green-600";
};

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [activeChannel, setActiveChannel] = useState<Channel>("All");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const filtered = conversations.filter((c) => {
    const matchChannel = activeChannel === "All" || c.channel === activeChannel;
    const matchSearch = c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.preview.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchSearch;
  });

  const selected = conversations.find((c) => c.id === selectedId) || conversations[0];

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
      <Header title="Conversations" />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
              />
            </div>
          </div>

          {/* Channel Tabs */}
          <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
            {(["All", "SMS", "Email", "Facebook", "Instagram"] as Channel[]).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                  activeChannel === ch
                    ? "bg-[#00b4d8] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {ch !== "All" && channelIcon(ch)}
                {ch}
              </button>
            ))}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 flex items-start gap-3",
                  selectedId === conv.id ? "bg-[#00b4d8]/5 border-l-2 border-l-[#00b4d8]" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5",
                  getAvatarColor(conv.contact)
                )}>
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={cn("text-sm truncate", conv.unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                      {conv.contact}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">{conv.time}</span>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 bg-[#00b4d8] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5", channelColor(conv.channel))}>
                      {channelIcon(conv.channel)}
                      {conv.channel}
                    </span>
                    <p className="text-xs text-gray-400 truncate">{conv.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                getAvatarColor(selected.contact)
              )}>
                {selected.avatar}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selected.contact}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5", channelColor(selected.channel))}>
                    {channelIcon(selected.channel)}
                    {selected.channel}
                  </span>
                  <span className="text-xs text-green-500 font-medium">● Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <Star className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-xs font-medium rounded-lg transition-colors">
                View Contact
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selected.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  msg.from === "agent" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {msg.from === "contact" && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                    getAvatarColor(selected.contact)
                  )}>
                    {selected.avatar}
                  </div>
                )}
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.from === "agent"
                    ? "bg-[#00b4d8] text-white rounded-br-sm"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                )}>
                  <p>{msg.text}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    msg.from === "agent" ? "text-white/70 text-right" : "text-gray-400"
                  )}>
                    {msg.time}
                  </p>
                </div>
                {msg.from === "agent" && (
                  <div className="w-8 h-8 rounded-full bg-[#1a1d24] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    LO
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#00b4d8]/30 focus-within:border-[#00b4d8]">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setMessage("")}
                  placeholder={"Reply via " + selected.channel + "..."}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                />
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setMessage("")}
                className="w-10 h-10 bg-[#00b4d8] hover:bg-[#0096b7] text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                <MessageSquare className="w-3 h-3" /> Templates
              </button>
              <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                <Smile className="w-3 h-3" /> Snippets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
