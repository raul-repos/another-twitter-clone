import type { RouterOutputs } from "~/utils/api"
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)


type PostWithUser = RouterOutputs["post"]["getAll"][number]
export const PostView = (props: PostWithUser) => {
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