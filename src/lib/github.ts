const USERNAME = "cassianthayes";
const PINNED_LIMIT = 6;
const CACHE_SECONDS = 60 * 60;

// Cache key only: nothing is served from this URL.
const CACHE_KEY = "https://cssnt.ru/__cache/pinned-repositories";

export interface PinnedRepository {
    name: string;
    description: string | null;
}

interface PinnedItemsResponse {
    data?: {
        user?: {
            pinnedItems?: {
                nodes?: ({ name: string; description: string | null } | null)[];
            };
        };
    };
}

const QUERY = `query PinnedRepositories($login: String!) {
    user(login: $login) {
        pinnedItems(first: ${PINNED_LIMIT}, types: REPOSITORY) {
            nodes {
                ... on Repository {
                    name
                    description
                }
            }
        }
    }
}`;

/**
 * Repositories pinned on the GitHub profile, cached for an hour. Returns null when
 * the profile cannot be read, so the page can say so instead of rendering an empty grid.
 */
export async function fetchPinnedRepositories(
    token: string | undefined,
): Promise<PinnedRepository[] | null> {
    if (!token) {
        console.error("GITHUB_TOKEN is not set, cannot read pinned repositories");
        return null;
    }

    // The DOM lib types `caches` as `CacheStorage`, which has no `default`; Workers adds one.
    const cache = (caches as unknown as { default: Cache }).default;
    const cacheKey = new Request(CACHE_KEY);
    const cached = await cache.match(cacheKey);
    if (cached) {
        return (await cached.json()) as PinnedRepository[];
    }

    try {
        const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                authorization: `Bearer ${token}`,
                "content-type": "application/json",
                "user-agent": "cssnt-ru",
            },
            body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
        });

        if (!response.ok) {
            throw new Error(`GitHub responded ${response.status}`);
        }

        const payload = (await response.json()) as PinnedItemsResponse;
        const nodes = payload.data?.user?.pinnedItems?.nodes ?? [];

        const repositories = nodes
            .filter((node): node is PinnedRepository => node !== null)
            .map((node) => ({ name: node.name, description: node.description }));

        await cache.put(
            cacheKey,
            new Response(JSON.stringify(repositories), {
                headers: { "cache-control": `max-age=${CACHE_SECONDS}` },
            }),
        );

        return repositories;
    } catch (error) {
        console.error("Reading pinned repositories failed", error);
        return null;
    }
}
