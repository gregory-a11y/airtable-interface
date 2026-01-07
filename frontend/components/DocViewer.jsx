import React from 'react';
import { expandRecord } from '@airtable/blocks/interface/ui';
import { StatusBadge } from './StatusBadge';
import { Play, Maximize2, FileText, Calendar, User, Edit3, Paperclip, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
        // Nettoyer l'URL
        const cleanUrl = url.trim();

        // YouTube - Support de tous les formats
        const ytPatterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
        ];
        for (const pattern of ytPatterns) {
            const match = cleanUrl.match(pattern);
            if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0`;
        }

        // Loom - Support de tous les formats
        const loomPatterns = [
            /loom\.com\/share\/([a-f0-9]{32})/,
            /loom\.com\/embed\/([a-f0-9]{32})/
        ];
        for (const pattern of loomPatterns) {
            const match = cleanUrl.match(pattern);
            if (match) return `https://www.loom.com/embed/${match[1]}`;
        }

        // Tella - Support de tous les formats
        if (cleanUrl.includes('tella.tv') || cleanUrl.includes('tella.video')) {
            // Si c'est déjà un embed, retourner tel quel
            if (cleanUrl.includes('/embed')) return cleanUrl;
            
            // Patterns possibles pour Tella
            const tellaPatterns = [
                /(?:www\.)?tella\.tv\/video\/([a-zA-Z0-9_-]+)/,
                /(?:www\.)?tella\.tv\/([a-zA-Z0-9_-]+)/,
                /tella\.video\/([a-zA-Z0-9_-]+)/
            ];
            
            for (const pattern of tellaPatterns) {
                const match = cleanUrl.match(pattern);
                if (match) {
                    const videoId = match[1];
                    // Ne pas inclure des segments d'URL comme "embed" ou "watch" dans l'ID
                    if (!['embed', 'watch', 'video', 'share'].includes(videoId)) {
                        return `https://www.tella.tv/video/${videoId}/embed`;
                    }
                }
            }
            
            // Fallback: essayer d'extraire l'ID de la fin de l'URL
            const urlParts = cleanUrl.replace(/\/$/, '').split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart && lastPart.length > 5) {
                return `https://www.tella.tv/video/${lastPart}/embed`;
            }
        }
        
        // Vimeo - Support de tous les formats
        const vimeoPatterns = [
            /vimeo\.com\/([0-9]+)/,
            /vimeo\.com\/video\/([0-9]+)/,
            /player\.vimeo\.com\/video\/([0-9]+)/
        ];
        for (const pattern of vimeoPatterns) {
            const match = cleanUrl.match(pattern);
            if (match) return `https://player.vimeo.com/video/${match[1]}`;
        }

        // Dailymotion
        const dailymotionPatterns = [
            /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
            /dai\.ly\/([a-zA-Z0-9]+)/
        ];
        for (const pattern of dailymotionPatterns) {
            const match = cleanUrl.match(pattern);
            if (match) return `https://www.dailymotion.com/embed/video/${match[1]}`;
        }

        // Wistia
        const wistiaMatch = cleanUrl.match(/wistia\.com\/medias\/([a-zA-Z0-9]+)/);
        if (wistiaMatch) return `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`;

        // Vidyard
        const vidyardMatch = cleanUrl.match(/vidyard\.com\/watch\/([a-zA-Z0-9]+)/);
        if (vidyardMatch) return `https://play.vidyard.com/${vidyardMatch[1]}`;

        // Streamable
        const streamableMatch = cleanUrl.match(/streamable\.com\/([a-zA-Z0-9]+)/);
        if (streamableMatch) return `https://streamable.com/e/${streamableMatch[1]}`;

        // Google Drive (vidéos partagées)
        const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

        // Dropbox
        if (cleanUrl.includes('dropbox.com')) {
            return cleanUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
        }

        // Si l'URL contient déjà "embed" ou "player", on la retourne telle quelle
        if (cleanUrl.includes('/embed') || cleanUrl.includes('/player')) {
            return cleanUrl;
        }

        // Si c'est un lien direct vers un fichier vidéo
        if (/\.(mp4|webm|ogg|mov)$/i.test(cleanUrl)) {
            return cleanUrl;
        }

        // Si aucun pattern ne correspond, logger l'URL pour debug
        console.log("URL vidéo non reconnue:", cleanUrl);
        return null;
    } catch (e) {
        console.error("Error parsing video URL:", cleanUrl, e);
        return null;
    }
}

