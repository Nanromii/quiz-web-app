"use client"

import { useState, useEffect } from "react"
import { QuestionManager } from "./question-manager"
import { QuizMode } from "./quiz-mode"
import { HistoryView } from "./history-view"

type AppTab = "manage" | "practice" | "history"

export function QuizApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("manage")
  const [questionsLoaded, setQuestionsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("quiz_questions")
    if (saved) {
      setQuestionsLoaded(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Luyện Tập</h1>
          <p className="text-slate-300">Ôn tập cho bài kiểm tra cuối kì</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "manage"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
          >
            Quản Lý Câu Hỏi
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            disabled={!questionsLoaded}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "practice"
                ? "bg-indigo-600 text-white shadow-lg"
                : questionsLoaded
                  ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                  : "bg-slate-600 text-slate-500 cursor-not-allowed"
            }`}
          >
            Luyện Tập
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "history"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
          >
            Lịch Sử
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8">
          {activeTab === "manage" && <QuestionManager onQuestionsUpdated={() => setQuestionsLoaded(true)} />}
          {activeTab === "practice" && <QuizMode />}
          {activeTab === "history" && <HistoryView />}
        </div>
      </div>
    </div>
  )
}
