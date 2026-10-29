/**
 * Sunvault Expenses Manager - Category Management Modal
 * Allows Admin to add, edit or deactivate any of the 23 expense categories
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryItem } from '../../types';
import { X, Plus, Edit2, Check, Power, Tag } from 'lucide-react';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, updateCategory, toggleCategoryStatus } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatDesc.trim() || 'Custom expense category');
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateCategory(editingCategory);
    setEditingCategory(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Expense Categories Management</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-900 block text-xs">Add New Expense Head</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name (e.g. Drone Survey)"
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Brief description of permissible expenses"
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>
          </form>

          {/* Edit Inline Box if active */}
          {editingCategory && (
            <form onSubmit={handleSaveEdit} className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Edit Category: {editingCategory.name}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="px-3 py-1.5 border border-amber-300 rounded bg-white"
                />
                <input
                  type="text"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="px-3 py-1.5 border border-amber-300 rounded bg-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1 text-slate-600 bg-white border border-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block text-xs">Active Categories ({categories.length})</span>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 flex items-center justify-between text-xs transition-colors ${
                    !c.isActive ? 'bg-slate-100 opacity-60' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{c.description}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingCategory(c)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleCategoryStatus(c.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                        c.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      title={c.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-3 h-3" />
                      <span>{c.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
