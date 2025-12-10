"use client";

import React, { useState, useEffect } from "react";
import BottomNavBar from "../molecules/BottomNavBar";
import { useAppSelector, useAppDispatch } from "@/app/lib/store/hooks";
import { setCoupleNames } from "@/app/lib/store/slices/profileSlice";

const Profile = () => {
  const dispatch = useAppDispatch();
  const { couple } = useAppSelector((state) => state.profile);

  const [displayName, setDisplayName] = useState("Usuario");
  const [inviteCode, setInviteCode] = useState("XXXXXXXX");
  const [partnerName, setPartnerName] = useState("");
  const [relationshipStartDate, setRelationshipStartDate] = useState("");
  const [hasCouple, setHasCouple] = useState(false);
  const [showRelationshipCard, setShowRelationshipCard] = useState(true);
  const [showEndRelationshipPopup, setShowEndRelationshipPopup] = useState(false);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messagePopup, setMessagePopup] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [isEndingRelationship, setIsEndingRelationship] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [partnerNameInput, setPartnerNameInput] = useState("");
  const [relationshipDate, setRelationshipDate] = useState("");
  const [showInvitation, setShowInvitation] = useState(false);
  const [invitationName, setInvitationName] = useState("Nombre de usuario");

  useEffect(() => {
    loadProfile();
    loadCoupleInfo();
    loadInvitations();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDisplayName(data.display_name || 'Usuario');
        setInviteCode(data.invite_code || 'XXXXXXXX');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadCoupleInfo = async () => {
    try {
      const res = await fetch('/api/profile/couple', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.partners && data.partners.length > 0) {
          const partner = data.partners.find((p: any) => p.user_id !== data.currentUserId);
          if (partner) {
            setPartnerName(partner.display_name || 'Tu pareja');
            setHasCouple(true);
          }
        }
        
        // Cargar fecha de relación
        if (data.relationshipStartDate) {
          const date = new Date(data.relationshipStartDate);
          setRelationshipStartDate(date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }));
        }
      } else if (res.status === 404) {
        // Usuario no tiene pareja, esto es normal
        setHasCouple(false);
        setPartnerName('');
        setRelationshipStartDate('');
      }
    } catch (error) {
      console.error('Error loading couple info:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      const res = await fetch('/api/invitations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.data || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const showMessage = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setMessagePopup({ title, message, type });
    setShowMessagePopup(true);
  };

  const handleJoinRelationship = () => {
    setShowJoinPopup(true);
  };

  const sendInvitation = async () => {
    if (!joinCodeInput.trim()) return;
    
    setIsSendingInvitation(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invite_code: joinCodeInput })
      });
      
      const data = await res.json();
      if (res.ok) {
        setShowJoinPopup(false);
        setJoinCodeInput('');
        showMessage('¡Invitación enviada!', 'Tu invitación ha sido enviada exitosamente.', 'success');
      } else {
        showMessage('Error', data.error || 'Error al enviar la invitación', 'error');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      showMessage('Error', 'Error al enviar la invitación', 'error');
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const handleEndRelationship = () => {
    setShowEndRelationshipPopup(true);
  };

  const confirmEndRelationship = async () => {
    setIsEndingRelationship(true);
    try {
      const res = await fetch('/api/profile/couple', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        setShowRelationshipCard(false);
        setHasCouple(false);
        setPartnerName("");
        setRelationshipStartDate("");
        setShowEndRelationshipPopup(false);
      } else {
        const errorData = await res.json();
        showMessage('Error', errorData.error || 'Error al terminar la relación', 'error');
      }
    } catch (error) {
      console.error('Error ending relationship:', error);
      showMessage('Error', 'Error al terminar la relación', 'error');
    } finally {
      setIsEndingRelationship(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const res = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitation_id: invitationId, action: 'accept' })
      });
      
      if (res.ok) {
        await loadCoupleInfo();
        await loadInvitations();
        showMessage('¡Felicidades!', '¡Ahora están en una relación!', 'success');
      } else {
        const data = await res.json();
        showMessage('Error', data.error || 'Error al aceptar la invitación', 'error');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      showMessage('Error', 'Error al aceptar la invitación', 'error');
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      const res = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitation_id: invitationId, action: 'reject' })
      });
      
      if (res.ok) {
        await loadInvitations();
      } else {
        const data = await res.json();
        showMessage('Error', data.error || 'Error al rechazar la invitación', 'error');
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      showMessage('Error', 'Error al rechazar la invitación', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.ok) {
        window.location.href = '/login';
      } else {
        showMessage('Error', 'Error al cerrar sesión', 'error');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      showMessage('Error', 'Error al cerrar sesión', 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header con avatar */}
      <div className="flex flex-col items-center pt-6 pb-4 bg-white">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z" />
          </svg>
        </div>
        <h1 className="text-lg font-medium text-gray-900">{displayName}</h1>
      </div>

      {/* Contenido principal scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {/* Card de relación actual */}
        {showRelationshipCard && hasCouple && (
          <div className="bg-gray-800 rounded-3xl p-6 mb-6 text-white">
            <p className="text-sm mb-2 text-gray-300">Estas en una relación con:</p>
            <h2 className="text-3xl font-light mb-4">{partnerName}</h2>
            {relationshipStartDate && (
              <p className="text-sm text-gray-400 mb-6">Desde: {relationshipStartDate}</p>
            )}
            <button
              onClick={handleEndRelationship}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-4 rounded-full transition-colors"
            >
              Terminar relación
            </button>
          </div>
        )}

        {/* Card de código de unión */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Código de unión:</h3>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <p className="text-3xl font-light text-gray-900 tracking-wider">{inviteCode}</p>
          </div>
          <button
            onClick={handleJoinRelationship}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-4 rounded-full transition-colors"
          >
            Unirse a relación
          </button>
        </div>

        {/* Sección de invitaciones */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-600 font-medium">Invitaciones</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {invitation.sender?.display_name || 'Usuario'}
                    </p>
                    <p className="text-sm text-gray-500">te ha invitado a unirte a una relación</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      className="w-12 h-12 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation.id)}
                      className="w-12 h-12 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <p className="text-gray-400 text-sm">No tienes invitaciones pendientes</p>
            </div>
          )}
        </div>

        {/* Botón de cerrar sesión */}
        <div className="mb-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-4 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Popup para unirse a relación */}
      {showJoinPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Unirse a una relación
            </h3>
            
            <p className="text-gray-600 text-center mb-6 text-sm">
              Ingresa el código de invitación de la persona con quien quieres iniciar una relación
            </p>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Código de invitación
              </label>
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all text-center text-2xl font-light tracking-wider text-gray-900"
                maxLength={8}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinPopup(false);
                  setJoinCodeInput('');
                }}
                disabled={isSendingInvitation}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={sendInvitation}
                disabled={!joinCodeInput.trim() || isSendingInvitation}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  joinCodeInput.trim() && !isSendingInvitation
                    ? 'bg-teal-500 hover:bg-teal-600'
                    : 'bg-teal-300 cursor-not-allowed'
                }`}
              >
                {isSendingInvitation ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmación para terminar relación */}
      {showEndRelationshipPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-red-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              ¿Terminar relación?
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Esta acción no se puede deshacer. Todos los datos compartidos permanecerán en el historial, pero ya no estarán en una relación activa.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEndRelationshipPopup(false)}
                disabled={isEndingRelationship}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEndRelationship}
                disabled={isEndingRelationship}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  isEndingRelationship
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isEndingRelationship ? 'Terminando...' : 'Terminar relación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de mensajes (success/error) */}
      {showMessagePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                messagePopup.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {messagePopup.type === 'success' ? (
                  <svg 
                    className="w-8 h-8 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="w-8 h-8 text-red-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              {messagePopup.title}
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              {messagePopup.message}
            </p>

            <button
              onClick={() => setShowMessagePopup(false)}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all ${
                messagePopup.type === 'success' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default Profile;
