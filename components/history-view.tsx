"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface Result {
  questionId: number
  userAnswer: string
  accuracy: number
  timestamp: string
}

interface Question {
  id: number
  question: string
  answer: string
}

interface QuestionStats {
  questionId: number
  question: string
  attempts: number
  avgAccuracy: number
  results: Result[]
}

export function HistoryView() {
  const [history, setHistory] = useState<Result[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  useEffect(() => {
    const savedHistory = localStorage.getItem("quiz_history")
    const savedQuestions = localStorage.getItem("quiz_questions")
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions))
  }, [])

  const getQuestionStats = (): QuestionStats[] => {
    const statsMap = new Map<number, QuestionStats>()

    // Initialize stats for all questions
    questions.forEach((q) => {
      statsMap.set(q.id, {
        questionId: q.id,
        question: q.question,
        attempts: 0,
        avgAccuracy: 0,
        results: [],
      })
    })

    // Populate with actual results
    history.forEach((result) => {
      const stats = statsMap.get(result.questionId)
      if (stats) {
        stats.attempts += 1
        stats.results.push(result)
      }
    })

    // Calculate average accuracy
    statsMap.forEach((stats) => {
      if (stats.results.length > 0) {
        stats.avgAccuracy = stats.results.reduce((sum, r) => sum + r.accuracy, 0) / stats.results.length
      }
    })

    return Array.from(statsMap.values()).sort((a, b) => a.questionId - b.questionId)
  }

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return "text-green-400"
    if (acc >= 70) return "text-blue-400"
    if (acc >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const toggleExpandQuestion = (qId: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(qId)) {
      newExpanded.delete(qId)
    } else {
      newExpanded.add(qId)
    }
    setExpandedQuestions(newExpanded)
  }

  const toggleExpandResult = (key: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedResults(newExpanded)
  }

  const clearHistory = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả lịch sử?")) {
      localStorage.setItem("quiz_history", "[]")
      setHistory([])
    }
  }

  const deleteResult = (qId: number, resultIndex: number) => {
    const updated = history.filter(
      (r) => !(r.questionId === qId && history.filter((h) => h.questionId === qId).indexOf(r) === resultIndex),
    )
    localStorage.setItem("quiz_history", JSON.stringify(updated))
    setHistory(updated)
  }

  const stats = getQuestionStats()
  const hasHistory = history.length > 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Lịch Sử Luyện Tập Theo Câu Hỏi</h2>
        {hasHistory && (
          <button onClick={clearHistory} className="px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition">
            Xóa Tất Cả
          </button>
        )}
      </div>

      {!hasHistory ? (
        <div className="text-center py-12 text-slate-400">
          <p className="mb-2">📝</p>
          <p>Chưa có lịch sử luyện tập nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((stat) => (
            <Card key={stat.questionId} className="bg-slate-700 overflow-hidden">
              <div
                onClick={() => toggleExpandQuestion(stat.questionId)}
                className="p-4 cursor-pointer hover:bg-slate-600 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-400 mb-1">Câu {stat.questionId}</p>
                    <p className="font-medium text-slate-100 mb-2 line-clamp-2">{stat.question}</p>
                    <div className="flex gap-4 text-sm text-slate-300">
                      <span>
                        Số lần làm: <span className="font-semibold text-slate-100">{stat.attempts}</span>
                      </span>
                      <span>
                        Trung bình:{" "}
                        <span className={`font-semibold ${getAccuracyColor(stat.avgAccuracy)}`}>
                          {stat.avgAccuracy.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 flex-shrink-0">
                    {expandedQuestions.has(stat.questionId) ? "▼" : "▶"}
                  </div>
                </div>
              </div>

              {expandedQuestions.has(stat.questionId) && (
                <div className="border-t border-slate-600 bg-slate-750 p-4 space-y-3">
                  {[...stat.results].reverse().map((result, idx) => {
                    const resultKey = `${stat.questionId}-${idx}`
                    const isExpanded = expandedResults.has(resultKey)
                    const time = new Date(result.timestamp).toLocaleString("vi-VN")

                    return (
                      <Card key={resultKey} className="bg-slate-800 p-3">
                        <div
                          onClick={() => toggleExpandResult(resultKey)}
                          className="flex justify-between items-center gap-3 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 mb-1">{time}</p>
                            <p className={`text-base font-bold ${getAccuracyColor(result.accuracy)}`}>
                              {result.accuracy.toFixed(1)}%
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteResult(stat.questionId, idx)
                            }}
                            className="p-2 text-red-500 hover:bg-red-900/30 rounded-lg transition flex-shrink-0"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                            <div className="bg-slate-700 p-2 rounded text-xs">
                              <p className="text-slate-400 font-semibold mb-1">Câu trả lời của bạn:</p>
                              <p className="text-slate-200 whitespace-pre-wrap break-words text-sm">
                                {result.userAnswer}
                              </p>
                            </div>
                            <div className="bg-slate-700 p-2 rounded text-xs">
                              <p className="text-slate-400 font-semibold mb-1">Đáp án đúng:</p>
                              <p className="text-slate-200 whitespace-pre-wrap break-words text-sm">
                                {questions.find((q) => q.id === stat.questionId)?.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
