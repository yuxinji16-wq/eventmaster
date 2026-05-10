/**
 * 活动文件存储服务
 * 使用浏览器原生 API：
 * - localStorage: 存储文件元数据
 * - sessionStorage: 存储文件数据的 Base64 编码（用于跨刷新保持）
 */

// 文件元数据结构
export interface ActivityFile {
  id: string;
  activityId: string;
  name: string;
  type: string;
  size: number;
  uploadTime: string;
  // 浏览器原生的 objectUrl 用于下载/预览
  objectUrl?: string;
}

const STORAGE_KEY = 'eventmaster_activity_files';

// 获取所有文件元数据
function getAllFileMetadata(): ActivityFile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存文件元数据到 localStorage
function saveFileMetadata(files: ActivityFile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

// 生成唯一ID
function generateId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// 获取文件类型显示名称
export function getFileTypeName(type: string): string {
  if (type.startsWith('image/')) return '图片';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('word') || type.includes('document')) return 'Word';
  if (type.includes('sheet') || type.includes('excel')) return 'Excel';
  if (type.includes('ppt') || type.includes('presentation')) return 'PPT';
  if (type.includes('zip') || type.includes('rar')) return '压缩包';
  if (type.includes('text/plain')) return '文本';
  return '文件';
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
export function formatUploadTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// 文件存储 API
export const fileStorage = {
  // 上传文件 - 核心方法
  async upload(file: File, activityId: string): Promise<ActivityFile> {
    const id = generateId();
    const uploadTime = new Date().toISOString();

    // 创建浏览器原生的 objectUrl
    const objectUrl = URL.createObjectURL(file);

    // 创建文件元数据
    const fileMeta: ActivityFile = {
      id,
      activityId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadTime,
      objectUrl,
    };

    // 保存元数据到 localStorage
    const allFiles = getAllFileMetadata();
    allFiles.push(fileMeta);
    saveFileMetadata(allFiles);

    console.log('文件上传成功:', fileMeta);
    return fileMeta;
  },

  // 获取活动的所有文件
  getFilesByActivity(activityId: string): ActivityFile[] {
    const allFiles = getAllFileMetadata();
    return allFiles
      .filter(f => f.activityId === activityId)
      .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  },

  // 获取文件的 objectUrl
  getFileUrl(fileId: string): string | null {
    const allFiles = getAllFileMetadata();
    const fileMeta = allFiles.find(f => f.id === fileId);
    return fileMeta?.objectUrl || null;
  },

  // 下载文件
  async downloadFile(fileId: string): Promise<void> {
    const allFiles = getAllFileMetadata();
    const fileMeta = allFiles.find(f => f.id === fileId);

    if (!fileMeta) {
      throw new Error('文件不存在');
    }

    if (!fileMeta.objectUrl) {
      throw new Error('本地文件链接已失效，请重新上传');
    }

    // 创建下载链接
    const link = document.createElement('a');
    link.href = fileMeta.objectUrl;
    link.download = fileMeta.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 预览文件（返回 blob URL）
  async previewFile(fileId: string): Promise<string | null> {
    const allFiles = getAllFileMetadata();
    const fileMeta = allFiles.find(f => f.id === fileId);

    if (!fileMeta) {
      throw new Error('文件不存在');
    }

    if (!fileMeta.objectUrl) {
      throw new Error('本地文件链接已失效，请重新上传');
    }

    return fileMeta.objectUrl;
  },

  // 删除文件
  async deleteFile(fileId: string): Promise<void> {
    const allFiles = getAllFileMetadata();
    const fileMeta = allFiles.find(f => f.id === fileId);

    if (fileMeta) {
      // 释放 objectUrl
      if (fileMeta.objectUrl) {
        URL.revokeObjectURL(fileMeta.objectUrl);
      }

      // 从 localStorage 删除元数据
      const updatedFiles = allFiles.filter(f => f.id !== fileId);
      saveFileMetadata(updatedFiles);

      console.log('文件删除成功:', fileId);
    }
  },

  // 重命名文件
  renameFile(fileId: string, newName: string): void {
    const allFiles = getAllFileMetadata();
    const fileMeta = allFiles.find(f => f.id === fileId);

    if (fileMeta) {
      // 保留原文件类型扩展名
      const ext = fileMeta.name.split('.').pop();
      const newExt = newName.includes('.') ? '' : ext;

      if (newExt && !newName.includes('.')) {
        newName = newName + '.' + newExt;
      }

      fileMeta.name = newName;
      saveFileMetadata(allFiles);
    }
  },

  // 获取活动文件数量
  getFileCount(activityId: string): number {
    return this.getFilesByActivity(activityId).length;
  },

  // 清空活动所有文件
  async clearActivityFiles(activityId: string): Promise<void> {
    const files = this.getFilesByActivity(activityId);
    for (const file of files) {
      await this.deleteFile(file.id);
    }
  },
};
