import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TicketScannerProps = {
  eventId: string;
  onScanComplete?: (success: boolean) => void;
};

export default function TicketScanner({ eventId, onScanComplete }: TicketScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (qrCode: string) => {
    setLoading(true);
    try {
      // Verify ticket in database
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('qr_code', qrCode)
        .eq('event_id', eventId)
        .single();

      if (ticketError) throw ticketError;

      if (!ticket) {
        setResult({
          success: false,
          message: 'Invalid ticket'
        });
        return;
      }

      if (ticket.status !== 'active') {
        setResult({
          success: false,
          message: `Ticket is ${ticket.status}`
        });
        return;
      }

      // Mark ticket as used
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'used', scanned_at: new Date().toISOString() })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      setResult({
        success: true,
        message: 'Ticket validated successfully'
      });

      if (onScanComplete) {
        onScanComplete(true);
      }
    } catch (error) {
      console.error('Error scanning ticket:', error);
      setResult({
        success: false,
        message: 'Failed to validate ticket'
      });
      if (onScanComplete) {
        onScanComplete(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock camera access for demo
  // In a real app, you would use a proper QR code scanning library
  const startScanning = () => {
    setScanning(true);
    // Simulate QR code detection
    setTimeout(() => {
      const mockQRCode = `TICKET-${Math.random().toString(36).substr(2, 9)}`;
      handleScan(mockQRCode);
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
      <div className="text-center">
        {!scanning && !loading && !result && (
          <>
            <QrCode className="h-16 w-16 mx-auto text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Scan Ticket</h3>
            <p className="text-gray-400 mb-6">Point your camera at the ticket's QR code</p>
            <button
              onClick={startScanning}
              className="premium-button px-6 py-3"
            >
              Start Scanning
            </button>
          </>
        )}

        {(scanning || loading) && (
          <div className="py-8">
            <Loader className="h-12 w-12 mx-auto text-purple-400 animate-spin mb-4" />
            <p className="text-gray-400">Scanning ticket...</p>
          </div>
        )}

        {result && (
          <div className="py-8">
            {result.success ? (
              <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
            ) : (
              <XCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            )}
            <p className={result.success ? 'text-green-400' : 'text-red-400'}>
              {result.message}
            </p>
            <button
              onClick={() => {
                setResult(null);
                setScanning(false);
              }}
              className="secondary-button mt-6"
            >
              Scan Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}