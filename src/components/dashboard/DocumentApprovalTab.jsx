import React, { useState, useEffect } from 'react';
import { 
  FileImage, Eye, CheckCircle, XCircle, Clock, Search, Filter,
  RefreshCw, Loader, User, MapPin, Calendar, AlertTriangle,
  CheckSquare, X, Download, Upload, MessageSquare, Image,
  ZoomIn, ZoomOut, RotateCcw, Star, ThumbsUp, ThumbsDown
} from 'lucide-react';
import ApiService from '../../services/ApiService';

/**
 * 📋 Document Approval Tab Component
 * 
 * Complete integration with DocumentApprovalController endpoints:
 * ✅ GET /api/v1/agence/admin/documents/pending
 * ✅ GET /api/v1/agence/admin/documents/{documentId}/review
 * ✅ POST /api/v1/agence/admin/documents/{documentId}/approve
 * ✅ POST /api/v1/agence/admin/documents/{documentId}/reject
 * ✅ GET /api/v1/agence/admin/documents/statistics
 * ✅ POST /api/v1/agence/admin/documents/bulk-approve
 * ✅ POST /api/v1/agence/admin/documents/bulk-reject
 * 
 * Features:
 * - Pending documents with pagination and filters
 * - Document review with image viewer
 * - Individual approval/rejection with comments
 * - Bulk operations for multiple documents
 * - Document statistics dashboard
 * - Real-time updates and notifications
 */
