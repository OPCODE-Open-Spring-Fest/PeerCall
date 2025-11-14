import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface PermissionErrorModalProps {
    isOpen: boolean;
    message: string;
    onRetry: () => void;
    onClose: () => void;
}

const PermissionErrorModal: React.FC<PermissionErrorModalProps> = ({
    isOpen,
    message,
    onRetry,
    onClose,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-9999"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 14 }}
                        className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
                                <AlertTriangle size={22} />
                                Device Permission Error
                            </div>
                            <button onClick={onClose}>
                                <X size={22} className="text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>

                        {/* Message */}
                        <p className="text-gray-800 leading-relaxed">{message}</p>

                        {/* Actions */}
                        <div className="mt-5 flex flex-col gap-3">

                            {/* Retry Button */}
                            <button
                                onClick={onRetry}
                                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-all"
                            >
                                <RefreshCw size={18} />
                                Retry Access
                            </button>

                            {/* Browser Permission Links */}
                            <div className="text-sm text-gray-700">
                                <p className="font-semibold mb-1">Grant permissions in browser:</p>

                                <a
                                    href="chrome://settings/content/camera"
                                    target="_blank"
                                    className="block underline text-blue-600"
                                >
                                    Open Camera Permissions
                                </a>

                                <a
                                    href="chrome://settings/content/microphone"
                                    target="_blank"
                                    className="block underline text-blue-600 mt-1"
                                >
                                    Open Microphone Permissions
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PermissionErrorModal;
