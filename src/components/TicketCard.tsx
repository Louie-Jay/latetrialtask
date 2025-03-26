import React, { useState } from 'react';
import { Calendar, MapPin, Share2, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';
import type { Ticket } from '../types/database';
import TicketShareModal from './TicketShareModal';

type TicketCardProps = {
  ticket: Ticket;
  onShare: () => void;
};

export default function TicketCard({ ticket, onShare }: TicketCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-effect rounded-xl border border-gray-800/50 group">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-gradient transition-colors">
              {ticket.event?.name}
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-400 text-xs">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{ticket.event?.event_date && formatDate(ticket.event.event_date)}</span>
              </div>
              <div className="flex items-center text-gray-400 text-xs">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{ticket.event?.venue}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showQR && (
          <div className="mt-4 flex justify-center">
            <div className="p-4 bg-black/30 rounded-lg border border-purple-500/20">
              <QRCode
                value={ticket.qr_code}
                size={160}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {ticket.points_earned > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-gray-400">Points earned</span>
            <span className="font-medium text-purple-400">
              +{ticket.points_earned} points
            </span>
          </div>
        )}
      </div>

      {showShareModal && (
        <TicketShareModal
          ticket={ticket}
          onClose={() => setShowShareModal(false)}
          onShare={onShare}
        />
      )}
    </div>
  );
}