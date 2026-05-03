import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Edit3, Trash2, Save, FolderOpen, X } from 'lucide-react';
import { storage } from '@/services/storage';

export interface SavedProject<T> {
  id: string;
  name: string;
  date: string;
  data: T;
}

interface ProjectManagerProps<T> {
  storageKey: string;
  currentData: T;
  onLoad: (data: T) => void;
  titleExtractor: (data: T) => string;
  typeLabel: string;
}

export function ProjectManager<T>({ storageKey, currentData, onLoad, titleExtractor, typeLabel }: ProjectManagerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<SavedProject<T>[]>([]);

  useEffect(() => {
    if (isOpen) {
      setProjects(storage.get(storageKey, []));
    }
  }, [isOpen, storageKey]);

  const saveProjects = (newProjects: SavedProject<T>[]) => {
    storage.set(storageKey, newProjects);
    setProjects(newProjects);
  };

  const handleSaveCurrent = () => {
    const name = window.prompt(`Enter a name for this ${typeLabel}:`, titleExtractor(currentData) || `My ${typeLabel}`);
    if (!name) return;

    const newProject: SavedProject<T> = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(currentData)), // deep copy to prevent reference mutation
    };

    saveProjects([newProject, ...projects]);
  };

  const handleLoad = (project: SavedProject<T>) => {
    if (window.confirm(`Load "${project.name}"? This will overwrite your current draft.`)) {
      onLoad(JSON.parse(JSON.stringify(project.data)));
      setIsOpen(false);
    }
  };

  const handleDuplicate = (project: SavedProject<T>) => {
    const newName = window.prompt(`Enter a name for the duplicated ${typeLabel}:`, `${project.name} (Copy)`);
    if (!newName) return;

    const newProject: SavedProject<T> = {
      id: Date.now().toString(),
      name: newName,
      date: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(project.data)), 
    };

    saveProjects([newProject, ...projects]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      saveProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <FolderOpen className="w-4 h-4 mr-2" />
        Saved {typeLabel}s
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm shadow-2xl">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-500" />
                Manage {typeLabel}s
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <Button onClick={handleSaveCurrent} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Current as New {typeLabel}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100/50 dark:bg-zinc-900/30">
              {projects.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No saved {typeLabel.toLowerCase()}s found.</p>
                  <p className="text-sm mt-1">Save your current draft to see it here.</p>
                </div>
              ) : (
                projects.map(p => (
                  <Card key={p.id} className="overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 transition-all hover:border-blue-500/30 hover:shadow-md">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1">Saved on {new Date(p.date).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleLoad(p)}>
                          <Edit3 className="w-4 h-4 mr-1" /> Load
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicate(p)}>
                          <Copy className="w-4 h-4 mr-1" /> Duplicate
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}