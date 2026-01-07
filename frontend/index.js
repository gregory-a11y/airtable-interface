import React, { useState, useMemo } from 'react';
import { initializeBlock, useBase, useRecords, useCustomProperties, expandRecord } from '@airtable/blocks/interface/ui';
import { FieldType } from '@airtable/blocks/interface/models';
import { Sidebar } from './components/Sidebar';
import { DocViewer } from './components/DocViewer';
import { Status } from './constants';
import { Menu } from 'lucide-react';
import './style.css';

function getCustomProperties(base) {
    // Essayez de trouver une table nommée "SOP's" ou "SOP", sinon prenez la première
    const table = base.tables.find(t => /sop/i.test(t.name)) || base.tables[0];

    return [
        {
            key: 'titleField',
            label: 'Titre',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /titre|title|nom|name/i.test(f.name)),
        },
        {
            key: 'statusField',
            label: 'Status',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /status|statut|état/i.test(f.name)),
            shouldFieldBeAllowed: (field) => 
                field.config.type === FieldType.SINGLE_SELECT || 
                field.config.type === FieldType.SINGLE_LINE_TEXT
        },
        {
            key: 'categoryField',
            label: 'Catégorie (Dossiers)',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /catégorie|category|dossier|folder/i.test(f.name)),
            shouldFieldBeAllowed: (field) => 
                field.config.type === FieldType.SINGLE_SELECT || 
                field.config.type === FieldType.SINGLE_LINE_TEXT
        },
        {
            key: 'authorField',
            label: 'Responsable (Auteur)',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /responsable|author|owner/i.test(f.name)),
        },
        {
            key: 'contentField',
            label: 'Contenu (Notes/Markdown)',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /notes|content|contenu|description/i.test(f.name)),
            shouldFieldBeAllowed: (field) => 
                field.config.type === FieldType.MULTILINE_TEXT || 
                field.config.type === FieldType.RICH_TEXT ||
                field.config.type === FieldType.SINGLE_LINE_TEXT
        },
        {
            key: 'videoUrlField',
            label: 'URL Vidéo',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /vidéo|video|tutoriel|tutorial|url/i.test(f.name)),
        },
        {
            key: 'attachmentsField',
            label: 'Pièces Jointes (PDF)',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /pièce|joint|attach|pj|pdf/i.test(f.name)),
            shouldFieldBeAllowed: (field) => 
                field.config.type === FieldType.MULTIPLE_ATTACHMENTS
        },
        {
            key: 'lastUpdatedField',
            label: 'Dernière MAJ',
            type: 'field',
            table: table,
            defaultValue: table.fields.find(f => /updated|maj|date/i.test(f.name)),
        }
    ];
}

