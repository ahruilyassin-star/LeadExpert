"use client";

import { useState } from "react";
import Header from "@/components/header";
import { appointments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight, X, Clock, User, Video, Phone, MapPin } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const typeIcon = (type: string) => {
  if (type === "Videocall") return <Video className="w-3.5 h-3.5" />;
  if (type === "Telefonisch") return <Phone className="w-3.5 h-3.5" />;
  if (type === "In persoon") return <MapPin className="w-3.5 h-3.5" />;
  return <Video className="w-3.5 h-3.5" />;
};

const typeColor = (type: string) => {
  if (type === "Videocall") return "bg-blue-100 text-blue-700";
  if (type === "Telefonisch") return "bg-green-100 text-green-700";
  if (type === "In persoon") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
};

export default function CalendarPage() {
  const today = new Date(2026, 4, 17); // May 17 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [showModal, setShowModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter(a => a.date === dateStr);
  };

  const upcomingAppointments = appointments
    .filter(a => a.date >= "2026-05-17")
    .sort((a, b) => a.date.localeCompare(b.date));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Calendar" />
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Appointment
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                if (!day) {
                  return <div key={"empty-" + idx} className="min-h-[100px] border-b border-r border-gray-50 bg-gray-50/30" />;
                }
                const dayAppointments = getAppointmentsForDay(day);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);

                return (
                  <div
                    key={day}
                    className={cn(
                      "min-h-[100px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-blue-50/30 cursor-pointer",
                      isWeekend && "bg-gray-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full mb-1",
                      isToday ? "bg-[#00b4d8] text-white" : "text-gray-700 hover:bg-gray-100"
                    )}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map(apt => (
                        <div key={apt.id} className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium truncate",
                          typeColor(apt.type)
                        )}>
                          {apt.time} {apt.contact.split(" ")[0]}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-[10px] text-gray-400 font-medium px-1">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Upcoming Appointments</h3>
                <p className="text-xs text-gray-400 mt-0.5">{upcomingAppointments.length} scheduled</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg flex-shrink-0", typeColor(apt.type))}>
                        {typeIcon(apt.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{apt.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{apt.contact}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {apt.date} at {apt.time}
                          </span>
                          <span className="text-xs text-gray-400">{apt.duration} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "This Week", value: appointments.filter(a => a.date >= "2026-05-17" && a.date <= "2026-05-23").length, color: "text-blue-600" },
                { label: "This Month", value: appointments.filter(a => a.date.startsWith("2026-05")).length, color: "text-purple-600" },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
                  <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">New Appointment</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Title *</label>
                <input type="text" placeholder="Discovery Call - John Smith" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Contact *</label>
                <input type="text" placeholder="Search contact..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
                  <input type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Time *</label>
                  <input type="time" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white">
                    <option>Videocall</option>
                    <option>Telefonisch</option>
                    <option>In persoon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Duration (min)</label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white">
                    <option>15</option>
                    <option>30</option>
                    <option>45</option>
                    <option>60</option>
                    <option>90</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea rows={3} placeholder="Optional notes..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors">Cancel</button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-medium bg-[#00b4d8] hover:bg-[#0096b7] text-white rounded-lg transition-colors">Create Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
