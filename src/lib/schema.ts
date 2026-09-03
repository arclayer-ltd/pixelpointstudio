import { siteUrl } from "./env";

export function marketingJsonLd() {
  const url = siteUrl();
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OwnerShot Ads",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android",
    url,
    description:
      "A shop owner photographs their own product. OwnerShot Ads writes original listing copy and makes original stills plus a 12–15 second ad.",
    creator: {
      "@type": "Organization",
      name: "Pixelpoint Studio",
      url,
    },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is OwnerShot Ads?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A shop owner photographs their own product. The app writes original listing copy and makes original stills plus a short ad. No stock, no celebrity, no third-party brands.",
        },
      },
      {
        "@type": "Question",
        name: "Who is it for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Independent shop owners and makers who already have a physical product and a phone. Not agencies. Not resellers of other people’s catalogs.",
        },
      },
      {
        "@type": "Question",
        name: "What do I get from one owner photo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A searchable title, hook, and description; a square cover and 9:16 still; a 12–15 second original video; and a Google Play / social export pack.",
        },
      },
      {
        "@type": "Question",
        name: "What is not allowed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stock packs, celebrity likeness, film IP, licensed music, and third-party brand pickers. You warrant you own the photos and may advertise the product.",
        },
      },
    ],
  };
  return [software, faq];
}
