import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postview";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostByUserId.useQuery({ userId: props.userId })

  if (isLoading) return <LoadingSpinner />

  if (!data || data.length == 0) return <div>User has not posted</div>


  return (
    <div className="flex flex-col">
      {data.map(fullPost => <PostView {...fullPost} key={fullPost.post.id} />)}
    </div>
  )
}



const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({ username: username })


  if (!data) return <div>404</div>


  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-48 bg-slate-600">
          <Image src={data.profileImageUrl} alt={`Profile image of ${data.username}`}
            width={128}
            height={128}
            className=" absolute bottom-[-64px] left-0 ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl">{`@${data.username}`}</div>
        <div className="border-b border-w-full"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
}




export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug

  if (typeof slug !== 'string') throw new Error('No slug')

  const username = slug.replace("@", '')
  await ssg.profile.getUserByUsername.prefetch({ username: username })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" }
}
export default ProfilePage
