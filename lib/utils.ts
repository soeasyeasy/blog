/**
 * 工具函数文件
 * 包含项目中使用的各种辅助函数
 */

/**
 * 生成唯一 ID
 * @returns string
 */
export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns string
 */
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

/**
 * 生成标题 ID（用于锚点链接）
 * @param text 文本
 * @returns string
 */
export const generateHeadingId = (text: string) => {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
};

// 分类节点接口定义
export interface CategoryNode {
  name: string;              // 节点名称
  fullPath: string;          // 完整路径
  children: CategoryNode[];  // 子节点
}

/**
 * 构建分类树结构
 * @param categories 分类数组
 * @returns CategoryNode[]
 */
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