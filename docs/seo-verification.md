# SEO & Structured Data Verification

This document dictates the procedure for verifying the JSON-LD schemas embedded on Logic Intelligence Technologies properties.

## Verification Checklist
1. **Tooling**: Use the [Google Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/).
2. **Person Schema**: Ensure the `@id` matches `https://www.logicintelligencetechnologies.in/#founder` across all instances to stitch the identity graph.
3. **Organization Schema**: Must link to the Founder ID via the `founder` property.
4. **sameAs Array**: All verified social footprints and the portfolio URL must be listed in the `sameAs` array for the `Person` node.
5. **Image Validation**: `image` node must be a `ImageObject` or absolute URL linking to the exact, verified `.webp` assets in the `/images/founder/` directory.

## Testing Protocol
When changes are made to `src/config/founder.ts`, verify that `src/lib/seo/schema.ts` correctly unpacks the arrays (especially `knowsAbout`) without generating nested arrays or invalid schema structures.
