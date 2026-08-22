import React, { useState } from 'react';
import { CheckCircle2, Download, CreditCard, ShieldCheck, QrCode } from 'lucide-react';
import { Invoice, UserProfile } from '../types';
import { formatCurrency, formatDateRu, numberToWordsRu } from '../utils/numberToWordsRu';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface InvoicesPublicViewProps {
  invoice?: Invoice;
  userProfile?: UserProfile;
  onMarkPaid?: (id: string) => void;
  onBack?: () => void;
}

export const InvoicesPublicView: React.FC<InvoicesPublicViewProps> = ({
  invoice,
  userProfile,
  onMarkPaid
}) => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card'>('sbp');

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Счет не найден</h2>
          <p className="text-xs text-slate-500">Запрошенный счет на оплату не существует или был удален.</p>
        </div>
      </div>
    );
  }

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

  const handlePay = () => {
    if (onMarkPaid) onMarkPaid(invoice.id);
    setPaymentSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-10 px-4 text-slate-800 dark:text-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand Bar */}
        <div className="bg-[#2C3E50] text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#E67E22] flex items-center justify-center font-extrabold text-white text-xl">
              УО
            </div>
            <div>
              <h1 className="font-bold text-sm">Счет на оплату от {profile.fullName}</h1>
              <p className="text-xs text-slate-300">Официальный платежный документ самозанятого</p>
            </div>
          </div>
          <button
            onClick={() => generateInvoicePDF(invoice, profile)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Скачать PDF</span>
          </button>
        </div>

        {/* Payment Confirmation Banner */}
        {paymentSuccess || invoice.status === 'paid' ? (
          <div className="bg-emerald-50 border-2 border-emerald-500 p-6 rounded-2xl text-emerald-900 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold">Счет № {invoice.number} Оплачен!</h2>
            <p className="text-xs text-emerald-700">
              Средства зачислены Исполнителю {profile.fullName}. Чек самозанятого сформирован.
            </p>
          </div>
        ) : (
          /* Payment Box */
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <h2 className="font-bold text-base">К оплате: {formatCurrency(invoice.total)}</h2>
                <p className="text-xs text-slate-500">Счет № {invoice.number} (до {formatDateRu(invoice.dueDate)})</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                Ожидает оплаты
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Option 1: SBP QR Code */}
              <div
                onClick={() => setPaymentMethod('sbp')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'sbp' ? 'border-[#E67E22] bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-sm mb-1">
                  <QrCode className="w-5 h-5 text-[#E67E22]" />
                  <span>Система Быстрых Платежей (СБП)</span>
                </div>
                <p className="text-xs text-slate-500">Оплата без комиссии через мобильный банк</p>
              </div>

              {/* Payment Option 2: Bank Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-[#E67E22] bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-sm mb-1">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <span>Банковская карта / Мир / SberPay</span>
                </div>
                <p className="text-xs text-slate-500">Оплата картой любого российского банка</p>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer text-sm"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Подтвердить и оплатить {formatCurrency(invoice.total)}</span>
            </button>
          </div>
        )}

        {/* Invoice Summary Details */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 pb-2">
            Детали счета № {invoice.number}
          </h3>

          <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold block">Исполнитель:</span>
              <span>{profile.fullName} (ИНН {profile.inn})</span>
            </div>
            <div>
              <span className="font-semibold block">Заказчик:</span>
              <span>{invoice.clientName}</span>
            </div>
          </div>

          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold">
                <th className="p-2">Услуга</th>
                <th className="p-2 text-center">Кол-во</th>
                <th className="p-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-center">{item.quantity} шт.</td>
                  <td className="p-2 text-right font-bold">{item.total.toLocaleString('ru-RU')} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-500 text-[11px]">
            Налог на профессиональный доход (НПД). Официальный чек из системы "Мой Налог" будет сформирован автоматически после зачисления средств.
          </div>
        </div>
      </div>
    </div>
  );
};
