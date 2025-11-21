import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MedicalDocument } from '../types';
import { FileText, Download, Upload } from 'lucide-react';
import { Button } from '../components/Button';

export const Documents = () => {
  const [docs, setDocs] = useState<MedicalDocument[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await api.get<MedicalDocument[]>('/medical/documents/');
        setDocs(data);
      } catch(e) { console.error(e); }
    };
    fetchDocs();
  }, []);

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
                <p className="text-slate-500">Prescriptions, Lab Results, and Reports</p>
            </div>
            <Button><Upload size={18} className="mr-2"/> Upload New</Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Document Name</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Type</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Date</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {docs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-slate-400" size={20} />
                                    <span className="font-medium text-slate-900">{doc.title}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium uppercase">
                                    {doc.document_type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-teal-600 hover:text-teal-800 font-medium text-sm flex items-center justify-end gap-1 w-full">
                                    <Download size={16} /> Download
                                </button>
                            </td>
                        </tr>
                    ))}
                    {docs.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                No documents found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};
