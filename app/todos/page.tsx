import { TodoList } from "@/components/TodoList"
import { todos as todosTable, Todo } from "@/database/schema"

//import auth + db utils
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers"; //  to extract session from cookies

export default async function TodosPage() {
    //  fetch session
    const session = await auth.api.getSession({ headers: await headers() });
    // if not logged in, render nothing or fallback UI
    if (!session?.user) {
        return null; // or return <p>Please log in to view your todos.</p>
    }
    
    // fetch todos that belong to the current user from the DB
    const todos = await db.query.todos.findMany({
        where: eq(todosTable.userId, session.user.id),
        orderBy: (todos, { desc }) => [desc(todos.createdAt)],
    });

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Todos</h1>
                <TodoList todos={todos} />
            </section>
        </main>
    )
} 