"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type React from "react"

interface Question {
  id: number
  question: string
  answer: string
}

interface ResultDisplayProps {
  question: Question
  userAnswer: string
  accuracy: number
  onReset: () => void
}

export function ResultDisplay({ question, userAnswer, accuracy, onReset }: ResultDisplayProps) {
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[.,!?;:()[\]{}—]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  const getColoredText = (user: string, correct: string) => {
    const normUser = normalizeText(user)
    const normCorrect = normalizeText(correct)

    if (normUser === normCorrect) {
      return (
        <span className="bg-green-200 dark:bg-green-950 text-green-900 dark:text-green-100 px-1 rounded">{user}</span>
      )
    }

    // Build LCS to find longest matching sequence
    const m = normUser.length
    const n = normCorrect.length
    const dp: number[][] = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (normUser[i - 1] === normCorrect[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    // Backtrack to find LCS indices
    const matchedUserIndices = new Set<number>()
    let i = m,
      j = n
    while (i > 0 && j > 0) {
      if (normUser[i - 1] === normCorrect[j - 1]) {
        matchedUserIndices.add(i - 1)
        i--
        j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    // Build colored output
    const parts: React.ReactNode[] = []
    for (let idx = 0; idx < user.length; idx++) {
      const isMatched = matchedUserIndices.has(idx)
      const char = user[idx]

      if (isMatched) {
        parts.push(
          <span key={idx} className="bg-green-200 dark:bg-green-950 text-green-900 dark:text-green-100">
            {char}
          </span>,
        )
      } else {
        parts.push(
          <span key={idx} className="bg-red-200 dark:bg-red-950 text-red-900 dark:text-red-100">
            {char}
          </span>,
        )
      }
    }

    return parts
  }

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return "text-green-600 dark:text-green-400"
    if (acc >= 70) return "text-blue-600 dark:text-blue-400"
    if (acc >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getAccuracyBgColor = (acc: number) => {
    if (acc >= 90) return "bg-green-50 dark:bg-gray-800"
    if (acc >= 70) return "bg-blue-50 dark:bg-gray-800"
    if (acc >= 50) return "bg-yellow-50 dark:bg-gray-800"
    return "bg-red-50 dark:bg-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Câu hỏi */}
      <Card className="p-6 bg-slate-50 dark:bg-gray-800 border-l-4 border-blue-500">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Câu Hỏi</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">{question.question}</p>
      </Card>

      {/* Câu trả lời của bạn với highlight */}
      <Card className="p-6 bg-slate-50 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">Câu Trả Lời Của Bạn</p>
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg text-lg leading-relaxed whitespace-pre-wrap break-words">
          {getColoredText(userAnswer, question.answer)}
        </div>
      </Card>

      {/* Đáp án đúng */}
      <Card className="p-6 bg-green-50 dark:bg-gray-800 border-l-4 border-green-500">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">Đáp Án Đúng</p>
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg text-lg leading-relaxed whitespace-pre-wrap break-words">
          <span className="bg-green-200 dark:bg-green-950 text-green-900 dark:text-green-100 px-1 rounded">
            {question.answer}
          </span>
        </div>
      </Card>

      {/* Kết quả chấm điểm */}
      <Card className={`p-6 border-l-4 border-blue-500 ${getAccuracyBgColor(accuracy)}`}>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Độ Chính Xác</p>
          <p className={`text-4xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy.toFixed(1)}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {accuracy >= 90
              ? "🌟 Xuất sắc!"
              : accuracy >= 70
                ? "✨ Tốt lắm!"
                : accuracy >= 50
                  ? "👍 Có tiến bộ"
                  : "💪 Hãy cố gắng thêm"}
          </p>
        </div>
      </Card>

      {/* Nút hành động */}
      <Button onClick={onReset} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3">
        Luyện Tập Thêm
      </Button>
    </div>
  )
}