function DocuFlowApp() {
    const base = useBase();
    const { customPropertyValueByKey, errorState } = useCustomProperties(getCustomProperties);
    
    // Récupération des champs configurés
    const titleField = customPropertyValueByKey.titleField;
    const statusField = customPropertyValueByKey.statusField;
    const categoryField = customPropertyValueByKey.categoryField;
    const authorField = customPropertyValueByKey.authorField;
    const contentField = customPropertyValueByKey.contentField;
    const videoUrlField = customPropertyValueByKey.videoUrlField;
    const attachmentsField = customPropertyValueByKey.attachmentsField;
    const lastUpdatedField = customPropertyValueByKey.lastUpdatedField;

    // On déduit la table à partir d'un des champs (tous les champs doivent venir de la même table normalement via getCustomProperties logic, 
    // mais ici on récupère la table parente du champ titre pour charger les records)
    const table = titleField ? titleField.parentTable : null;

    // Vérification si la configuration minimale est présente
    const isConfigured = titleField && table;
    
    const records = useRecords(table, {fields: [
        titleField, 
        statusField, 
        categoryField, 
        authorField, 
        contentField, 
        videoUrlField, 
        attachmentsField,
        lastUpdatedField
    ].filter(Boolean)});

    // State pour l'UI
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [selectedSopId, setSelectedSopId] = useState(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Transformation des données Airtable -> Format App
    const { folders, sops } = useMemo(() => {
        if (!records || !titleField) return { folders: [], sops: [] };

        const foldersMap = new Map();
        const processedSops = [];

        records.forEach(record => {
            // Extraction de la catégorie pour créer les dossiers
            let categoryName = 'Général';
            if (categoryField) {
                const catValue = record.getCellValue(categoryField);
                if (catValue) {
                    if (typeof catValue === 'object' && catValue.name) {
                        categoryName = catValue.name; // Single Select
                    } else {
                        categoryName = String(catValue);
                    }
                }
            }

            // Création ou récupération du dossier
            if (!foldersMap.has(categoryName)) {
                foldersMap.set(categoryName, {
                    id: categoryName, // On utilise le nom comme ID pour simplifier
                    name: categoryName
                });
            }

            // Mapping du Status
            let status = Status.TODO;
            if (statusField) {
                const statusValue = record.getCellValue(statusField);
                let statusName = '';
                if (statusValue && typeof statusValue === 'object' && statusValue.name) {
                    statusName = statusValue.name.toLowerCase();
                } else if (statusValue) {
                    statusName = String(statusValue).toLowerCase();
                }

                if (statusName.includes('actif') || statusName.includes('active') || statusName.includes('done') || statusName.includes('terminé')) {
                    status = Status.ACTIVE;
                } else if (statusName.includes('cours') || statusName.includes('progress')) {
                    status = Status.IN_PROGRESS;
                } else if (statusName.includes('archiv')) {
                    status = Status.ARCHIVED;
                }
            }

            // Mapping de l'auteur
            let author = 'Inconnu';
            if (authorField) {
                const authorValue = record.getCellValue(authorField);
                if (authorValue) {
                    // User field returns object or array of objects
                    if (Array.isArray(authorValue) && authorValue.length > 0) {
                         author = authorValue[0].name || authorValue[0].email;
                    } else if (authorValue.name) {
                        author = authorValue.name;
                    }
                }
            }

            // Mapping des pièces jointes
            let attachments = [];
            if (attachmentsField) {
                const rawAttachments = record.getCellValue(attachmentsField);
                if (Array.isArray(rawAttachments)) {
                    attachments = rawAttachments.map(att => ({
                        id: att.id,
                        url: att.url,
                        filename: att.filename,
                        type: att.type
                    }));
                }
            }

            processedSops.push({
                id: record.id,
                title: record.getCellValueAsString(titleField) || 'Sans titre',
                content: contentField ? record.getCellValueAsString(contentField) : '',
                status: status,
                folderId: categoryName,
                lastUpdated: lastUpdatedField ? record.getCellValueAsString(lastUpdatedField) : (record.updatedTime ? String(record.updatedTime) : ''), // Format de date simplifié
                author: author,
                videoUrl: videoUrlField ? record.getCellValueAsString(videoUrlField) : undefined,
                attachments: attachments,
                rawRecord: record // Garder le record pour usage futur (ex: expandRecord)
            });
        });

        // Conversion Map -> Array et tri
        const processedFolders = Array.from(foldersMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        return { folders: processedFolders, sops: processedSops };

    }, [records, titleField, categoryField, statusField, authorField, contentField, videoUrlField, attachmentsField, lastUpdatedField]);


    // Handlers
    const handleSelectFolder = (id) => {
        setSelectedFolderId(id);
        if (id) {
            const firstSop = sops.find(s => s.folderId === id);
            if (firstSop) setSelectedSopId(firstSop.id);
            else setSelectedSopId(null);
        } else {
            setSelectedSopId(null);
        }
    };

    const handleSelectSop = (sop) => {
        setSelectedSopId(sop.id);
        setSelectedFolderId(sop.folderId);
        setMobileSidebarOpen(false);
    };

    const activeSop = sops.find(s => s.id === selectedSopId) || null;


    if (!isConfigured) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Configuration requise</h2>
                    <p className="text-gray-600">Veuillez configurer les champs dans le panneau des paramètres pour utiliser DocuFlow.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-gray-50 font-sans text-slate-800 overflow-hidden">
            
            {/* Mobile Toggle */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button 
                    onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    className="p-2 bg-white rounded-lg shadow-md text-gray-600"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar 
                    folders={folders}
                    sops={sops}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={handleSelectFolder}
                    selectedSopId={selectedSopId}
                    onSelectSop={handleSelectSop}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DocViewer 
                    sop={activeSop} 
                    onUpdateSop={() => {}} // Read-only pour l'instant
                />
            </div>

            {/* Overlay mobile */}
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
        </div>
    );
}

initializeBlock({interface: () => <DocuFlowApp />});
