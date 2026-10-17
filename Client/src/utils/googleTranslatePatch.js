// Patch Node.prototype to prevent React reconciliation crashes
// when Google Translate wraps text nodes in <font> tags.
export function initGoogleTranslatePatch() {
  if (typeof window === 'undefined' || typeof Node !== 'function' || !Node.prototype) {
    return;
  }

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console && console.warn) {
        console.warn('GoogleTranslatePatch: Handled removeChild on mismatched parent', child, this);
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && console.warn) {
        console.warn('GoogleTranslatePatch: Handled insertBefore on mismatched parent', referenceNode, this);
      }
      return this.appendChild(newNode);
    }
    return originalInsertBefore.apply(this, arguments);
  };
}
