interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * RENDERING STRATEGY:
 *
 * 1. Static Site Generation (SSG) - Recommended for performance
 *    - Use `generateStaticParams` to pre-render pages at build time.
 *    - Best for: Blog posts, marketing pages, documentation.
 *    - Pros: Fastest TTFB, lower server load.
 *    - Cons: Build time increases with page count (unless using ISR).
 *
 * 2. Server-Side Rendering (SSR) - Default for dynamic routes without `generateStaticParams`
 *    - Pages are rendered on every request.
 *    - Best for: User-specific dashboards, real-time data, highly dynamic content.
 *    - Pros: Always fresh data.
 *    - Cons: Slower TTFB, higher server load.
 *
 * 3. Incremental Static Regeneration (ISR)
 *    - Use `export const revalidate = 60` (seconds) to update static pages in the background.
 */

// Uncomment the following function to enable SSG (Static Site Generation)
/*
export async function generateStaticParams() {
  // Fetch all possible slugs from your database or API
  // const posts = await db.post.findMany()
  
  // return posts.map((post) => ({
  //   slug: post.slug,
  // }))
  return []
}
*/

// Optional: Set revalidation time for ISR (in seconds)
// export const revalidate = 3600

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch data based on slug
  // const data = await getData(slug)

  // if (!data) {
  //   notFound()
  // }

  return (
    <main>
      <h1>Dynamic Page: {slug}</h1>
      <p>
        Choose your rendering strategy wisely based on data freshness
        requirements and performance goals.
      </p>
    </main>
  );
}
