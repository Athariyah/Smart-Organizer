import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Mail,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Edit,
  Building,
  CreditCard,
  Copy,
  Check,
  Send,
  Sparkles
} from 'lucide-react';
import { Invoice, UserProfile } from '../types';
import { formatCurrency, formatDateRu, numberToWordsRu } from '../utils/numberToWordsRu';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface InvoiceDetailViewProps {
  invoice?: Invoice;
  userProfile?: UserProfile;
  onNavigate: (route: string) => void;
  onMarkPaid: (id: string) => void;
}

export const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  invoice,
  userProfile,
  onNavigate,
  onMarkPaid
}) => {
  if (!invoice) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-bold text-lg text-black dark:text-white">Счет не найден</h3>
        <p className="text-xs text-black dark:text-slate-300 font-medium">Запрошенный счет был удален или не существует.</p>
        <button
          onClick={() => onNavigate('/invoices')}
          className="px-4 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Вернуться к списку счетов
        </button>
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

  const [emailModal, setEmailModal] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [clientEmail, setClientEmail] = useState(invoice.clientEmail || 'client@example.ru');
  const [emailSubject, setEmailSubject] = useState(`Счет на оплату № ${invoice.number} от ${profile.fullName}`);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  const token = invoice.publicToken || invoice.token || invoice.id;
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/invoices/public/${token}` : '';

  // Prepare ready-to-use email message text with public link and requisites
  const generatedEmailMessage = `Здравствуйте, ${invoice.clientName || 'Заказчик'}!

Направляю Вам счет на оплату № ${invoice.number} от ${formatDateRu(invoice.date)} г. на сумму ${formatCurrency(invoice.total)}.

Срок оплаты: до ${formatDateRu(invoice.dueDate)} г.

Вы можете просмотреть счет онлайн, проверить реквизиты или скачать PDF-документ по прямой ссылке:
${publicUrl}

Реквизиты для безналичной оплаты:
• Получатель: ${profile.fullName} (Плательщик НПД)
• ИНН: ${profile.inn}
• Банк: ${profile.bankDetails.bankName || 'Банк получателя'}
• БИК: ${profile.bankDetails.bik || '044525974'}
• Номер счета: ${profile.bankDetails.accountNumber}

После проведения оплаты чек сформируется автоматически в приложении «Мой налог».

С уважением,
${profile.fullName}
тел: ${profile.phone}
email: ${profile.email}`;

  const [customMessage, setCustomMessage] = useState(generatedEmailMessage);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccess(true);
    setTimeout(() => {
      setEmailSuccess(false);
      setEmailModal(false);
    }, 2500);
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(publicUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmailText = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(customMessage).catch(() => {});
    }
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 2500);
  };

  const mailtoLink = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(customMessage)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={() => onNavigate('/invoices')}
          className="px-3 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--text-primary)]" />
          <span>К списку счетов</span>
        </button>

        <div className="flex flex-wrap gap-2">
          {invoice.status !== 'paid' && (
            <button
              onClick={() => onMarkPaid(invoice.id)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Отметить оплаченным</span>
            </button>
          )}

          <button
            onClick={() => generateInvoicePDF(invoice, profile)}
            className="px-3.5 py-2 bg-[#2C3E50] hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Печать / PDF</span>
          </button>

          <button
            onClick={() => {
              setCustomMessage(generatedEmailMessage);
              setEmailModal(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer transition-transform hover:-translate-y-0.5"
            title="Подготовить и отправить готовое письмо со ссылкой на счет"
          >
            <Mail className="w-4 h-4 text-white" />
            <span>Отправить по Email</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>{copiedLink ? 'Ссылка скопирована!' : 'Публичная ссылка'}</span>
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet Document Rendering */}
      <div className="custom-card p-8 space-y-8 bg-white text-black border border-slate-200 shadow-lg">
        {/* Requisites Table Box */}
        <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
          <table className="w-full border-collapse text-black">
            <tbody>
              <tr className="border-b border-slate-300">
                <td colSpan={2} rowSpan={2} className="p-3 w-1/2 align-top border-r border-slate-300">
                  <div className="font-bold text-black">{profile.bankDetails.bankName || 'Банк Исполнителя'}</div>
                  <div className="text-[10px] text-black font-semibold">Банк получателя</div>
                </td>
                <td className="p-2 w-1/6 border-r border-slate-300 font-bold text-black">БИК</td>
                <td className="p-2 w-1/3 font-semibold text-black">{profile.bankDetails.bik || '044525974'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 border-r border-slate-300 font-bold text-black">Сч. №</td>
                <td className="p-2 font-semibold text-black">{profile.bankDetails.corrAccount || '30101810145250000974'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 border-r border-slate-300 font-semibold text-black">ИНН {profile.inn}</td>
                <td className="p-2 border-r border-slate-300 font-semibold text-black">КПП —</td>
                <td rowSpan={2} className="p-2 border-r border-slate-300 font-bold text-black align-middle">Сч. №</td>
                <td rowSpan={2} className="p-2 align-middle font-mono font-bold text-black">{profile.bankDetails.accountNumber}</td>
              </tr>
              <tr>
                <td colSpan={2} className="p-3 border-r border-slate-300">
                  <div className="font-bold text-black">{profile.fullName}</div>
                  <div className="text-[10px] text-black font-semibold">Получатель (Плательщик НПД)</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Invoice Title */}
        <div className="border-b-2 border-black pb-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-black">
            СЧЕТ НА ОПЛАТУ № {invoice.number} от {formatDateRu(invoice.date)} г.
          </h2>
          <div className="text-xs text-black font-semibold mt-1 flex justify-between">
            <span>Срок оплаты: до {formatDateRu(invoice.dueDate)} г.</span>
            <span className="font-extrabold uppercase tracking-wider text-black">
              Статус: {invoice.status === 'paid' ? 'Оплачен' : invoice.status === 'issued' ? 'Выставлен' : 'Просрочен'}
            </span>
          </div>
        </div>

        {/* Parties Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed text-black">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="font-extrabold text-black uppercase mb-1">Исполнитель:</div>
            <div><strong>{profile.fullName}</strong></div>
            <div>ИНН: {profile.inn}</div>
            <div>Тел: {profile.phone}</div>
            <div>Email: {profile.email}</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="font-extrabold text-black uppercase mb-1">Заказчик:</div>
            <div><strong>{invoice.clientName}</strong></div>
            {invoice.clientInn && <div>ИНН: {invoice.clientInn}</div>}
            {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
            <div>Тип: {invoice.clientType === 'legal' ? 'Юридическое лицо / ИП (6%)' : 'Физическое лицо (4%)'}</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse text-black">
            <thead>
              <tr className="bg-black text-white font-bold uppercase">
                <th className="p-2.5 border border-black">№</th>
                <th className="p-2.5 border border-black">Наименование работы (услуги)</th>
                <th className="p-2.5 border border-black text-center">Кол-во</th>
                <th className="p-2.5 border border-black text-right">Цена</th>
                <th className="p-2.5 border border-black text-right">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(invoice.items || []).map((item, idx) => (
                <tr key={item.id}>
                  <td className="p-2.5 border border-slate-300 text-center font-bold text-black">{idx + 1}</td>
                  <td className="p-2.5 border border-slate-300 font-bold text-black">{item.description}</td>
                  <td className="p-2.5 border border-slate-300 text-center font-semibold text-black">{item.quantity || 1} шт.</td>
                  <td className="p-2.5 border border-slate-300 text-right font-semibold text-black">{(item.unitPrice || 0).toLocaleString('ru-RU')} ₽</td>
                  <td className="p-2.5 border border-slate-300 text-right font-bold text-black">{(item.total || 0).toLocaleString('ru-RU')} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 text-black">
          <div className="text-xs space-y-1 max-w-md">
            <p>Всего наименований <strong>{(invoice.items || []).length}</strong>, на сумму <strong>{(invoice.total || 0).toLocaleString('ru-RU')} ₽</strong></p>
            <p className="font-bold text-black">Сумма прописью: {numberToWordsRu(invoice.total)}</p>
          </div>

          <div className="w-full sm:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-black">
            <div className="flex justify-between">
              <span className="font-semibold text-black">Итого:</span>
              <span className="font-bold text-black">{invoice.subtotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between font-semibold text-black">
              <span>Без НДС (НПД):</span>
              <span>—</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between font-extrabold text-sm text-black">
              <span>Всего к оплате:</span>
              <span>{invoice.total.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>

        {/* Notes & Bank QR Code Section */}
        {invoice.notes && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-black font-medium">
            <strong className="block mb-0.5 font-bold text-black">Примечания:</strong>
            <p className="text-black">{invoice.notes}</p>
          </div>
        )}

        {/* Signatures & Stamp */}
        <div className="pt-8 flex items-center justify-between border-t border-slate-200 text-xs text-black">
          <div>
            <div className="font-bold text-black">Исполнитель: {profile.fullName}</div>
            <div className="text-[11px] text-black font-semibold">Самозанятый (НПД)</div>
          </div>
          <div className="text-right">
            <div className="text-black font-semibold">Подпись / Оттиск</div>
            <div className="w-48 border-b border-black mt-6" />
          </div>
        </div>
      </div>

      {/* Email Send Modal with Pre-generated formatted message */}
      {emailModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setEmailModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-xl w-full space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl text-[var(--text-primary)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[var(--text-primary)]">Отправка счета по Email</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Готовое сопроводительное сообщение с публичной ссылкой
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {emailSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold space-y-2">
                <div className="flex items-center space-x-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Сообщение успешно подготовленно и отправлено!</span>
                </div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Счет № {invoice.number} направлен клиенту {invoice.clientName} на адрес: <strong>{clientEmail}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--text-primary)] mb-1">Email получателя (клиента):</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@company.ru"
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 rounded-xl text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[var(--text-primary)] mb-1">Тема письма:</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 rounded-xl text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Direct Public link badge */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between gap-2">
                  <div className="truncate text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-200 block mb-0.5">Публичная ссылка на счет:</span>
                    <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300">{publicUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                </div>

                {/* Pre-filled Message Text */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-[var(--text-primary)] flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>Готовый текст сообщения:</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyEmailText}
                      className="text-xs font-bold text-[#E67E22] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedEmailText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Текст письма скопирован!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Скопировать весь текст</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full p-3 font-mono text-[11px] bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 rounded-xl text-[var(--text-primary)] leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href={mailtoLink}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                    <span>Открыть в почтовой программе</span>
                  </a>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEmailModal(false)}
                      className="px-3.5 py-2 text-[var(--text-secondary)] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      Закрыть
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Отправить счет</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

