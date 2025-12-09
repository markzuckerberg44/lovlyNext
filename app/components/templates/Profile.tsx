"use client";

import React, { useState } from "react";
import BottomNavBar from "../molecules/BottomNavBar";
import { useAppSelector, useAppDispatch } from "@/app/lib/store/hooks";
import { setCoupleNames } from "@/app/lib/store/slices/profileSlice";

const Profile = () => {
  const dispatch = useAppDispatch();
  const { couple } = useAppSelector((state) => state.profile);

  const [showRelationshipCard, setShowRelationshipCard] = useState(true);
  const [partnerNameInput, setPartnerNameInput] = useState("");
  const [relationshipDate, setRelationshipDate] = useState("");
  const [joinCode, setJoinCode] = useState("XXXXXXXX");
  const [showInvitation, setShowInvitation] = useState(false);
  const [invitationName, setInvitationName] = useState("Nombre de usuario");

  const handleEndRelationship = () => {
    // Aquí implementarías la lógica para terminar la relación
    setShowRelationshipCard(false);
    setPartnerNameInput("");
    setRelationshipDate("");
  };

  const handleJoinRelationship = () => {
    // Aquí implementarías la lógica para unirse a una relación con el código
    console.log("Joining with code:", joinCode);
  };

  const handleAcceptInvitation = () => {
    setShowInvitation(false);
    // Lógica para aceptar invitación
  };

  const handleRejectInvitation = () => {
    setShowInvitation(false);
    // Lógica para rechazar invitación
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
        <h1 className="text-lg font-medium text-gray-900">Nombre de usuario</h1>
      </div>

      {/* Contenido principal scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {/* Card de relación actual */}
        {showRelationshipCard && (
          <div className="bg-gray-800 rounded-3xl p-6 mb-6 text-white">
            <p className="text-sm mb-2 text-gray-300">Estas en una relación con:</p>
            <h2 className="text-3xl font-light mb-4">Nombre pareja</h2>
            <p className="text-sm text-gray-400 mb-6">Desde: dd-mm-aaaa</p>
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
            <p className="text-3xl font-light text-gray-900 tracking-wider">{joinCode}</p>
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

          {/* Card de invitación */}
          {showInvitation ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-900">{invitationName}</p>
                <p className="text-sm text-gray-500">te ha invitado a unirte a una relación</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptInvitation}
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
                  onClick={handleRejectInvitation}
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
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <p className="text-gray-400 text-sm">No tienes invitaciones pendientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default Profile;
