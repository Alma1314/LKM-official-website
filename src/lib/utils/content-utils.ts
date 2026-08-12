// The old SSG blog content collection has been removed (Task 8 of blog unification).
// These functions now return empty data. The blog sidebar widgets (Tags.astro, Categories.astro)
// display this data. If content is needed in the future, fetch from the blog API instead.

export async function getSortedPosts(): Promise<never[]> {
  return [];
}

export async function getSortedPostsList(): Promise<never[]> {
  return [];
}

export type Tag = {
  name: string;
  count: number;
};

export async function getTagList(): Promise<Tag[]> {
  return [];
}

export type Category = {
  name: string;
  count: number;
  url: string;
};

export async function getCategoryList(): Promise<Category[]> {
  return [];
}
