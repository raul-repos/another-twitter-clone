import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api"
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { TRPCError } from "@trpc/server";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const [post, setPost] = useState('')
  const { user } = useUser()


  if (!user) return null

  const ctx = api.useContext()
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: async () => {
      setPost('')
      await ctx.post.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error('Failed to post! Please try again later.')
      }
    }
  })

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="w-24 h-24 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        value={post}
        type="text"
        onChange={e => setPost(e.currentTarget.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (post !== '') {
              mutate({ content: post })
            }
          }
        }}
        disabled={isPosting}
      />

      {post !== '' && !isPosting && (
        <button onClick={() => mutate({ content: post })}
        >Post</button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={24} />
        </div>
      )}

    </div>
  )
}

type PostWithUser = RouterOutputs["post"]["getAll"][number]
const PostView = (props: PostWithUser) => {
  const { post, author } = props
  return (
    <div key={post.id} className="p-4 border-b border-slate-400 flex gap-3 ">
      <Image
        src={author.profileImageUrl}
        className="w-12 h-12 rounded-full"
        alt={`@${author.username} profile image`}
        width={56}
        height={56}
      />
      <div className="flex flex-col text-slate-400">
        <div className="flex">
          <Link href={`@${author.username}`}>
            <span>{`@${author.username}‏‏‎ ‎`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{`published ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <div>
          {post.content}
        </div>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postLoading } = api.post.getAll.useQuery()

  if (postLoading) return <LoadingPage />

  if (!data) throw new TRPCError({ message: "Post not found", code: "INTERNAL_SERVER_ERROR" })

  return (
    <div className="flex flex-col">
      {data?.map((post) => <PostView {...post} key={post.post.id} />)}
    </div>
  )

}

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser()

  // Results are cached, used to get posts ASAP
  api.post.getAll.useQuery()

  if (!userLoaded) return <div />


  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-400 p-4 flex">

          {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
          {isSignedIn && <div><CreatePostWizard></CreatePostWizard><SignOutButton /></div>}
        </div>
        <Feed />
      </PageLayout>


    </>
  );
}
