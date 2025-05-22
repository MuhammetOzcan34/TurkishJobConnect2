import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type Account = {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

type Quote = {
  id: number;
  number: string;
  subject: string;
  accountId: number;
  account?: Account;
  items?: any[];
  status: string;
  type: string;
  date: string;
  validUntil?: string;
  contactPerson?: string;
  paymentTerms?: string;
  notes?: string;
  currency?: string;
  totalAmount?: number;
  formattedDate?: string;
  formattedValidUntil?: string;
};

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: [`/api/quotes/${id}`],
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!quote) {
    return <div>Teklif bulunamadı.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Teklif Detayı</h1>
      <div className="bg-white rounded shadow p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{quote.subject}</h2>
              <p className="text-sm text-muted-foreground">Teklif No: {quote.number}</p>
              <p className="text-sm text-muted-foreground">Durum: {quote.status}</p>
              <p className="text-sm text-muted-foreground">Tarih: {quote.formattedDate || quote.date}</p>
              {quote.validUntil && (
                <p className="text-sm text-muted-foreground">
                  Geçerlilik: {quote.formattedValidUntil || quote.validUntil}
                </p>
              )}
            </div>
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/accounts/${quote.accountId}`)}
            >
              Cari Hesaba Git
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Cari Hesap Bilgileri</h3>
          <p className="text-sm">{quote.account?.name}</p>
          {quote.account?.address && (
            <p className="text-sm text-muted-foreground mt-1">{quote.account.address}</p>
          )}
          {(quote.account?.phone || quote.account?.email) && (
            <div className="flex gap-4 mt-2">
              {quote.account?.phone && (
                <div className="flex items-center gap-2">
                  <span className="material-icons text-base">phone</span>
                  <span>{quote.account.phone}</span>
                </div>
              )}
              {quote.account?.email && (
                <div className="flex items-center gap-2">
                  <span className="material-icons text-base">mail</span>
                  <span>{quote.account.email}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Teklif Kalemleri</h3>
          {quote.items && quote.items.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Açıklama</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th>Birim Fiyat</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.unitPrice}</td>
                    <td>{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Teklif kalemi yok.</p>
          )}
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Toplam Tutar</h3>
          <p className="text-lg font-bold">
            {quote.totalAmount} {quote.currency || "₺"}
          </p>
        </div>
        {quote.notes && (
          <div className="mb-4">
            <h3 className="font-semibold">Notlar</h3>
            <p>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}