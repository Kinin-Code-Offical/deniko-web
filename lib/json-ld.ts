import type {
  Organization,
  WebSite,
  WithContext,
  BreadcrumbList,
  SearchAction,
  Person,
} from "schema-dts";

// Extend SearchAction to include Google-specific 'query-input'
interface GoogleSearchAction extends SearchAction {
  "query-input": string;
}

export function generatePersonSchema(
  name: string,
  url: string,
  image?: string | null
): WithContext<Person> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    ...(image ? { image } : {}),
  };
}

export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Deniko",
    url: "https://deniko.net",
    logo: "https://deniko.net/logo.png",
    sameAs: [
      "https://github.com/Kinin-Code-Offical",
      "https://patreon.com/deniko",
    ],
  };
}

export function generateWebSiteSchema(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Deniko",
    url: "https://deniko.net",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://deniko.net/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    } as GoogleSearchAction,
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; item: string }[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}
