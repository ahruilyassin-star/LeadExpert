"use client";

import { useState } from "react";
import Header from "@/components/header";
import { cn } from "@/lib/utils";
import {
  User, Building2, Plug, Users, CreditCard, Bell,
  Camera, Globe, Mail, Phone, MapPin, ChevronRight, Check, Shield, Key
} from "lucide-react";

type SettingsTab = "profile" | "business" | "integrations" | "team" | "billing" | "notifications";

const TABS = [
  { id: "profile" as SettingsTab, label: "Profile", icon: User },
  { id: "business" as SettingsTab, label: "Business Info", icon: Building2 },
  { id: "integrations" as SettingsTab, label: "Integrations", icon: Plug },
  { id: "team" as SettingsTab, label: "Team", icon: Users },
  { id: "billing" as SettingsTab, label: "Billing", icon: CreditCard },
  { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
];

const INTEGRATIONS = [
  { name: "Stripe", desc: "Payment processing", connected: true, color: "bg-purple-500" },
  { name: "Mailchimp", desc: "Email marketing", connected: false, color: "bg-yellow-500" },
  { name: "Google Analytics", desc: "Website analytics", connected: true, color: "bg-blue-500" },
  { name: "Facebook Pixel", desc: "Ad tracking", connected: true, color: "bg-blue-600" },
  { name: "Zapier", desc: "App automation", connected: false, color: "bg-orange-500" },
  { name: "Twilio", desc: "SMS messaging", connected: true, color: "bg-red-500" },
  { name: "Slack", desc: "Team notifications", connected: false, color: "bg-green-600" },
  { name: "HubSpot", desc: "CRM sync", connected: false, color: "bg-orange-600" },
];

const TEAM_MEMBERS = [
  { name: "Admin User", email: "admin@littleoummah.com", role: "Owner", avatar: "AU", active: true },
  { name: "Sarah Manager", email: "sarah@littleoummah.com", role: "Admin", avatar: "SM", active: true },
  { name: "John Sales", email: "john@littleoummah.com", role: "Sales Rep", avatar: "JS", active: true },
  { name: "Lisa Support", email: "lisa@littleoummah.com", role: "Support", avatar: "LS", active: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "Little Oummah",
    address: "Hoofdstraat 42, 1234 AB Amsterdam",
    phone: "+31 20 123 4567",
    email: "info@littleoummah.com",
    website: "www.littleoummah.com",
    timezone: "Europe/Amsterdam",
    industry: "Ecommerce",
    currency: "EUR",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="Settings" />
      <main className="p-6">
        <div className="flex gap-6">
          {/* Left Nav */}
          <div className="w-52 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-b border-gray-50 last:border-0",
                      activeTab === tab.id
                        ? "bg-[#00b4d8]/5 text-[#00b4d8] border-l-2 border-l-[#00b4d8]"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                    {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Business Info */}
            {activeTab === "business" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Update your business details and preferences</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-[#00b4d8]/10 rounded-xl flex items-center justify-center border-2 border-dashed border-[#00b4d8]/30">
                        <span className="text-2xl font-bold text-[#00b4d8]">LO</span>
                      </div>
                      <div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <Camera className="w-4 h-4" />
                          Upload Logo
                        </button>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white"
                      >
                        <option value="Europe/Amsterdam">Europe/Amsterdam (UTC+2)</option>
                        <option value="Europe/London">Europe/London (UTC+1)</option>
                        <option value="America/New_York">America/New_York (UTC-4)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (UTC-7)</option>
                        <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white"
                      >
                        <option value="EUR">EUR - Euro</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="AED">AED - UAE Dirham</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Discard Changes
                    </button>
                    <button
                      onClick={handleSave}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                        saved ? "bg-green-500" : "bg-[#00b4d8] hover:bg-[#0096b7]"
                      )}
                    >
                      {saved && <Check className="w-4 h-4" />}
                      {saved ? "Saved!" : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === "integrations" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Connect your favorite tools and services</p>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  {INTEGRATIONS.map((int) => (
                    <div key={int.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold", int.color)}>
                          {int.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{int.name}</p>
                          <p className="text-xs text-gray-400">{int.desc}</p>
                        </div>
                      </div>
                      <button className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                        int.connected
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}>
                        {int.connected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team */}
            {activeTab === "team" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{TEAM_MEMBERS.length} members in your organization</p>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-[#00b4d8] text-white text-sm font-medium rounded-lg hover:bg-[#0096b7] transition-colors">
                    <Users className="w-4 h-4" />
                    Invite Member
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {TEAM_MEMBERS.map((member) => (
                    <div key={member.email} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1a1d24] text-white flex items-center justify-center text-sm font-bold">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            {member.name}
                            {!member.active && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Inactive</span>}
                          </p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          member.role === "Owner" ? "bg-purple-100 text-purple-700" :
                          member.role === "Admin" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {member.role}
                        </span>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Manage your personal account settings</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-[#1a1d24] flex items-center justify-center text-white text-2xl font-bold">LO</div>
                    <div>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                        <Camera className="w-4 h-4" /> Change Photo
                      </button>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input type="text" defaultValue="Little" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input type="text" defaultValue="Oummah" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <input type="email" defaultValue="admin@littleoummah.com" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Security</h3>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      Change Password
                    </button>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={handleSave} className="px-5 py-2 text-sm font-medium bg-[#00b4d8] hover:bg-[#0096b7] text-white rounded-lg transition-colors">
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Choose when and how you receive notifications</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: "New Contact Added", desc: "Notify when a new contact is created", email: true, sms: false, push: true },
                    { label: "New Message Received", desc: "Notify on new conversations", email: true, sms: true, push: true },
                    { label: "Deal Won", desc: "Notify when a deal is marked as won", email: true, sms: false, push: true },
                    { label: "Appointment Reminder", desc: "Reminder before scheduled appointments", email: true, sms: true, push: true },
                    { label: "Campaign Sent", desc: "Notify when email campaign is sent", email: true, sms: false, push: false },
                    { label: "Workflow Triggered", desc: "Notify when an automation runs", email: false, sms: false, push: true },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{notif.desc}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        {[
                          { label: "Email", key: "email", active: notif.email },
                          { label: "SMS", key: "sms", active: notif.sms },
                          { label: "Push", key: "push", active: notif.push },
                        ].map((ch) => (
                          <div key={ch.key} className="flex flex-col items-center gap-1">
                            <div className={cn(
                              "w-9 h-5 rounded-full relative cursor-pointer transition-colors",
                              ch.active ? "bg-[#00b4d8]" : "bg-gray-200"
                            )}>
                              <div className={cn(
                                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                                ch.active ? "translate-x-4" : "translate-x-0.5"
                              )} />
                            </div>
                            <span className="text-[10px] text-gray-400">{ch.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === "billing" && (
              <div className="space-y-5">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
                  <div className="flex items-center justify-between p-4 bg-[#00b4d8]/5 border border-[#00b4d8]/20 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">Agency Plan</p>
                      <p className="text-sm text-gray-500 mt-0.5">Unlimited contacts · 10 team members · All features</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">$297<span className="text-sm font-normal text-gray-500">/mo</span></p>
                      <button className="text-xs text-[#00b4d8] hover:underline mt-1">Upgrade Plan</button>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-xs text-gray-400">Expires 09/2028</p>
                    </div>
                    <button className="ml-auto text-xs text-[#00b4d8] hover:underline">Update</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
