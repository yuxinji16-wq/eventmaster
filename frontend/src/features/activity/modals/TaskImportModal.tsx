/**
 * 任务导入弹窗
 * 从 pages/ActivityDetail.tsx 行 169-362 迁移而来
 */
import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { Modal, Button } from '../../../shared';
import { ActivityTask } from '../../types';

interface TaskImportModalProps {
  onClose: () => void;
  onImport: (tasks: ActivityTask[]) => void;
}

export const TaskImportModal: React.FC<TaskImportModalProps> = ({ onClose, onImport }) => {
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');
  const [pasteData, setPasteData] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ActivityTask[]>([]);
  const [error, setError] = useState('');

  const parsePastedData = (text: string): ActivityTask[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const tasks: ActivityTask[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let parts = line.split('\t');
      if (parts.length < 4) parts = line.split(/\s{1,}/);
      if (parts.length < 4) parts = line.split(',');

      if (parts.length >= 4) {
        const cleanPart = (p: string) => p.trim().replace(/^["']|["']$/g, '');
        const name = cleanPart(parts[0]);
        const assignee = cleanPart(parts[1]);
        const dueDate = cleanPart(parts[2]);
        const priorityStr = cleanPart(parts[3]).toUpperCase();

        if (name && assignee) {
          let priority: 'P0' | 'P1' | 'P2' = 'P1';
          if (priorityStr === 'P0') priority = 'P0';
          else if (priorityStr === 'P2') priority = 'P2';

          tasks.push({
            id: `t-import-${Date.now()}-${i}`,
            name,
            assignee,
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            priority,
            status: '未开始',
            createdAt: new Date().toISOString()
          });
        }
      }
    }
    return tasks;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const tasks = parsePastedData(text);
      if (tasks.length > 0) {
        setParsedTasks(tasks);
        setError('');
      } else {
        setError('无法解析文件，请确保格式正确');
      }
    };
    reader.readAsText(file);
  };

  const handlePastePreview = () => {
    if (!pasteData.trim()) {
      setError('请粘贴数据');
      return;
    }
    const tasks = parsePastedData(pasteData);
    if (tasks.length > 0) {
      setParsedTasks(tasks);
      setError('');
    } else {
      setError('无法解析数据，请确保每行有4个部分：任务名 负责人 日期 优先级');
    }
  };

  const downloadTemplate = () => {
    const template = '任务名称 负责人 截止日期 优先级\nexample task 张三 2024-03-15 P1';
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '任务导入模板.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal title="导入任务" onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setImportMode('paste'); setParsedTasks([]); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${importMode === 'paste' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            粘贴数据
          </button>
          <button
            onClick={() => { setImportMode('file'); setParsedTasks([]); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${importMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            文件导入
          </button>
        </div>

        {importMode === 'paste' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">粘贴Excel/Sheets数据</label>
              <button onClick={downloadTemplate} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">下载模板</button>
            </div>
            <textarea
              value={pasteData}
              onChange={(e) => { setPasteData(e.target.value); setParsedTasks([]); }}
              placeholder="从Excel或Google Sheets粘贴数据，支持空格或Tab分隔&#10;格式：任务名称 负责人 截止日期 优先级&#10;示例：&#10;场地确认    张三    2024-03-15    P0&#10;物料采购    李四    2024-03-20    P1"
              rows={6}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 resize-none"
            />
            <button onClick={handlePastePreview} className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">
              预览解析结果
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                <Upload size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">点击选择文件</p>
                <p className="text-xs text-slate-400 mt-1">支持 CSV、TXT 格式</p>
              </div>
            </label>
            {fileName && <p className="text-sm text-slate-500">已选择: {fileName}</p>}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {parsedTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-emerald-600">解析到 {parsedTasks.length} 个任务：</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {parsedTasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                    task.priority === 'P0' ? 'bg-rose-100 text-rose-600' :
                    task.priority === 'P1' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>{task.priority}</span>
                  <span className="flex-1 font-medium text-slate-700 truncate">{task.name}</span>
                  <span className="text-slate-400">{task.assignee}</span>
                  <span className="text-slate-400">{task.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button
          variant="primary"
          onClick={() => { if (parsedTasks.length > 0) { onImport(parsedTasks); onClose(); } }}
          disabled={parsedTasks.length === 0}
          icon={<Download size={14} />}
        >
          确认导入 ({parsedTasks.length})
        </Button>
      </div>
    </Modal>
  );
};

export default TaskImportModal;
