"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"

interface Question {
  id: number
  question: string
  answer: string
}

export function QuestionManager({ onQuestionsUpdated }: { onQuestionsUpdated: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("quiz_questions")
    if (saved) {
      setQuestions(JSON.parse(saved))
    }
  }, [])

  const saveQuestions = (qs: Question[]) => {
    localStorage.setItem("quiz_questions", JSON.stringify(qs))
    setQuestions(qs)
    onQuestionsUpdated()
  }

  const addQuestion = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert("Vui lòng nhập cả câu hỏi và câu trả lời")
      return
    }

    if (questions.length >= 9) {
      alert("Bạn chỉ có thể thêm tối đa 9 câu hỏi")
      return
    }

    const newId = Math.max(0, ...questions.map((q) => q.id)) + 1
    const updated = [...questions, { id: newId, question: newQuestion, answer: newAnswer }]
    saveQuestions(updated)
    setNewQuestion("")
    setNewAnswer("")
  }

  const deleteQuestion = (id: number) => {
    const updated = questions.filter((q) => q.id !== id)
    saveQuestions(updated)
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 dark:bg-slate-800 rounded-lg p-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold text-white dark:text-white mb-4">Thêm Câu Hỏi ({questions.length}/9)</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 dark:text-slate-200 mb-2">Câu Hỏi</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="w-full p-3 border border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 dark:text-slate-200 mb-2">Câu Trả Lời</label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Nhập câu trả lời (có thể có dấu xuống dòng, dấu cách, tab,...)..."
              className="w-full p-3 border border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 resize-none"
              rows={4}
            />
          </div>

          <button
            onClick={addQuestion}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Thêm Câu Hỏi
          </button>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 dark:text-slate-100 mb-4">
          Danh Sách Câu Hỏi ({questions.length}/9)
        </h3>
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-400">
              Chưa có câu hỏi nào. Hãy thêm câu hỏi để bắt đầu.
            </div>
          ) : (
            questions.map((q, index) => (
              <Card key={q.id} className="p-4 bg-slate-700 dark:bg-slate-700">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 dark:text-slate-400 font-medium mb-1">Câu {index + 1}</p>
                    <p className="font-medium text-slate-100 dark:text-slate-100 mb-2">{q.question}</p>
                    <p className="text-sm text-slate-300 dark:text-slate-300 whitespace-pre-wrap max-h-24 overflow-auto">
                      {q.answer}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="p-2 text-red-500 hover:bg-red-900/30 dark:hover:bg-red-900/30 rounded-lg transition"
                    title="Xóa"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
