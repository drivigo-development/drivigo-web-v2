// src/components/Lessons.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Lessons() {
  const lessons = [
    {
      day: 1,
      title: "Vehicle Basics & Safety",
      desc: "Get familiar with dashboard, mirrors, seat position, seatbelt, and safety checks. Understand pedals, gears, and basic car controls before moving.",
      icon: "🔰",
    },
    {
      day: 2,
      title: "Smooth Starts, Stops & Steering",
      desc: "Practice gentle acceleration, controlled braking, and hand-over-hand steering. Learn clutch control (if manual) for smooth takeoffs.",
      icon: "🛞",
    },
    {
      day: 3,
      title: "Reversing & Low-Speed Control",
      desc: "Master reversing in straight lines and gentle curves. Learn mirror usage and surroundings awareness at low speeds.",
      icon: "↩️",
    },
    {
      day: 4,
      title: "Parking Essentials",
      desc: "Parallel, perpendicular, and angle parking fundamentals. Learn reference points, alignment, and safe exit from parking spots.",
      icon: "🅿️",
    },
    {
      day: 5,
      title: "Road Signs & Lane Discipline",
      desc: "Understand common signs, right of way, lane changes, and signalling. Build confidence in mixed traffic environments.",
      icon: "🚦",
    },
    {
      day: 6,
      title: "City / Highway Practice",
      desc: "Merge, maintain speed, and handle overtaking safely. Focus on scanning, following distance, and hazard anticipation.",
      icon: "🛣️",
    },
    {
      day: 7,
      title: "Assessment & Feedback",
      desc: "A complete drive covering all skills. Get actionable feedback, next steps, and tips to keep improving.",
      icon: "✅",
    },
  ];

  return (
    <section id="lessons" className="w-full bg-gradient-to-b from-yellow-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Driving Lessons
          </h2>
          <p className="mt-3 text-gray-600 max-w-3xl mx-auto">
            Learn step by step with certified instructors.
          </p>
        </div>

        {/* First row: 4 lessons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {lessons.slice(0, 4).map(({ day, title, desc, icon }) => (
            <div
              key={day}
              className="relative rounded-2xl border border-yellow-200 bg-white shadow-sm hover:shadow-md transition p-6"
            >
              <div className="absolute top-0 left-0 -translate-x-2 -translate-y-2 rotate-[-3deg]">
                <div className="bg-yellow-400 text-gray-900 font-bold px-4 py-1 rounded-md shadow">
                  Hour {day}
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                <div className="text-3xl">{icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Second row: 3 lessons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lessons.slice(4).map(({ day, title, desc, icon }) => (
            <div
              key={day}
              className="relative rounded-2xl border border-yellow-200 bg-white shadow-sm hover:shadow-md transition p-6"
            >
              <div className="absolute top-0 left-0 -translate-x-2 -translate-y-2 rotate-[-3deg]">
                <div className="bg-yellow-400 text-gray-900 font-bold px-4 py-1 rounded-md shadow">
                  Hour {day}
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                <div className="text-3xl">{icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

<div className="w-full flex justify-center items-center">
        <Link to="/signup" className="btn-danger text-lg px-8 py-2 rounded-xl text-white font-medium mt-4 inline-block">
          Book Now
        </Link>
</div>
      </div>
    </section>
  );
}
