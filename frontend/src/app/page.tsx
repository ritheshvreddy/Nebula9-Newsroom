"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js"; 
import ReactMarkdown from 'react-markdown'; // Imported for Vision Text Formatting

// Components
import TiptapEditor from "./components/TiptapEditor";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import StoryBrief from "./components/StoryBrief";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  // --- STATE MANAGEMENT ---
  
  // Session & View State
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<"dashboard" | "create" | "editor">("dashboard");
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Role State (Default to 'writer' for safety)
  const [role, setRole] = useState<string>("writer");

  // Data State
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  
  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Vision Tool States
  const [imageUrl, setImageUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // --- EFFECTS ---

  // 1. Check Session & Fetch Role
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        // Fetch Role from 'profiles' table
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data) setRole(data.role);
      }
      setLoadingSession(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingSession(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Articles for Dashboard
  const fetchArticles = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/articles");
      setArticles(data);
    } catch (e) {
      console.error("Backend offline or empty", e);
    }
  };

  useEffect(() => {
    if (session && view === "dashboard") fetchArticles();
  }, [session, view]);

  // --- HANDLERS ---

  const handleGenerate = async (briefData: any) => {
    setIsGenerating(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/generate", briefData);
      setCurrentArticle({
        title: briefData.topic,
        content: res.data.article,
        status: "Draft",
        angle: briefData.angle
      });
      setSources(res.data.sources || []); 
      setView("editor");
    } catch (error) {
      alert("Error generating story. Ensure backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: string) => {
    if (!currentArticle) return;
    setIsSaving(true);
    try {
      await axios.post("http://127.0.0.1:8000/articles", {
        id: currentArticle.id,
        title: currentArticle.title,
        content: currentArticle.content,
        angle: currentArticle.angle,
        status: status,
        sources: sources
      });
      alert("✅ Saved successfully!");
      if (!currentArticle.id) setView("dashboard");
    } catch (error) {
      alert("Error saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    setAnalysis("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/analyze-image", { image_url: imageUrl });
      setAnalysis(res.data.analysis);
    } catch (error) {
      alert("Error analyzing image. Ensure URL is valid.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEdit = (article: any) => {
    setCurrentArticle(article);
    setSources(article.sources || []);
    setView("editor");
  };

  const handleLogout = async () => await supabase.auth.signOut();

  // --- RENDER ---

  if (loadingSession) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return <Auth />;

  return (
    <main className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("dashboard")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Nebula9 <span className="text-blue-600">Newsroom</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Role Badge */}
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider border border-blue-100">
               ROLE: {role}
             </span>

             <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 border-l border-gray-200 pl-4">
               Logout
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* VIEW 1: DASHBOARD */}
        {view === "dashboard" && (
          <Dashboard 
            articles={articles} 
            onCreateNew={() => setView("create")} 
            onEdit={handleEdit} 
          />
        )}

        {/* VIEW 2: CREATE BRIEF */}
        {view === "create" && (
          <div>
            <button onClick={() => setView("dashboard")} className="mb-4 text-gray-500 hover:text-gray-900">← Back to Dashboard</button>
            <StoryBrief onGenerate={handleGenerate} loading={isGenerating} />
          </div>
        )}

        {/* VIEW 3: EDITOR */}
        {view === "editor" && currentArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Editor Column */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <input 
                  value={currentArticle.title} 
                  onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
                  className="text-2xl font-bold bg-transparent border-none focus:ring-0 w-full"
                />
              </div>
              <TiptapEditor 
                content={currentArticle.content} 
                onChange={(newContent: string) => setCurrentArticle({...currentArticle, content: newContent})} 
              />
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              
              {/* 1. Status Card (RBAC) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Editorial Status</h3>
                <div className="flex flex-col gap-2">
                  <select 
                    value={currentArticle.status || "Draft"}
                    onChange={(e) => setCurrentArticle({...currentArticle, status: e.target.value})}
                    disabled={role !== "editor"} 
                    className={`w-full p-2 border border-gray-300 rounded-md mb-2 ${
                      role !== "editor" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"
                    }`}
                  >
                    <option>Draft</option>
                    <option>In Review</option>
                    <option>Approved</option>
                  </select>

                  {role !== "editor" && (
                    <p className="text-xs text-gray-500 mb-1">
                      *Only Editors can change publication status.
                    </p>
                  )}

                  <button 
                    onClick={() => handleSave(currentArticle.status)}
                    disabled={isSaving}
                    className="w-full py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* 2. AI VISION ANALYST CARD (Restored & Improved) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                   <span className="text-lg">👁️</span>
                   <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">AI Vision Analyst</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Paste an image URL to generate a caption.</p>
                
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                />
                
                <button
                  onClick={handleAnalyzeImage}
                  disabled={analyzing || !imageUrl}
                  className="w-full py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 mb-3 transition-colors"
                >
                  {analyzing ? "Analyzing..." : "Analyze Image"}
                </button>

                {/* Markdown Rendered Output */}
                {analysis && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-gray-800 shadow-sm mt-3">
                    <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Analysis Report</h4>
                    <div className="prose prose-sm prose-purple max-w-none leading-relaxed">
                      <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Citations Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sources & Citations</h3>
                {sources.length > 0 ? (
                  <ul className="space-y-3">
                    {sources.map((source: any, idx: number) => (
                      <li key={idx} className="text-sm">
                        <div className="flex gap-2">
                          <span className="text-blue-500 font-bold">[{idx + 1}]</span>
                          <a href={source.url} target="_blank" className="text-gray-700 hover:text-blue-600 hover:underline truncate block">
                            {source.title || source.url}
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No sources linked.</p>
                )}
              </div>
              
              {/* 4. Brief Info Card */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Original Angle</h3>
                <p className="text-sm text-gray-600 italic">{currentArticle.angle || "No brief available"}</p>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}