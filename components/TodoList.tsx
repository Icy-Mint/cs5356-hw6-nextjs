"use client"

import { useRef } from "react"
import { useActionState, useOptimistic } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"

import { createTodo } from "@/actions/todos"

type CreateTodoState = {
  error?: string
  success?: boolean
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null)

  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, newTitle: string) => [
      ...currentTodos,
      {
        id: `temp-${Date.now()}`,
        title: newTitle,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "optimistic",
      },
    ]
  )

  async function createTodoLocal(
    _prevState: CreateTodoState,
    formData: FormData
  ): Promise<CreateTodoState> {
    const title = formData.get("title")?.toString().trim()

    if (!title) return { error: "Title cannot be empty" }

    // Optimistic UI update
    setOptimisticTodos(title)

    const result = await createTodo(formData)

    if (result.success) {
      formRef.current?.reset()
    }

    return result
  }

  const [state, formAction] = useActionState<CreateTodoState, FormData>(
    createTodoLocal,
    { error: undefined, success: false }
  )

  return (
    <div className="space-y-4">
      <form
        ref={formRef}
        action={formAction}
        className="flex gap-2 items-stretch"
      >
        <Input name="title" placeholder="Add a new todo..." />
        <Button type="submit">Add</Button>
        {state.error && (
          <p className="text-red-500 text-sm self-center ml-2">
            {state.error}
          </p>
        )}
      </form>

      <ul className="space-y-2">
        {optimisticTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  )
}