const DocumentApprovalTab = ({ 
  loading, 
  errors, 
  dashboardData, 
  filters, 
  setFilters, 
  pagination, 
  setPagination,
  modals,
  setModals,
  onRefresh,
  onAction 
}) => {
  // Local state for document management
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documentStats, setDocumentStats] = useState(null);
  const [reviewDocument, setReviewDocument] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // Get pending documents from props
  const pendingDocuments = dashboardData.agenceService.documents || { content: [], totalElements: 0 };

  // =====================================
  // API INTEGRATION FUNCTIONS
  // =====================================

  /**
   * Fetch document statistics
   */
  const fetchDocumentStatistics = async () => {
    try {
      const response = await ApiService.getDocumentStatistics();
      if (response.success) {
        setDocumentStats(response.data);
      }
    } catch (error) {
      console.error('Document statistics fetch error:', error);
    }
  };

  /**
   * Fetch document for review
   */
  const fetchDocumentForReview = async (documentId) => {
    try {
      const response = await ApiService.getDocumentForReview(documentId);
      if (response.success) {
        setReviewDocument(response.data);
        setModals(prev => ({
          ...prev,
          documentReview: { open: true, document: response.data }
        }));
      } else {
        alert('Erreur lors du chargement du document: ' + response.error);
      }
    } catch (error) {
      console.error('Document review fetch error:', error);
      alert('Erreur lors du chargement du document');
    }
  };

  /**
   * Handle document approval
   */
  const handleApproval = async (documentId, comment = '') => {
    const result = await onAction.approveDocument(documentId, { 
      comment,
      approvedAt: new Date().toISOString()
    });
    
    if (result.success) {
      setApprovalComment('');
      await fetchDocumentStatistics();
    } else {
      alert('Erreur lors de l\'approbation: ' + result.error);
    }
    
    return result;
  };

  /**
   * Handle document rejection
   */
  const handleRejection = async (documentId, reason) => {
    if (!reason.trim()) {
      alert('Veuillez spécifier une raison pour le rejet');
      return;
    }

    const result = await onAction.rejectDocument(documentId, { 
      reason,
      rejectedAt: new Date().toISOString()
    });
    
    if (result.success) {
      setRejectionReason('');
      await fetchDocumentStatistics();
    } else {
      alert('Erreur lors du rejet: ' + result.error);
    }
    
    return result;
  };

  /**
   * Handle bulk approval
   */
  const handleBulkApproval = async () => {
    if (selectedDocuments.length === 0) {
      alert('Veuillez sélectionner au moins un document');
      return;
    }

    setBulkActionLoading(true);
    try {
      const response = await ApiService.bulkApproveDocuments(selectedDocuments, {
        comment: 'Approbation en lot',
        approvedAt: new Date().toISOString()
      });

      if (response.success) {
        setSelectedDocuments([]);
        await onRefresh.documents();
        await fetchDocumentStatistics();
        alert(`${selectedDocuments.length} documents approuvés avec succès`);
      } else {
        alert('Erreur lors de l\'approbation en lot: ' + response.error);
      }
    } catch (error) {
      console.error('Bulk approval error:', error);
      alert('Erreur lors de l\'approbation en lot');
    } finally {
      setBulkActionLoading(false);
    }
  };

  /**
   * Handle bulk rejection
   */
  const handleBulkRejection = async () => {
    if (selectedDocuments.length === 0) {
      alert('Veuillez sélectionner au moins un document');
      return;
    }

    const reason = prompt('Raison du rejet en lot:');
    if (!reason) return;

    setBulkActionLoading(true);
    try {
      const response = await ApiService.bulkRejectDocuments(selectedDocuments, {
        reason,
        rejectedAt: new Date().toISOString()
      });

      if (response.success) {
        setSelectedDocuments([]);
        await onRefresh.documents();
        await fetchDocumentStatistics();
        alert(`${selectedDocuments.length} documents rejetés avec succès`);
      } else {
        alert('Erreur lors du rejet en lot: ' + response.error);
      }
    } catch (error) {
      console.error('Bulk rejection error:', error);
      alert('Erreur lors du rejet en lot');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // =====================================
  // EFFECTS
  // =====================================

  useEffect(() => {
    fetchDocumentStatistics();
  }, []);

  // =====================================
  // COMPONENT RENDERERS
  // =====================================

  /**
   * Document Statistics Cards
   */
  const DocumentStatsCards = () => {
    const stats = documentStats || {
      totalDocuments: 0,
      pendingDocuments: 0,
      approvedDocuments: 0,
      rejectedDocuments: 0,
      approvalRate: 0,
      averageProcessingTime: '0h'
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FileImage className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingDocuments}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approuvés</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedDocuments}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Taux d'Approbation</p>
              <p className="text-2xl font-bold text-purple-600">{stats.approvalRate?.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Search and Filters
   */
  const SearchAndFilters = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou CNI..."
              value={filters.documents.search || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                documents: { ...prev.documents, search: e.target.value }
              }))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <select
          value={filters.documents.agency}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            documents: { ...prev.documents, agency: e.target.value }
          }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Toutes les agences</option>
          <option value="AG001">Douala Centre</option>
          <option value="AG002">Yaoundé Bastos</option>
          <option value="AG003">Bafoussam</option>
          <option value="AG004">Garoua</option>
        </select>

        <select
          value={filters.documents.status}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            documents: { ...prev.documents, status: e.target.value }
          }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Approuvés</option>
          <option value="REJECTED">Rejetés</option>
          <option value="ALL">Tous les statuts</option>
        </select>
        
        <button
          onClick={onRefresh.documents}
          disabled={loading.documents}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {loading.documents ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </button>
      </div>
    </div>
  );

  /**
   * Bulk Actions Bar
   */
  const BulkActionsBar = () => (
    selectedDocuments.length > 0 && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">
              {selectedDocuments.length} document(s) sélectionné(s)
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBulkApproval}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center text-sm"
            >
              {bulkActionLoading ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Approuver Tout
            </button>
            
            <button
              onClick={handleBulkRejection}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center text-sm"
            >
              {bulkActionLoading ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ThumbsDown className="h-4 w-4 mr-2" />
              )}
              Rejeter Tout
            </button>
            
            <button
              onClick={() => setSelectedDocuments([])}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  );

  /**
   * Documents List
   */
  const DocumentsList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Documents en Attente d'Approbation</h3>
          {pendingDocuments.totalElements > 0 && (
            <span className="text-sm text-gray-500">
              {pendingDocuments.totalElements} documents au total
            </span>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading.documents ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Chargement des documents...</span>
          </div>
        ) : pendingDocuments.content && pendingDocuments.content.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === pendingDocuments.content.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocuments(pendingDocuments.content.map(doc => doc.id));
                      } else {
                        setSelectedDocuments([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Soumission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingDocuments.content.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(prev => [...prev, document.id]);
                        } else {
                          setSelectedDocuments(prev => prev.filter(id => id !== document.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {document.prenom} {document.nom}
                        </div>
                        <div className="text-sm text-gray-500">{document.email}</div>
                        <div className="text-xs text-gray-400">CNI: {document.cni}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{document.documentType || 'KYC Complet'}</div>
                    <div className="text-xs text-gray-500">
                      {document.hasRecto && '✓ Recto'} {document.hasVerso && '✓ Verso'} {document.hasSelfie && '✓ Selfie'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {document.nomAgence || document.idAgence}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(document.uploadedAt || document.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(document.uploadedAt || document.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      document.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : document.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : document.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {document.status || 'EN_ATTENTE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchDocumentForReview(document.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Examiner le document"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {document.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproval(document.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approuver"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Raison du rejet:');
                              if (reason) handleRejection(document.id, reason);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Rejeter"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <FileImage className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document en attente</h3>
            <p className="text-gray-500">Tous les documents ont été traités ou aucun document n'a été soumis.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pendingDocuments.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {pendingDocuments.number + 1} sur {pendingDocuments.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({
                  ...prev,
                  documents: { ...prev.documents, page: Math.max(0, prev.documents.page - 1) }
                }))}
                disabled={pendingDocuments.number === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPagination(prev => ({
                  ...prev,
                  documents: { ...prev.documents, page: Math.min(pendingDocuments.totalPages - 1, prev.documents.page + 1) }
                }))}
                disabled={pendingDocuments.number >= pendingDocuments.totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Document Review Modal
   */
  const DocumentReviewModal = () => (
    modals.documentReview.open && reviewDocument && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Examen du Document - {reviewDocument.prenom} {reviewDocument.nom}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  CNI: {reviewDocument.cni} • Agence: {reviewDocument.nomAgence || reviewDocument.idAgence}
                </p>
              </div>
              <button
                onClick={() => setModals(prev => ({ ...prev, documentReview: { open: false, document: null } }))}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex h-[70vh]">
            {/* Document Images */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                {/* Image Controls */}
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Documents Soumis</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setImageZoom(prev => Math.max(0.5, prev - 0.25))}
                      className="p-2 text-gray-600 hover:text-gray-800 rounded-lg border"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-600">{Math.round(imageZoom * 100)}%</span>
                    <button
                      onClick={() => setImageZoom(prev => Math.min(3, prev + 0.25))}
                      className="p-2 text-gray-600 hover:text-gray-800 rounded-lg border"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                      className="p-2 text-gray-600 hover:text-gray-800 rounded-lg border"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* CNI Recto */}
                {reviewDocument.rectoCniUrl && (
                  <div className="border rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">CNI - Recto</h5>
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={reviewDocument.rectoCniUrl}
                        alt="CNI Recto"
                        className="w-full h-auto"
                        style={{
                          transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                          transformOrigin: 'center'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* CNI Verso */}
                {reviewDocument.versoCniUrl && (
                  <div className="border rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">CNI - Verso</h5>
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={reviewDocument.versoCniUrl}
                        alt="CNI Verso"
                        className="w-full h-auto"
                        style={{
                          transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                          transformOrigin: 'center'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Selfie */}
                {reviewDocument.selfieUrl && (
                  <div className="border rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Photo Selfie</h5>
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={reviewDocument.selfieUrl}
                        alt="Selfie"
                        className="w-full h-auto"
                        style={{
                          transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                          transformOrigin: 'center'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Details and Actions */}
            <div className="w-80 border-l border-gray-200 p-6 overflow-auto">
              <div className="space-y-6">
                {/* Client Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Informations Client</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Nom:</span> {reviewDocument.nom}</div>
                    <div><span className="font-medium">Prénom:</span> {reviewDocument.prenom}</div>
                    <div><span className="font-medium">Email:</span> {reviewDocument.email}</div>
                    <div><span className="font-medium">Téléphone:</span> {reviewDocument.numero}</div>
                    <div><span className="font-medium">CNI:</span> {reviewDocument.cni}</div>
                    <div><span className="font-medium">Agence:</span> {reviewDocument.nomAgence || reviewDocument.idAgence}</div>
                  </div>
                </div>

                {/* Document Metadata */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Métadonnées</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Date soumission:</span> {new Date(reviewDocument.uploadedAt || reviewDocument.createdAt).toLocaleString('fr-FR')}</div>
                    <div><span className="font-medium">Statut:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        reviewDocument.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reviewDocument.status || 'EN_ATTENTE'}
                      </span>
                    </div>
                    {reviewDocument.facialSimilarityScore && (
                      <div><span className="font-medium">Score similitude:</span> {(reviewDocument.facialSimilarityScore * 100).toFixed(1)}%</div>
                    )}
                    {reviewDocument.livenessDetected !== undefined && (
                      <div><span className="font-medium">Détection vie:</span> {reviewDocument.livenessDetected ? '✓ Oui' : '✗ Non'}</div>
                    )}
                  </div>
                </div>

                {/* Approval Actions */}
                {reviewDocument.status === 'PENDING' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Actions</h4>
                    
                    {/* Approval Section */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commentaire d'approbation (optionnel)
                        </label>
                        <textarea
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                          placeholder="Commentaire sur l'approbation..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          rows={3}
                        />
                      </div>
                      
                      <button
                        onClick={() => handleApproval(reviewDocument.id, approvalComment)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver le Document
                      </button>
                    </div>

                    <div className="my-4 border-t border-gray-200"></div>

                    {/* Rejection Section */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Raison du rejet <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Spécifiez la raison du rejet..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          rows={3}
                        />
                      </div>
                      
                      <button
                        onClick={() => handleRejection(reviewDocument.id, rejectionReason)}
                        disabled={!rejectionReason.trim()}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter le Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // =====================================
  // MAIN RENDER
  // =====================================

  return (
    <div className="space-y-6">
      <DocumentStatsCards />
      <SearchAndFilters />
      <BulkActionsBar />
      <DocumentsList />
      <DocumentReviewModal />
    </div>
  );
};

export default DocumentApprovalTab;