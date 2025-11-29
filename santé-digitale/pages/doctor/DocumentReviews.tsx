
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { MedicalDocument } from '../../types';
import { FileText, BrainCircuit, CheckCircle, XCircle, Edit, Save, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../../components/Button';

export const DocumentReviews = () => {
  const [reviews, setReviews] = useState<MedicalDocument[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ai_summary: '', ai_tips: '' });
  const [loading, setLoading] = useState(false);

  // Fetch from LocalStorage for SaaS demo continuity
  const fetchReviews = () => {
    try {
        const storedDocs = localStorage.getItem('dawini_documents');
        if (storedDocs) {
            const allDocs: MedicalDocument[] = JSON.parse(storedDocs);
            // In a real app, we filter by the logged-in doctor's ID
            // For demo, we show all pending/approved to make testing easier
            setReviews(allDocs); 
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchReviews();
    
    // Listen for storage events (if patient uploads in another tab)
    const handleStorageChange = () => fetchReviews();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleEdit = (doc: MedicalDocument) => {
    setEditingId(doc.id);
    setEditForm({
        ai_summary: doc.ai_summary || '',
        ai_tips: doc.ai_tips || ''
    });
  };

  const handleUpdateStatus = async (docId: number, status: 'approved' | 'rejected') => {
      setLoading(true);
      try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));

          const storedDocs = localStorage.getItem('dawini_documents');
          if (storedDocs) {
              const allDocs: MedicalDocument[] = JSON.parse(storedDocs);
              const updatedDocs = allDocs.map(d => {
                  if (d.id === docId) {
                      return {
                          ...d,
                          status: status,
                          // If we are editing, apply the edits. If just approving/rejecting, keep as is.
                          ai_summary: editingId === docId ? editForm.ai_summary : d.ai_summary,
                          ai_tips: editingId === docId ? editForm.ai_tips : d.ai_tips
                      };
                  }
                  return d;
              });
              
              localStorage.setItem('dawini_documents', JSON.stringify(updatedDocs));
              setReviews(updatedDocs);
          }
          
          setEditingId(null);
          // alert(`Document ${status} successfully.`);
      } catch (e) {
          alert("Failed to update status.");
      } finally {
          setLoading(false);
      }
  };

  const handleCancelEdit = () => {
      setEditingId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Document Reviews</h2>
        <p className="text-slate-500">Validate AI analysis and provide feedback to patients</p>
      </div>

      <div className="space-y-6">
        {reviews.map(doc => (
            <div key={doc.id} className={`bg-white rounded-xl shadow-sm border ${
                doc.status === 'approved' ? 'border-green-200' : 
                doc.status === 'rejected' ? 'border-red-200' : 'border-amber-200'
            } overflow-hidden transition-all`}>
                <div className={`px-6 py-4 border-b flex justify-between items-center ${
                    doc.status === 'approved' ? 'bg-green-50/50' : 
                    doc.status === 'rejected' ? 'bg-red-50/50' : 'bg-amber-50/50'
                }`}>
                    <div className="flex items-center gap-3">
                        <FileText className="text-slate-500" />
                        <div>
                            <h3 className="font-bold text-slate-800">{doc.title}</h3>
                            <p className="text-xs text-slate-500">
                                Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()} • Patient: {doc.patient_name || 'Guest User'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                             doc.status === 'approved' ? 'bg-green-100 text-green-700' : 
                             doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                             {doc.status}
                         </span>
                         {doc.file && (
                             <a href={doc.file} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                                 <ExternalLink size={14} /> View Original
                             </a>
                         )}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* AI Analysis Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                 <BrainCircuit size={18} className="text-indigo-500" /> AI Summary
                             </h4>
                        </div>
                        {editingId === doc.id ? (
                            <textarea 
                                className="w-full h-32 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                value={editForm.ai_summary}
                                onChange={e => setEditForm({...editForm, ai_summary: e.target.value})}
                            />
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 min-h-[8rem] whitespace-pre-wrap">
                                {doc.ai_summary || <span className="text-slate-400 italic">No summary generated.</span>}
                            </div>
                        )}
                    </div>

                    {/* Tips Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                 <CheckCircle size={18} className="text-teal-500" /> Doctor Tips / Advice
                             </h4>
                        </div>
                        {editingId === doc.id ? (
                            <textarea 
                                className="w-full h-32 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                value={editForm.ai_tips}
                                onChange={e => setEditForm({...editForm, ai_tips: e.target.value})}
                            />
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 min-h-[8rem] whitespace-pre-wrap">
                                {doc.ai_tips || <span className="text-slate-400 italic">No tips provided.</span>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    {editingId === doc.id ? (
                        <>
                            <Button variant="secondary" onClick={handleCancelEdit} disabled={loading}>Cancel</Button>
                            <Button onClick={() => handleUpdateStatus(doc.id, 'rejected')} isLoading={loading} className="bg-red-600 hover:bg-red-700">
                                <ThumbsDown size={16} className="mr-2" /> Reject
                            </Button>
                            <Button onClick={() => handleUpdateStatus(doc.id, 'approved')} isLoading={loading} className="bg-green-600 hover:bg-green-700">
                                <Save size={16} className="mr-2" /> Approve
                            </Button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            {doc.status !== 'approved' && (
                                <Button onClick={() => handleUpdateStatus(doc.id, 'approved')} className="bg-green-600 hover:bg-green-700">
                                    <ThumbsUp size={16} className="mr-2" /> Approve
                                </Button>
                            )}
                            {doc.status !== 'rejected' && (
                                <Button onClick={() => handleUpdateStatus(doc.id, 'rejected')} className="bg-red-600 hover:bg-red-700">
                                    <ThumbsDown size={16} className="mr-2" /> Reject
                                </Button>
                            )}
                            <Button variant="secondary" onClick={() => handleEdit(doc)}>
                                <Edit size={16} className="mr-2" /> Edit AI Result
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        ))}

        {reviews.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No documents pending review.</p>
            </div>
        )}
      </div>
    </div>
  );
};
