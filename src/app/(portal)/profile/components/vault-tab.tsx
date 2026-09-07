"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, Trash2, Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { saveClientFileMetadata } from "../actions/portal";
import { toast } from "react-hot-toast";
import { env } from "@/config/env";

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
  const supabase = createClientComponentClient({
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user?.id) {
      toast.error("Please sign in again.");
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
    <div className="space-y-8">
      {/* Upload Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative group p-6 md:p-10 border-2 border-dashed border-white/20 rounded-3xl bg-[rgba(10,15,30,0.6)] backdrop-blur-2xl text-center hover:bg-[rgba(20,30,50,0.6)] hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(0,191,255,0.2)] transition-all duration-300 overflow-hidden"
      >
        <input 
          type="file" 
          onChange={handleFileUpload} 
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner group-hover:scale-110 group-hover:bg-blue-500/20 transition-transform duration-300">
            <UploadCloud className="w-10 h-10 text-cyan-400 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Upload Document</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Drag and drop or click to upload assets, logos, requirements, or completed signed documents.
          </p>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <p className="text-white font-medium tracking-widest text-sm uppercase">Uploading securely...</p>
          </div>
        )}
      </motion.div>

      {/* Files List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-8 rounded-3xl border border-white/[0.08] bg-[rgba(10,15,30,0.6)] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(255,255,255,0.02)]"
      >
        <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Your Files</h3>
        
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-white/5 bg-white/[0.02] rounded-2xl text-center">
            <File className="w-10 h-10 text-white/10 mb-3" />
            <p className="text-zinc-500 text-sm">No files uploaded yet.</p>
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
                className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.05] bg-black/20 hover:bg-black/40 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-cyan-400 rounded-xl shadow-inner group-hover:bg-blue-500/20 group-hover:text-white transition-colors">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white tracking-tight mb-1">{file.file_name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
