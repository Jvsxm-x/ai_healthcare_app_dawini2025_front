
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { MedicalDocument, User, PredictionResult } from '../types';
import { FileText, Download, Upload, Trash2, Loader2, BrainCircuit, CheckCircle, Clock, ChevronDown, ChevronUp, User as UserIcon, Sparkles, XCircle, Database } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useSaaS } from '../context/SaaSContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

export const Documents = () => {
  const { user } = useAuth();
  const { uploadFile, deleteFile } = useSaaS();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<MedicalDocument[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // View State
  const [expandedDocId, setExpandedDocId] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const fetchDocs = async () => {
    try {
      const storedDocs = localStorage.getItem('dawini_documents');
      if (storedDocs) {
        setDocs(JSON.parse(storedDocs));
      }
    } catch(e) { console.error(e); }
  };

  const fetchDoctors = async () => {
    try {
        const data = await api.get<User[]>('/auth/doctors/');
        setDoctors(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchDocs();
    fetchDoctors();
    const handleStorageChange = () => fetchDocs();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const file = fileInputRef.current?.files?.[0];
      if (!file || !selectedDoctorId) {
          alert("Please select a file and a doctor.");
          return;
      }

      // Client-side File Type Validation
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
          alert("Invalid file type. Please upload a PDF, JPG, or PNG file.");
          return;
      }

      // SaaS Check
      if (!uploadFile(file.size)) {
          if (window.confirm("Storage limit reached! Please upgrade your plan to upload more files. Go to pricing?")) {
              navigate(ROUTES.PRICING);
          }
          return;
      }

      setIsUploading(true);
      try {
          setUploadStep('Uploading & Encrypting...');
          const base64File = await fileToBase64(file);
          await new Promise(resolve => setTimeout(resolve, 800));

          setUploadStep('AI Extracting Data from PDF...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulation: Extract data and predict
          let aiSummary = "Document processed successfully.";
          let aiPrediction = "";
          
          try {
              // Mock extracted data sent to prediction endpoint
              const mockExtractedVitals = {
                  systolic: 140, // Simulated extraction
                  diastolic: 90,
                  glucose: 120,
                  heart_rate: 85
              };
              
              const prediction = await api.post<PredictionResult>('/predict/', mockExtractedVitals);
              aiSummary = `AI Extracted Vitals: BP ${mockExtractedVitals.systolic}/${mockExtractedVitals.diastolic}, Glucose ${mockExtractedVitals.glucose}.`;
              aiPrediction = `Risk Assessment: ${prediction.risk} (Confidence: 89%)`;
          } catch (predError) {
              console.warn("Prediction skipped or failed", predError);
          }

          setUploadStep('Finalizing...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const docName = doctors.find(d => d.id === parseInt(selectedDoctorId))?.last_name || 'Unknown';
          
          const mockNewDoc: MedicalDocument = {
              id: Date.now(),
              title: file.name,
              document_type: file.type.includes('pdf') ? 'PDF Report' : 'Image Scan',
              uploaded_at: new Date().toISOString(),
              file: base64File,
              file_size: file.size,
              doctor_id: parseInt(selectedDoctorId),
              doctor_name: docName,
              patient_name: user?.username || 'Me',
              status: 'pending',
              ai_summary: aiSummary,
              ai_prediction_result: aiPrediction,
              ai_tips: "Pending doctor review."
          };

          const updatedDocs = [mockNewDoc, ...docs];
          setDocs(updatedDocs);
          localStorage.setItem('dawini_documents', JSON.stringify(updatedDocs));
          
          setIsUploadModalOpen(false);
          alert("Document uploaded and analyzed!");
      } catch (error) {
          console.error(error);
          alert("Failed to upload document.");
      } finally {
          setIsUploading(false);
          setUploadStep('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setSelectedDoctorId('');
      }
  };

  const handleDelete = async (id: number, size: number) => {
      if(!window.confirm("Are you sure you want to delete this document?")) return;
      
      deleteFile(size); // Reclaim SaaS storage

      const updatedDocs = docs.filter(d => d.id !== id);
      setDocs(updatedDocs);
      localStorage.setItem('dawini_documents', JSON.stringify(updatedDocs));
  };

  const handleDownload = (doc: MedicalDocument) => {
    if (!doc.file) {
        alert("File not found.");
        return;
    }
    const link = document.createElement('a');
    link.href = doc.file;
    link.download = doc.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleExpand = (id: number) => {
      setExpandedDocId(expandedDocId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Medical Documents</h2>
                <p className="text-slate-500">AI-analyzed reports (PDF/Images)</p>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload size={18} className="mr-2"/> Upload & Analyze
            </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-6 py-4 font-semibold text-slate-700 text-sm">
                <div className="col-span-4">Document Name</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Assigned Doctor</div>
                <div className="col-span-2">AI Status</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-slate-100">
                {docs.map(doc => (
                    <div key={doc.id} className="transition-colors hover:bg-slate-50">
                        {/* Main Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center gap-4">
                            <div className="col-span-4 flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(doc.id)}>
                                <div className={`p-2 rounded-lg ${doc.status === 'approved' ? 'bg-teal-100 text-teal-600' : doc.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <span className="font-medium text-slate-900 block">{doc.title}</span>
                                    <span className="text-xs text-slate-400">{(doc.file_size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                            
                            <div className="col-span-2 hidden md:block text-slate-500 text-sm">
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                            </div>

                            <div className="col-span-3 text-sm text-slate-600 flex items-center gap-1">
                                <UserIcon size={14} /> Dr. {doc.doctor_name || doc.doctor_id || 'Unassigned'}
                            </div>

                            <div className="col-span-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase border ${
                                    doc.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    doc.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {doc.status}
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-end gap-2">
                                <button 
                                    onClick={() => handleDownload(doc)} 
                                    className="p-2 hover:bg-slate-200 rounded-full text-slate-500"
                                    title="Download Document"
                                >
                                    <Download size={18} />
                                </button>
                                <button onClick={() => toggleExpand(doc.id)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                    {expandedDocId === doc.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                <button onClick={() => handleDelete(doc.id, doc.file_size)} className="p-2 hover:bg-red-50 text-red-500 rounded-full">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedDocId === doc.id && (
                            <div className="bg-slate-50 px-6 py-6 border-t border-slate-100 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <BrainCircuit size={64} className="text-indigo-600"/>
                                        </div>
                                        <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-3">
                                            <BrainCircuit size={18} /> AI Auto-Extraction
                                        </h4>
                                        <p className="text-slate-700 text-sm leading-relaxed mb-2">{doc.ai_summary}</p>
                                        {doc.ai_prediction_result && (
                                            <div className="bg-indigo-50 p-2 rounded border border-indigo-200 text-indigo-800 text-sm font-semibold">
                                                {doc.ai_prediction_result}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`bg-white p-5 rounded-xl border shadow-sm relative overflow-hidden ${doc.status === 'approved' ? 'border-teal-100' : 'border-slate-100'}`}>
                                        <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-3">
                                            <CheckCircle size={18} className={doc.status === 'approved' ? "text-teal-600" : "text-slate-400"}/> Doctor Verification
                                        </h4>
                                        <p className="text-slate-700 text-sm leading-relaxed">
                                            {doc.ai_tips || "No specific recommendations generated."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl relative">
                    <h3 className="text-xl font-bold mb-2">Upload & Analyze</h3>
                    <p className="text-sm text-slate-500 mb-6">Our AI will scan your PDF/Image for key health indicators.</p>
                    
                    {!isUploading ? (
                        <form onSubmit={handleUploadSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Document</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden"
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                    <p className="text-sm text-slate-600">Click to browse files</p>
                                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG supported</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Assign Doctor</label>
                                <select 
                                    className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.last_name} ({d.first_name})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="secondary" type="button" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Start Analysis</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">AI Processing</h4>
                                <p className="text-teal-600 font-medium animate-pulse">{uploadStep}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};
