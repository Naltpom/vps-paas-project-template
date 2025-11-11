/**
 * Slug Generation Utility
 * Creates unique URL-safe slugs for users
 */

/**
 * Generate a slug from email
 * Examples:
 *   john.doe@example.com → john-doe
 *   admin@template.com → admin
 */
export const generateSlug = (email: string): string => {
  // Extract username part (before @)
  const username = email.split('@')[0];

  // Convert to lowercase and replace dots/underscores with hyphens
  let slug = username
    .toLowerCase()
    .replace(/[._]/g, '-')
    .replace(/[^a-z0-9-]/g, ''); // Remove non-alphanumeric except hyphens

  return slug;
};

/**
 * Generate a unique slug by appending a random suffix if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of already used slugs
 */
export const makeSlugUnique = (baseSlug: string, existingSlugs: string[]): string => {
  let slug = baseSlug;
  let counter = 1;

  // If slug already exists, append a number
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Generate a random suffix for slug uniqueness
 */
export const generateRandomSuffix = (): string => {
  return Math.random().toString(36).substring(2, 8);
};
