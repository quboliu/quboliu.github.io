import { getCollection } from "astro:content";
import { getPostSlug } from "./getPostPaths";
import { getSortedPosts } from "./getSortedPosts";
import { getRepostKind } from "./getRepostKind";

export async function getArticlePages() {
  const posts = await getCollection("posts");
  const sortedPosts = getSortedPosts(posts);

  const postGroups = [
    sortedPosts.filter(post => getRepostKind(post) === null),
    sortedPosts.filter(post => getRepostKind(post) !== null),
  ];

  return postGroups.flatMap(group =>
    group.map((post, index) => ({
      params: { slug: getPostSlug(post.id, post.filePath) },
      props: {
        post,
        prevPost:
          index > 0
            ? {
                id: group[index - 1].id,
                title: group[index - 1].data.title,
                filePath: group[index - 1].filePath,
              }
            : null,
        nextPost:
          index < group.length - 1
            ? {
                id: group[index + 1].id,
                title: group[index + 1].data.title,
                filePath: group[index + 1].filePath,
              }
            : null,
      },
    }))
  );
}
