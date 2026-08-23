import React, { useState, useEffect } from 'react';
import { X, Bell, Lock, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { notificationsEngine } from '../../lib/notifications';

interface TaskReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskReminderModal: React.FC<TaskReminderModalProps> = ({ isOpen, onClose }) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Research' | 'Paper Review' | 'Lab Experiment' | 'Grant Update'>('Lab Experiment');
  const [dueTime, setDueTime] = useState('Today at 17:00 UTC');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Normal'>('High');

  useEffect(() => {
    return localDB.subscribe(setDbState);
  }, []);

  if (!isOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (title) {
      const newTask = localDB.addTask({
        title,
        category,
        dueTime,
        priority
      });

      // Trigger push notification alert
      notificationsEngine.triggerPushAlert(
        `Task Scheduled: ${newTask.title}`,
        `Priority: ${newTask.priority} | Due: ${newTask.dueTime}`,
        'reminder'
      );

      setTitle('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
      <div className="max-w-md w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#051424] text-slate-300 hover:text-white border border-[#273647]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-mono text-[11px] font-bold">
            <Bell className="w-3.5 h-3.5" />
            PUSH NOTIFICATION REMINDER ENGINE
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Task Reminder Alert</h2>
          <p className="text-xs text-[#c6c6cd]">
            Schedule task alerts for paper revisions, thermal spray experiment runs, or grant deadlines.
          </p>
        </div>

        <form onSubmit={handleCreateTask} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-[#c6c6cd] block mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Laser Melt Pool Powder Flow Calibration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              >
                <option value="Lab Experiment">Lab Experiment</option>
                <option value="Paper Review">Paper Review</option>
                <option value="Research">Research</option>
                <option value="Grant Update">Grant Update</option>
              </select>
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Due Time & Schedule</label>
            <input
              type="text"
              required
              placeholder="Today at 18:00 UTC"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#051424] border border-[#273647] text-[11px] text-[#2fd9f4] flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Encrypted using AES-256-GCM before saving to client offline database.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Encrypted Reminder</span>
          </button>
        </form>

        {/* Existing Active Reminders */}
        <div className="space-y-2 pt-2 border-t border-[#273647]">
          <h3 className="text-xs font-mono text-[#d4e4fa] font-bold">Active Scheduled Tasks ({dbState.tasks.length})</h3>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
            {dbState.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => localDB.toggleTaskCompletion(task.id)}
                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer ${
                  task.completed
                    ? 'bg-[#051424] border-[#1c2b3c] text-slate-500 line-through'
                    : 'bg-[#1c2b3c] border-[#273647] text-[#d4e4fa]'
                }`}
              >
                <div>
                  <div className="font-bold text-[#ffc640]">{task.title}</div>
                  <div className="text-[10px] text-slate-400">{task.category} • {task.dueTime}</div>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#2fd9f4]">
                  {task.completed ? 'DONE' : task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
