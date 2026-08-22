import { useLanguage } from "../context/LocalizationContext";
import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck, CreditCard, ExternalLink } from 'lucide-react';
import { Invoice, UserProfile } from '../types';
import { formatCurrency, formatDateRu, numberToWordsRu } from '../utils/numberToWordsRu';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface PublicInvoiceViewProps {
  invoice?: Invoice;
  userProfile?: UserProfile;
  onMarkPaid: (id: string) => void;
}

export const PublicInvoiceView: React.FC<PublicInvoiceViewProps> = ({
  invoice,
  userProfile,
  onMarkPaid
}) => {
  const { t } = useLanguage();
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const profile: UserProfile = userProfile || {
    id: 'usr_default',
    fullName: 'Самозанятый Пользователь',
    email: 'user@example.com',
    occupation: 'Самозанятый',
    inn: '770000000000',
    phone: '+7 (900) 000-00-00',
    profession: 'freelancer',
    isSelfEmployed: true,
    avatar: '',
    bankDetails: {
      bankName: 'АО Тинькофф Банк',
      bik: '044525974',
      accountNumber: '40817810000000000000',
      corrAccount: '30101810145250000974'
    },
    invoiceSettings: {
      defaultVatRate: 0,
      defaultNotes: 'Без НДС. Налог на профессиональный доход (НПД).',
      prefix: 'СЧ',
      nextNumber: 1
    }
  };

  if (!invoice) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 custom-card text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-600">Счет не найден</h2>
        <p className="text-xs text-slate-500">Возможно, ссылка устарела или счет был удален автором.</p>
      </div>
    );
  }

  const handleSimulatePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaySuccess(true);
      onMarkPaid(invoice.id);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#2C3E50] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
            Официальный счет на оплату
          </span>
          <h1 className="text-2xl font-bold">Счет № {invoice.number}</h1>
          <p className="text-xs text-slate-300">Исполнитель: {profile.fullName} (Самозанятый)</p>
        </div>

        <div className="flex flex-col sm:items-end space-y-2 w-full sm:w-auto">
          <div className="text-2xl font-extrabold text-[#E67E22]">{formatCurrency(invoice.total)}</div>
          {invoice.status === 'paid' || paySuccess ? (
            <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> СЧЕТ ОПЛАЧЕН
            </span>
          ) : (
            <button
              onClick={handleSimulatePayment}
              disabled={isPaying}
              className="px-6 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isPaying ? 'Обработка платежа СБП...' : 'Оплатить онлайн (СБП)'}</span>
            </button>
          )}
        </div>
      </div>

      {paySuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
            Спасибо! Оплата успешно зафиксирована. Чек НПД отправлен на ваш email.
          </span>
        </div>
      )}

      {/* Invoice Document Body */}
      <div className="custom-card p-6 sm:p-8 space-y-6 bg-white text-black shadow-xl border border-slate-200">
        <div className="border-b border-slate-200 pb-4 flex justify-between items-start text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-black">Получатель платежа</h3>
            <p className="font-bold text-black">{profile.fullName}</p>
            <p className="text-black font-semibold">ИНН: {profile.inn}</p>
            <p className="text-black font-semibold">Банк: {profile.bankDetails.bankName}</p>
            <p className="text-black font-semibold">Счет: {profile.bankDetails.accountNumber}</p>
          </div>
          <div className="text-right">
            <button
              onClick={() => generateInvoicePDF(invoice, profile)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold rounded-xl text-xs inline-flex items-center space-x-1.5 cursor-pointer border border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Скачать PDF</span>
            </button>
          </div>
        </div>

        {/* Party Details */}
        <div className="text-xs space-y-1 text-black font-medium">
          <p><strong>{t('auto.ext.289')}</strong> {invoice.clientName} {invoice.clientInn ? `(ИНН ${invoice.clientInn})` : ''}</p>
          <p><strong>Дата выставления:</strong> {formatDateRu(invoice.date)}</p>
          <p><strong>Срок оплаты:</strong> до {formatDateRu(invoice.dueDate)}</p>
        </div>

        {/* Table of items */}
        <table className="w-full text-left text-xs border-collapse text-black">
          <thead>
            <tr className="bg-slate-100 font-extrabold text-black">
              <th className="p-2 border border-slate-300">№</th>
              <th className="p-2 border border-slate-300">Наименование услуги</th>
              <th className="p-2 border border-slate-300 text-center">Кол-во</th>
              <th className="p-2 border border-slate-300 text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((it, idx) => (
              <tr key={it.id || idx}>
                <td className="p-2 border border-slate-300 text-center font-bold">{idx + 1}</td>
                <td className="p-2 border border-slate-300 font-bold">{it.description || ''}</td>
                <td className="p-2 border border-slate-300 text-center font-semibold">{it.quantity || 1}</td>
                <td className="p-2 border border-slate-300 text-right font-extrabold">{(it.total || 0).toLocaleString('ru-RU')} ₽</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right text-sm font-extrabold text-black">
          Всего к оплате: {formatCurrency(invoice.total)}
        </div>

        {invoice.notes && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-black font-medium">
            <strong className="text-black font-bold">Примечание исполнителя:</strong> {invoice.notes}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 text-center text-xs text-black font-bold flex items-center justify-center space-x-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Счет сформирован в сервисе Умный Органайзер (ФНС НПД)</span>
        </div>
      </div>
    </div>
  );
};
