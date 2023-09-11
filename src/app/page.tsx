import { options } from "./api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"
import UserCard from "./components/UserCard"

export default async function Home() {
  const session = await getServerSession(options)

  return (
    <>
      {session ? (
        <div>
          <h1 className="text-5xl">Hello, {session?.user?.email}!</h1>
          <UserCard user={session?.user} pagetype={"Home"} />
        </div>
      ) : (
        <h1 className="text-5xl">You Shall Not Pass!</h1>
      )}
    </>
  )
}
