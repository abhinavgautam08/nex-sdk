/*! nex-sanitizer v1.0.0 | (c) 2026 NEX SDK | MIT License | https://github.com/user/nex-sdk */
/**
 * NexSanitizer | Cyberpunk Client-Side XSS Protection Shield
 * Recursively cleans user-provided HTML inputs by stripping unauthorized tags and attributes.
 */
class NexSanitizer {
  static get ALLOWED_TAGS() {
    return new Set([
      'p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'span', 'div', 
      'a', 'img', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]);
  }

  static get ALLOWED_ATTRS() {
    return {
      'a': new Set(['href', 'target', 'rel', 'title', 'class', 'id']),
      'img': new Set(['src', 'alt', 'width', 'height', 'title', 'class', 'id']),
      '*': new Set(['class', 'id'])
    };
  }

  static isSafeUrl(url) {
    if (!url) return false;
    const trimmed = url.trim().toLowerCase();
    
    // Allow relative paths
    if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
      return true;
    }
    
    // Allow safe protocols
    return trimmed.startsWith('http://') || 
           trimmed.startsWith('https://') || 
           trimmed.startsWith('mailto:') || 
           trimmed.startsWith('tel:');
  }

  static sanitize(html) {
    if (typeof html !== 'string') return '';
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const body = doc.body || doc.createElement('body');

      const cleanNode = (node) => {
        const childNodes = Array.from(node.childNodes);
        
        for (const child of childNodes) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const tagName = child.tagName.toLowerCase();
            
            if (!this.ALLOWED_TAGS.has(tagName)) {
              if (['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'].includes(tagName)) {
                child.remove();
              } else {
                while (child.firstChild) {
                  child.parentNode.insertBefore(child.firstChild, child);
                }
                child.remove();
              }
              continue;
            }

            const attributes = Array.from(child.attributes);
            const allowedAttrs = this.ALLOWED_ATTRS[tagName] || new Set();
            const globalAllowed = this.ALLOWED_ATTRS['*'] || new Set();

            for (const attr of attributes) {
              const attrName = attr.name.toLowerCase();
              
              if (attrName.startsWith('on')) {
                child.removeAttribute(attr.name);
                continue;
              }

              if (!allowedAttrs.has(attrName) && !globalAllowed.has(attrName)) {
                child.removeAttribute(attr.name);
                continue;
              }

              if (attrName === 'href' || attrName === 'src') {
                if (!this.isSafeUrl(attr.value)) {
                  child.removeAttribute(attr.name);
                }
              }
            }

            cleanNode(child);
          }
        }
      };

      cleanNode(body);
      return body.innerHTML;
    } catch (e) {
      console.error('[NEX SANITIZER] Parsing failed, falling back to plaintext:', e);
      return html.replace(/<\/?[^>]+(>|$)/g, "");
    }
  }
}

// Attach to window namespace for CDN compatibility
window.NexSanitizer = NexSanitizer;
