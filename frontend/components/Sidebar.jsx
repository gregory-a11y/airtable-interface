import React from 'react';
import { Status } from '../constants';
import {
  Folder as FolderIcon,
  FolderOpen,
  LayoutGrid,
  BarChart3
} from 'lucide-react';

export const Sidebar = ({
  folders,
  sops,
  selectedFolderId,
  onSelectFolder,
  selectedSopId,
  onSelectSop,
}) => {

  return (
    <div className="w-80 md:w-[33vw] bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0 z-10 shadow-sm transition-all duration-300 overflow-y-auto">
      {/* Logo Section */}
      <div className="p-6 pb-4 flex items-center justify-start">
        <img
          src="https://raw.githubusercontent.com/gregory-a11y/image/main/avatar-purple%20(1).png"
          alt="Logo"
          style={{
            height: '60px',
            width: '60px',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      </div>

      {/* Category Stats Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} style={{color: '#6442E7'}} />
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{color: '#6442E7'}}>Répartition par Catégorie</h2>
        </div>

        <div className="space-y-1">
            {folders.map(folder => {
                const count = sops.filter(s => s.folderId === folder.id).length;

                return (
                    <div key={folder.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="text-sm font-medium text-gray-600">{folder.name}</span>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                            {count}
                        </span>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Navigation Rapide */}
      <div className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4 px-2" style={{color: '#6442E7'}}>Navigation Rapide</h2>
        <div className="space-y-0.5">
          <div
            onClick={() => onSelectFolder(null)}
            className={`flex items-center gap-2 px-3 py-2 rounded-r-lg text-sm cursor-pointer transition-all duration-200 border-l-4 font-medium ${
              selectedFolderId === null
                ? 'border-transparent text-white font-medium'
                : 'border-transparent text-gray-500 hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: selectedFolderId === null ? '#6442E7' : 'transparent',
              color: selectedFolderId === null ? 'white' : 'inherit',
              borderLeftColor: selectedFolderId === null ? '#6442E7' : 'transparent'
            }}
          >
            <LayoutGrid size={16} style={{color: selectedFolderId === null ? 'white' : 'inherit'}} />
            <span>Tous les documents</span>
          </div>

          {folders.map(folder => {
            const isSelected = selectedFolderId === folder.id;

            return (
              <div key={folder.id} className="group">
                <div
                  onClick={() => onSelectFolder(folder.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-r-lg text-sm cursor-pointer transition-all duration-200 border-l-4 font-medium`}
                  style={{
                    backgroundColor: isSelected ? '#F3F0FF' : 'transparent',
                    borderLeftColor: isSelected ? '#6442E7' : 'transparent',
                    color: isSelected ? '#6442E7' : '#6B7280'
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? <FolderOpen size={16} style={{color: '#6442E7'}} /> : <FolderIcon size={16} />}
                    <span>{folder.name}</span>
                  </div>
                </div>

                {/* Sub-items (Documents) */}
                {isSelected && (
                  <div className="ml-4 pl-2 border-l border-gray-200 mt-1 space-y-0.5 mb-2">
                    {sops.filter(s => s.folderId === folder.id).map(sop => (
                      <div
                        key={sop.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSop(sop);
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors border-l-2 font-medium`}
                        style={{
                          backgroundColor: selectedSopId === sop.id ? '#F3F0FF' : 'transparent',
                          color: selectedSopId === sop.id ? '#6442E7' : '#9CA3AF',
                          borderLeftColor: selectedSopId === sop.id ? '#6442E7' : 'transparent'
                        }}
                      >
                         <span className={`w-1.5 h-1.5 rounded-full`} style={{
                             backgroundColor: sop.status === Status.ACTIVE ? '#6442E7' :
                             sop.status === Status.IN_PROGRESS ? '#6442E7' :
                             '#FBBF24'
                         }}></span>
                        <span className="truncate">{sop.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