export const DocViewer = ({ sop }) => {

  if (!sop) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full text-gray-400">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <FileText size={32} className="text-gray-300" />
        </div>
        <p className="font-medium">Sélectionnez un document pour commencer</p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(sop.videoUrl);
  const hasVideo = !!embedUrl;
  const isDirectVideo = embedUrl && /\.(mp4|webm|ogg|mov)$/i.test(embedUrl);

  return (
    <div className="flex-1 h-full bg-gray-100 p-2 overflow-hidden flex flex-col">
      <div className="flex-1 bg-white w-full h-full rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-200">
        
        <div className="flex-1 overflow-y-auto">
            {/* Video Player Section - Only shown if valid embed URL exists */}
            {hasVideo && (
                <div className="relative w-full aspect-video bg-slate-900 group overflow-hidden shrink-0">
                    {isDirectVideo ? (
                        <video 
                            src={embedUrl}
                            controls
                            className="w-full h-full absolute inset-0 object-contain"
                            controlsList="nodownload"
                        >
                            Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                    ) : (
                        <iframe 
                            src={embedUrl} 
                            title="Video Player"
                            className="w-full h-full absolute inset-0"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
            )}

            {/* Document Header */}
            <div className="px-8 lg:px-12 pt-8 pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight tracking-tight">{sop.title}</h1>
                    <StatusBadge status={sop.status} />
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{sop.author || 'Inconnu'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>Mis à jour le {sop.lastUpdated}</span>
                        </div>
                    </div>

                    {/* Bouton Modifier le SOP */}
                    <button 
                        onClick={() => expandRecord(sop.rawRecord)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:opacity-90"
                        style={{backgroundColor: '#6442E7', color: 'white', borderColor: '#6442E7'}}
                    >
                        <Edit3 size={14} />
                        Modifier le SOP
                    </button>
                </div>
            </div>

            {/* Document Content */}
            <div className="p-8 lg:p-12">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Markdown Content */}
                    {sop.content ? (
                        <article className="prose prose-lg prose-slate prose-headings:font-bold max-w-none" style={{'--prose-links': '#6442E7'}}>
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                    // Personnalisation pour s'assurer que les styles sont appliqués
                                    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
                                    li: ({node, ...props}) => <li className="pl-2" {...props} />,
                                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed whitespace-pre-wrap" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic my-4 bg-gray-50 py-2 pr-2 rounded-r" {...props} style={{borderLeftColor: '#6442E7'}} />,
                                    code: ({node, inline, className, children, ...props}) => {
                                        return inline ? 
                                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props} style={{color: '#6442E7'}}>{children}</code> :
                                            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto my-4"><code className="text-sm font-mono" {...props}>{children}</code></pre>
                                    }
                                }}
                            >
                                {sop.content}
                            </ReactMarkdown>
                        </article>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
                            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-3">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Document vide</h3>
                            <p className="text-gray-500 text-sm max-w-xs mt-1">Ce document n'a pas encore de contenu texte.</p>
                        </div>
                    )}

                    {/* Attachments Section */}
                    {sop.attachments && sop.attachments.length > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Paperclip size={20} />
                                Pièces Jointes
                            </h3>
                            <div className="grid grid-cols-1 gap-8">
                                {sop.attachments.map(att => (
                                    <div key={att.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50">
                                        <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                                            <span className="font-medium text-sm text-gray-700 truncate flex items-center gap-2">
                                                <FileText size={14} className="text-gray-400" />
                                                {att.filename}
                                            </span>
                                            <a 
                                                href={att.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                                                style={{color: '#6442E7'}}
                                            >
                                                Ouvrir <ExternalLink size={12} />
                                            </a>
                                        </div>
                                        {/* Preview PDF or Image */}
                                        <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                                            {att.type.includes('pdf') ? (
                                                 <iframe 
                                                    src={att.url} 
                                                    className="w-full h-full" 
                                                    title={att.filename}
                                                />
                                            ) : att.type.includes('image') ? (
                                                <img 
                                                    src={att.url} 
                                                    alt={att.filename} 
                                                    className="max-h-full max-w-full object-contain p-4"
                                                />
                                            ) : (
                                                <div className="text-center p-8">
                                                    <p className="text-gray-500 mb-2">Prévisualisation non disponible</p>
                                                    <a 
                                                        href={att.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                                                    >
                                                        Télécharger le fichier
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-8 lg:p-12 mt-auto border-t border-gray-50">
               <div className="max-w-5xl mx-auto flex flex-col gap-3 opacity-20">
                  <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

