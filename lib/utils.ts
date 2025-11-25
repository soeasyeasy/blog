/**
 * 工具函数文件
 * 提供通用的辅助函数，如 ID 生成、日期格式化等
 */

// 生成随机 ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// 格式化日期
export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// 简单的 SHA-256 哈希函数
export async function sha256(message: string): Promise<string> {
    // 将字符串编码为 Uint8Array
    const msgBuffer = new TextEncoder().encode(message);

    // 使用 SHA-256 算法进行哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // 将哈希结果转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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