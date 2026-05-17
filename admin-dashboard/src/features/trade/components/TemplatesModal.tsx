import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';

interface Template {
    id: string;
    name: string;
}

interface TemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
    const [templates, setTemplates] = useState<Template[]>(() => {
        const saved = localStorage.getItem('chartTemplates');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');

    if (!isOpen) return null;

    const handleAddTemplate = () => {
        if (newTemplateName.trim()) {
            const newTemplate: Template = {
                id: `template_${Date.now()}`,
                name: newTemplateName.trim(),
            };
            const updatedTemplates = [...templates, newTemplate];
            setTemplates(updatedTemplates);
            localStorage.setItem('chartTemplates', JSON.stringify(updatedTemplates));
            setNewTemplateName('');
            setIsAddingNew(false);
        }
    };

    const handleDeleteTemplate = (id: string) => {
        const updatedTemplates = templates.filter(t => t.id !== id);
        setTemplates(updatedTemplates);
        localStorage.setItem('chartTemplates', JSON.stringify(updatedTemplates));
    };

    const handleClearAll = () => {
        setTemplates([]);
        localStorage.removeItem('chartTemplates');
    };

    const handleUploadTemplate = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const content = event.target?.result as string;
                        const templateData = JSON.parse(content);

                        // Validate template structure
                        if (templateData.name) {
                            const newTemplate: Template = {
                                id: `template_${Date.now()}`,
                                name: templateData.name,
                            };
                            const updatedTemplates = [...templates, newTemplate];
                            setTemplates(updatedTemplates);
                            localStorage.setItem('chartTemplates', JSON.stringify(updatedTemplates));
                        } else {
                            alert('Invalid template file format');
                        }
                    } catch (error) {
                        alert('Error reading template file');
                        console.error('Template upload error:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTemplate();
        } else if (e.key === 'Escape') {
            setIsAddingNew(false);
            setNewTemplateName('');
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />

            {/* Modal - Fixed size */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#0B0633] rounded-2xl shadow-2xl z-50 border border-[#2F6BFF]/30 animate-slideUp flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F6BFF]/20 flex-shrink-0">
                    <h2 className="text-base font-semibold text-white">Templates</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-200 hover:text-[#efdede] hover:bg-[#16124A] rounded-lg p-1.5 transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                    {templates.length === 0 && !isAddingNew ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-24 h-24 mb-4 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-violet-700/30 rounded-full"></div>
                                <div className="absolute inset-2 bg-gradient-to-br from-violet-800/20 to-violet-600/20 rounded-full"></div>
                                <div className="absolute inset-4 bg-gradient-to-br from-violet-700/10 to-violet-500/10 rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-sm text-gray-200 mb-6">You have no saved templates yet</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAddingNew(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add new template
                                </button>
                                <button
                                    onClick={handleUploadTemplate}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload template
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Add New Template Button */}
                            {!isAddingNew && (
                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={() => setIsAddingNew(true)}
                                        className="flex-1 flex items-center justify-between px-3 py-2 text-sm text-gray-100 hover:bg-[#16124A]/80 hover:scale-105 transition-all duration-300 rounded transition-colors"
                                    >
                                        <span>Add new templates</span>
                                        <div className="w-6 h-6 flex items-center justify-center bg-[#2F6BFF]/20 rounded">
                                            <Plus className="w-4 h-4 text-violet-400" />
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleUploadTemplate}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-100 hover:bg-[#16124A]/80 hover:scale-105 transition-all duration-300 rounded transition-colors"
                                        title="Upload template"
                                    >
                                        <Upload className="w-4 h-4 text-violet-400" />
                                    </button>
                                </div>
                            )}

                            {/* New Template Input */}
                            {isAddingNew && (
                                <div className="flex items-center gap-2 mb-3 p-2 border border-[#2F6BFF]/50 rounded bg-[#2F6BFF]/10">
                                    <input
                                        type="text"
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Enter template name"
                                        className="flex-1 px-2 py-1 text-sm bg-[#0B0633] border border-[#16124A] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF]"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleAddTemplate}
                                        disabled={!newTemplateName.trim()}
                                        className="w-6 h-6 flex items-center justify-center bg-[#2F6BFF] hover:bg-[#2F6BFF] disabled:bg-[#2F6BFF]/30 disabled:cursor-not-allowed rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            )}

                            {/* Saved Templates Section */}
                            {templates.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-300">Saved templates</span>
                                        <button
                                            onClick={handleClearAll}
                                            className="text-xs text-gray-300 hover:text-gray-200 transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    </div>

                                    {/* Templates List */}
                                    <div className="space-y-1">
                                        {templates.map((template) => (
                                            <div
                                                key={template.id}
                                                className="flex items-center justify-between px-3 py-2 hover:bg-[#16124A]/80 hover:scale-105 transition-all duration-300 rounded transition-colors group"
                                            >
                                                <span className="text-sm text-gray-100">{template.name}</span>
                                                <button
                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-200 hover:text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}


