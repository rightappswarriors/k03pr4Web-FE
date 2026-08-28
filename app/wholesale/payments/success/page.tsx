'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { purchaseOrderApi } from '@/services/purchase-order.service';

type Payment = Awaited<ReturnType<typeof purchaseOrderApi.paymentStatus>>;

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const transactionId = params.get('transactionId');
  const [payment, setPayment] = useState<Payment>();
  const [error, setError] = useState('');
  const [timedOut, setTimedOut] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!transactionId) return;
    try {
      setError('');
      const next = await purchaseOrderApi.paymentStatus(transactionId);
      setPayment(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to verify payment status.');
    }
  }, [transactionId]);

  useEffect(() => {
    void checkStatus();
    if (!transactionId) return;
    const interval = window.setInterval(() => void checkStatus(), 3000);
    const timeout = window.setTimeout(() => setTimedOut(true), 60000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [checkStatus, transactionId]);

  const status = payment?.transactionStatus;
  const confirmed = status === 'SUCCEEDED';
  const failed = status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED';
  const poHref = payment?.poId ? `/wholesale/orders/${payment.poId}` : '/wholesale/orders';
  const title = !transactionId
    ? 'Payment reference missing'
    : confirmed
      ? 'Payment Confirmed'
      : failed
        ? status === 'CANCELLED' ? 'Payment Cancelled' : status === 'EXPIRED' ? 'Payment Session Expired' : 'Payment Failed'
        : timedOut
          ? 'Payment is taking longer than expected'
          : 'Confirming your payment with Maya…';

  return (
    <main className="mx-auto max-w-lg p-10 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {!confirmed && !failed && <p className="mt-3 text-slate-600">Payment submitted. Kompra is verifying the result directly with Maya.</p>}
      {confirmed && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><p className="text-2xl font-bold">₱{payment?.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p><p className="mt-1">{payment?.poNumber ? `PO ${payment.poNumber}` : 'Purchase order'} · Paid via Maya</p>{payment?.confirmedAt && <p className="mt-1 text-sm">Paid {new Date(payment.confirmedAt).toLocaleString('en-PH')}</p>}</div>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-7 flex justify-center gap-4">
        {!confirmed && !failed && <button type="button" onClick={() => { setTimedOut(false); void checkStatus(); }} className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-800">Check Again</button>}
        <Link className="rounded-lg bg-[#287c72] px-4 py-2 font-semibold text-white" href={poHref}>{confirmed ? 'View Purchase Order' : 'Return to Purchase Order'}</Link>
        {confirmed && <Link className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-800" href={poHref}>View Receipt</Link>}
      </div>
      <p className="mt-6 text-xs text-slate-500">This redirect page cannot confirm a payment or change its status.</p>
    </main>
  );
}
