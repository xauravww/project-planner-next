import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Used for all AI-generated content before storage or rendering
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "code", "pre", "a", "span", "div"
    ],
    ALLOWED_ATTR: ["href", "target", "class", "id"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text - removes all HTML
 * Use for fields that should never contain HTML
 */
export function sanitizeText(dirty: string): string {
  if (!dirty) return "";
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate that content doesn't contain suspicious patterns
 * Returns true if content is safe, false if rejected
 */
export function validateContentSafety(content: string): boolean {
  if (!content) return true;
  
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(content));
}
