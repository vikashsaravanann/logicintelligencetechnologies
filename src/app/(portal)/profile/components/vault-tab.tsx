"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, Trash2, Loader2 } from "lucide-react";
import { getClientSupabase } from "@/lib/supabase/client";
import { saveClientFileMetadata } from "../actions/portal";
import { toast } from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 } as any
  }
};

export function VaultTab({ files, user }: { files: any[], user: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = getClientSupabase();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user?.id) {
      toast.error("Please sign in again.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_MIME_TYPES = [
      'application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

    if (file.size > MAX_SIZE) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Only PDF, JPG, PNG, and DOC are allowed.");
      return;
    }

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Invalid file extension.");
      return;
    }

    try {
      setIsUploading(true);
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from("client_vault")
        .upload(filePath, file);

      if (error) throw error;

      // Save metadata to database
      const res = await saveClientFileMetadata(file.name, filePath, file.size);
      if (!res.success) throw new Error(res.error);

      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative group p-8 md:p-12 border-2 border-dashed border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)] rounded-3xl bg-white text-center hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all duration-300 overflow-hidden shadow-xs"
      >
        <input 
          type="file" 
          onChange={handleFileUpload} 
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        />

        <div className="relative z-10">
          <div className="w-16 h-16 bg-[var(--lit-light-blue,#E7F3FF)] border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
            <UploadCloud className="w-8 h-8 text-[var(--lit-blue,#1565C0)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] mb-1 tracking-tight">Upload Document</h3>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto leading-relaxed">
            Drag and drop or click to upload project assets, design specs, or signed NDAs (up to 10MB).
          </p>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--lit-teal,#1FA9A2)] animate-spin mb-3" />
            <p className="text-[var(--lit-navy,#0B2545)] font-bold tracking-wider text-xs uppercase">Uploading securely...</p>
          </div>
        )}
      </motion.div>

      {/* Files List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] mb-6 tracking-tight">Your Vault Files</h3>
        
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] rounded-2xl text-center">
            <File className="w-10 h-10 text-[var(--lit-text-muted,#52677C)]/40 mb-3" />
            <p className="text-[var(--lit-text-muted,#52677C)] text-sm">No files uploaded yet in your vault.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {files.map((file) => (
              <motion.div 
                key={file.id} 
                variants={itemVariants}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-white hover:border-[var(--lit-border-light,#DFE7EF)] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-100 rounded-xl">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-0.5">{file.file_name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  className="p-2.5 text-[var(--lit-text-muted,#52677C)] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                  title="Remove file"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
