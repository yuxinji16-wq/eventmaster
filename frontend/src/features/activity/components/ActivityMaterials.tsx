/**
 * 活动资料管理组件
 * 支持文件上传、下载、删除、重命名、预览
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  FileText, UploadCloud, Download, Trash2, Edit2, Eye,
  X, Check, Image, File, Loader2, AlertCircle, FolderOpen
} from 'lucide-react';
import { Card, Button } from '../../../shared';
import { useActivityFiles, ActivityFile } from '../../../utils/hooks';
import { getFileTypeIcon, getFileTypeName, formatFileSize, formatUploadTime } from '../../../services/fileStorage';

interface ActivityMaterialsProps {
  activityId: string;
  activityName?: string;
}

export const ActivityMaterials: React.FC<ActivityMaterialsProps> = ({
  activityId,
  activityName,
}) => {
  const {
    files,
    loading,
    uploading,
    error,
    uploadFile,
    uploadFiles,
    deleteFile,
    renameFile,
    downloadFile,
    previewFile,
    loadFiles,
  } = useActivityFiles(activityId);

  const [isDragging, setIsDragging] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      await uploadFiles(fileList);
    }
    // 清空 input 以允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFiles]);

  // 拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      await uploadFiles(fileList);
    }
  }, [uploadFiles]);

  // 开始重命名
  const startRename = useCallback((file: ActivityFile) => {
    setEditingFileId(file.id);
    setEditingName(file.name);
  }, []);

  // 确认重命名
  const confirmRename = useCallback(() => {
    if (editingFileId && editingName.trim()) {
      renameFile(editingFileId, editingName.trim());
    }
    setEditingFileId(null);
    setEditingName('');
  }, [editingFileId, editingName, renameFile]);

  // 取消重命名
  const cancelRename = useCallback(() => {
    setEditingFileId(null);
    setEditingName('');
  }, []);

  // 确认删除
  const confirmDelete = useCallback(async () => {
    if (deleteConfirmId) {
      await deleteFile(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, deleteFile]);

  // 预览文件
  const handlePreview = useCallback(async (file: ActivityFile) => {
    const url = await previewFile(file.id);
    if (url) {
      setPreviewUrl(url);
      setPreviewName(file.name);
    }
  }, [previewFile]);

  // 关闭预览
  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewName('');
  }, [previewUrl]);

  // 下载文件
  const handleDownload = useCallback(async (fileId: string) => {
    await downloadFile(fileId);
  }, [downloadFile]);

  // 渲染文件图标
  const renderFileIcon = (type: string, size: 'sm' | 'md' = 'sm') => {
    const iconSize = size === 'sm' ? 14 : 18;
    const iconClass = 'shrink-0';

    if (type.startsWith('image/')) {
      return <Image size={iconSize} className={`${iconClass} text-emerald-500`} />;
    }
    if (type.includes('pdf')) {
      return <File size={iconSize} className={`${iconClass} text-rose-500`} />;
    }
    if (type.includes('word') || type.includes('document')) {
      return <File size={iconSize} className={`${iconClass} text-blue-500`} />;
    }
    if (type.includes('sheet') || type.includes('excel')) {
      return <File size={iconSize} className={`${iconClass} text-emerald-600`} />;
    }
    if (type.includes('ppt') || type.includes('presentation')) {
      return <File size={iconSize} className={`${iconClass} text-orange-500`} />;
    }
    return <FileText size={iconSize} className={`${iconClass} text-slate-400`} />;
  };

  return (
    <Card>
      {/* 头部 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
          <FolderOpen size={18} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">活动资料</h3>
          <p className="text-xs text-slate-400">{files.length} 个文件</p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={14} className="text-rose-500 shrink-0" />
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}

      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer mb-4 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />
        {uploading ? (
          <>
            <Loader2 size={24} className="mx-auto mb-2 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-indigo-500">上传中...</p>
          </>
        ) : (
          <>
            <UploadCloud size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              {isDragging ? '松开以上传' : '点击或拖拽上传文件'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              支持 PDF、Word、Excel、PPT、图片、压缩包等
            </p>
          </>
        )}
      </div>

      {/* 文件列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无上传文件</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {renderFileIcon(file.type)}
                <div className="min-w-0 flex-1">
                  {editingFileId === file.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') confirmRename();
                          if (e.key === 'Escape') cancelRename();
                        }}
                        className="px-2 py-0.5 text-xs border border-slate-300 rounded outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <button onClick={confirmRename} className="p-1 hover:bg-emerald-100 rounded">
                        <Check size={12} className="text-emerald-500" />
                      </button>
                      <button onClick={cancelRename} className="p-1 hover:bg-slate-200 rounded">
                        <X size={12} className="text-slate-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{getFileTypeName(file.type)}</span>
                        <span>·</span>
                        <span>{formatFileSize(file.size)}</span>
                        <span>·</span>
                        <span>{formatUploadTime(file.uploadTime)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* 预览按钮 */}
                {file.type.startsWith('image/') || file.type.includes('pdf') ? (
                  <button
                    onClick={() => handlePreview(file)}
                    className="p-1.5 hover:bg-blue-100 rounded text-slate-400 hover:text-blue-500"
                    title="预览"
                  >
                    <Eye size={14} />
                  </button>
                ) : null}

                {/* 下载按钮 */}
                <button
                  onClick={() => handleDownload(file.id)}
                  className="p-1.5 hover:bg-indigo-100 rounded text-slate-400 hover:text-indigo-500"
                  title="下载"
                >
                  <Download size={14} />
                </button>

                {/* 重命名按钮 */}
                <button
                  onClick={() => startRename(file)}
                  className="p-1.5 hover:bg-amber-100 rounded text-slate-400 hover:text-amber-500"
                  title="重命名"
                >
                  <Edit2 size={14} />
                </button>

                {/* 删除按钮 */}
                <button
                  onClick={() => setDeleteConfirmId(file.id)}
                  className="p-1.5 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-500"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-4 z-10">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} />
              </div>
              <h4 className="font-bold text-slate-800">确认删除文件</h4>
              <p className="text-sm text-slate-500 mt-1">
                确定要删除这个文件吗？此操作不可撤销。
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setDeleteConfirmId(null)}
              >
                取消
              </Button>
              <Button
                className="flex-1 !bg-rose-500 hover:!bg-rose-600"
                onClick={confirmDelete}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="absolute inset-0" onClick={closePreview} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-10">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 truncate">{previewName}</h4>
              <button
                onClick={closePreview}
                className="p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-60px)]">
              {previewUrl && (
                previewName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                  <img
                    src={previewUrl}
                    alt={previewName}
                    className="max-w-full h-auto mx-auto"
                  />
                ) : previewName.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh]"
                    title={previewName}
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <File size={48} className="mx-auto mb-2 opacity-50" />
                    <p>此文件类型不支持预览</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewUrl;
                        link.download = previewName;
                        link.click();
                      }}
                    >
                      下载文件
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
