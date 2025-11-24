
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

export const generateHeadingId = (text: string) => {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
};

export interface CategoryNode {
  name: string;
  fullPath: string;
  children: CategoryNode[];
}

export const buildCategoryTree = (categories: string[]): CategoryNode[] => {
  const root: CategoryNode[] = [];

  categories.forEach(cat => {
    if (cat === "All") return;
    const parts = cat.split('/');
    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let existingNode = currentLevel.find(node => node.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          fullPath: currentPath,
          children: []
        };
        currentLevel.push(existingNode);
      }

      currentLevel = existingNode.children;
    });
  });

  return root;
};
