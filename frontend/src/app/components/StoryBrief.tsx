"use client";
import { useState } from "react";

interface BriefData {
  topic: string;
  angle: string;
  audience: string;
  tone: string;
  word_count: string;
}

export default function StoryBrief({ onGenerate, loading }: { onGenerate: (data: BriefData) => void, loading: boolean }) {
  const [data, setData] = useState<BriefData>({
    topic: "",
    angle: "",
    audience: "General Public",
    tone: "Neutral",
    word_count: "800"
  });

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Story Brief</h2>
      
      <div className="space-y-5">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Story Topic / Working Title</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., The Impact of AI on Healthcare"
            value={data.topic}
            onChange={(e) => setData({ ...data, topic: e.target.value })}
          />
        </div>

        {/* Angle Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Story Angle / Thesis</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
            placeholder="What is the core argument or unique perspective?"
            value={data.angle}
            onChange={(e) => setData({ ...data, angle: e.target.value })}
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Audience</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={data.audience}
              onChange={(e) => setData({ ...data, audience: e.target.value })}
            >
              <option>General Public</option>
              <option>Business / Execs</option>
              <option>Tech / Developers</option>
              <option>Policy Makers</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tone</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={data.tone}
              onChange={(e) => setData({ ...data, tone: e.target.value })}
            >
              <option>Neutral</option>
              <option>Investigative</option>
              <option>Opinionated</option>
              <option>Witty/Casual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Length</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={data.word_count}
              onChange={(e) => setData({ ...data, word_count: e.target.value })}
            >
              <option value="600">Short (600)</option>
              <option value="800">Standard (800)</option>
              <option value="1200">Longform (1200)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => onGenerate(data)}
          disabled={loading || !data.topic}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all shadow-md ${
            loading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
          }`}
        >
          {loading ? "AI Agent is Researching & Drafting..." : "Generate Story Draft"}
        </button>
      </div>
    </div>
  );
}