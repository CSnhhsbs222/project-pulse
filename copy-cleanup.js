function cleanupProjectPulseCopy() {
  const replacements = new Map([
    ["Task drawers", "Tasks"],
    ["Open a category only when you need the details.", "Grouped by status."]
  ]);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    replacements.forEach((replacement, original) => {
      if (node.nodeValue.includes(original)) {
        node.nodeValue = node.nodeValue.replaceAll(original, replacement);
      }
    });
  });
}

cleanupProjectPulseCopy();

new MutationObserver(cleanupProjectPulseCopy).observe(document.body, {
  childList: true,
  subtree: true
});
