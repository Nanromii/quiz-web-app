"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ResultDisplay } from "./result-display"

interface Question {
  id: number
  question: string
  answer: string
}

type Mode = "select" | "random" | null

interface Result {
  questionId: number
  userAnswer: string
  accuracy: number
  timestamp: string
}

export function QuizMode() {
  const [mode, setMode] = useState<Mode>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("quiz_questions")
    if (saved) {
      setQuestions(JSON.parse(saved))
    }
  }, [])

  const normalizeText = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[.,!?;:()[\]{}—]/g, "")
      .replace(/\s+/g, " ")
      .trim()

  const levenshteinDistance = (a: string, b: string): number => {
    const m = a.length
    const n = b.length
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }

    return dp[m][n]
  }

  const calculateAccuracy = (userAnswer: string, correctAnswer: string): number => {
    const norm1 = normalizeText(userAnswer)
    const norm2 = normalizeText(correctAnswer)
    if (norm1 === norm2) return 100

    const distance = levenshteinDistance(norm1, norm2)
    const maxLen = Math.max(norm1.length, norm2.length)
    return Math.round(Math.max(0, ((maxLen - distance) / maxLen) * 100) * 10) / 10
  }

  const handleSubmit = (question: Question) => {
    if (!userAnswer.trim()) {
      alert("Vui lòng nhập câu trả lời")
      return
    }

    const newResult: Result = {
      questionId: question.id,
      userAnswer,
      accuracy: calculateAccuracy(userAnswer, question.answer),
      timestamp: new Date().toISOString(),
    }

    setResult(newResult)

    const history = JSON.parse(localStorage.getItem("quiz_history") || "[]")
    history.push(newResult)
    localStorage.setItem("quiz_history", JSON.stringify(history))
  }

  const handleReset = () => {
    setUserAnswer("")
    setResult(null)
    setSelectedQuestion(null)
    setMode(null)
  }

  /* ================= MODE SELECT ================= */
  if (!mode) {
    return (
      <div className="space-y-6 text-slate-100">
        <h2 className="text-2xl font-bold text-center">
          Chọn Chế Độ Luyện Tập
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => setMode("select")}
            className="p-8 cursor-pointer bg-slate-700 hover:bg-slate-600 transition border-2 border-transparent hover:border-blue-500 text-center"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Tự Chọn Câu Hỏi</h3>
            <p className="text-slate-300">Bạn chọn câu hỏi muốn trả lời</p>
          </Card>

          <Card
            onClick={() => setMode("random")}
            className="p-8 cursor-pointer bg-slate-700 hover:bg-slate-600 transition border-2 border-transparent hover:border-indigo-500 text-center"
          >
            <div className="text-4xl mb-4">🎲</div>
            <h3 className="text-xl font-bold mb-2">Random Câu Hỏi</h3>
            <p className="text-slate-300">Hệ thống chọn ngẫu nhiên 1 câu</p>
          </Card>
        </div>
      </div>
    )
  }

  /* ================= SELECT QUESTION ================= */
  if (!selectedQuestion) {
    if (mode === "random") {
      setSelectedQuestion(questions[Math.floor(Math.random() * questions.length)])
      return null
    }

    return (
      <div className="space-y-4 text-slate-100">
        <h2 className="text-2xl font-bold">Chọn Câu Hỏi</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuestion(q)}
              className="p-4 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition text-left"
            >
              <p className="font-bold">Câu {index + 1}</p>
              <p className="text-sm text-slate-300 line-clamp-2">
                {q.question}
              </p>
            </button>
          ))}
        </div>

        <Button onClick={handleReset} className="w-full bg-slate-600 hover:bg-slate-500 text-white">
          Quay Lại
        </Button>
      </div>
    )
  }

  /* ================= RESULT ================= */
  if (result) {
    return (
      <ResultDisplay
        question={selectedQuestion}
        userAnswer={result.userAnswer}
        accuracy={result.accuracy}
        onReset={handleReset}
      />
    )
  }

  /* ================= ANSWER ================= */
  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-700 rounded-lg p-6 border-l-4 border-indigo-500">
        <p className="text-sm text-slate-400 font-medium mb-2">Câu Hỏi</p>
        <p className="text-xl font-semibold whitespace-pre-wrap">
          {selectedQuestion.question}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          Câu Trả Lời Của Bạn
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Nhập câu trả lời của bạn..."
          rows={8}
          className="w-full p-4 rounded-lg resize-none
            bg-slate-700 text-slate-100 placeholder:text-slate-400
            border border-slate-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => handleSubmit(selectedQuestion)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Nộp Bài
        </Button>
        <Button
          onClick={handleReset}
          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white"
        >
          Quay Lại
        </Button>
      </div>
    </div>
  )
}
