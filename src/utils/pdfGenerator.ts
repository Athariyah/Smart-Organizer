import { jsPDF } from 'jspdf';
import { Invoice, UserProfile } from '../types';
import { numberToWordsRu, formatCurrency, formatDateRu } from './numberToWordsRu';

export function generateInvoicePDF(invoice: Invoice, userProfile?: UserProfile): void {
  const profile: UserProfile = userProfile || {
    id: 'usr_default',
    fullName: 'Самозанятый Пользователь',
    occupation: 'Специалист',
    email: 'user@example.com',
    inn: '770000000000',
    phone: '+7 (900) 000-00-00',
    profession: 'freelancer' as const,
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
      nextNumber: 1,
      logoUrl: undefined
    }
  };
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Fonts & styling setup
  // Note: Standard jsPDF default font handles basic Latin. For Cyrillic text in PDF, we can render structured vector layout with custom fallback or clean SVG/canvas export, or styled A4 HTML print layout window.
  // To guarantee 100% beautiful Cyrillic typography rendering without font corruption in jsPDF, we generate a high-precision print-ready window with instant download option!

  const itemsRows = (invoice.items || []).map((item, idx) => `
    <tr>
      <td style="text-align: center; border: 1px solid #CBD5E1; padding: 8px;">${idx + 1}</td>
      <td style="border: 1px solid #CBD5E1; padding: 8px;">${item.description || ''}</td>
      <td style="text-align: center; border: 1px solid #CBD5E1; padding: 8px;">${item.quantity || 1}</td>
      <td style="text-align: center; border: 1px solid #CBD5E1; padding: 8px;">шт.</td>
      <td style="text-align: right; border: 1px solid #CBD5E1; padding: 8px;">${(item.unitPrice || 0).toLocaleString('ru-RU')} ₽</td>
      <td style="text-align: right; border: 1px solid #CBD5E1; padding: 8px; font-weight: 600;">${(item.total || 0).toLocaleString('ru-RU')} ₽</td>
    </tr>
  `).join('');

  const totalWords = numberToWordsRu(invoice.total);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Счет на оплату № ${invoice.number}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1E293B;
          margin: 0;
          padding: 40px;
          background-color: #ffffff;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          border: 1px solid #E2E8F0;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .header-table td {
          border: 1px solid #94A3B8;
          padding: 8px;
          font-size: 13px;
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          margin-top: 25px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #2C3E50;
          color: #2C3E50;
        }
        .party-info {
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.6;
        }
        .party-info strong {
          color: #0F172A;
          width: 120px;
          display: inline-block;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 14px;
        }
        .items-table th {
          background-color: #2C3E50;
          color: #ffffff;
          border: 1px solid #2C3E50;
          padding: 10px;
          font-weight: 600;
        }
        .totals-table {
          width: 320px;
          margin-left: auto;
          margin-top: 15px;
          border-collapse: collapse;
          font-size: 14px;
        }
        .totals-table td {
          padding: 6px 12px;
        }
        .words-total {
          margin-top: 25px;
          padding: 12px;
          background-color: #F8FAFC;
          border-left: 4px solid #E67E22;
          font-size: 14px;
        }
        .stamp-box {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .signature-line {
          width: 200px;
          border-bottom: 1px solid #64748B;
          margin-top: 30px;
          display: inline-block;
        }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: center;">
        <button onclick="window.print()" style="background: #2C3E50; color: white; border: none; padding: 10px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; margin-right: 10px;">
          🖨️ Распечатать / Сохранить в PDF
        </button>

        <button onclick="window.close()" style="background: #E2E8F0; color: #1E293B; border: none; padding: 10px 20px; font-size: 16px; border-radius: 6px; cursor: pointer;">
          Закрыть
        </button>
      </div>

      <div class="invoice-box">
        <!-- Brand Logo & Top Header -->
        ${profile.invoiceSettings?.logoUrl ? `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${profile.invoiceSettings.logoUrl}" alt="Логотип style"="width: 48px; height: 48px; border-radius: 10px; object-fit: cover;" />
            <div>
              <div style="font-size: 16px; font-weight: 800; color: #1E293B;">${profile.fullName}</div>
              <div style="font-size: 12px; color: #64748B; font-weight: 600;">Плательщик налога на профессиональный доход (НПД)</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748B;">
            <div>ИНН: <strong style="color: #0F172A;">${profile.inn}</strong></div>
            <div>Тел: ${profile.phone}</div>
          </div>
        </div>
        ` : ''}

        <!-- Банковские реквизиты -->
        <table class="header-table">
          <tr>
            <td colspan="2" rowspan="2" style="width: 50%; vertical-align: top;">
              <strong>${profile.bankDetails.bankName || 'Банк Исполнителя'}</strong><br>
              <span style="font-size: 11px; color: #64748B;">Банк получателя</span>
            </td>
            <td style="width: 15%;">БИК</td>
            <td style="width: 35%;">${profile.bankDetails.bik || '—'}</td>
          </tr>
          <tr>
            <td>Сч. №</td>
            <td>${profile.bankDetails.corrAccount || '—'}</td>
          </tr>
          <tr>
            <td>ИНН ${profile.inn}</td>
            <td>КПП —</td>
            <td rowspan="2">Сч. №</td>
            <td rowspan="2">${profile.bankDetails.accountNumber || '—'}</td>
          </tr>
          <tr>
            <td colspan="2">
              <strong>${profile.fullName} (Самозанятый)</strong><br>
              <span style="font-size: 11px; color: #64748B;">Получатель</span>
            </td>
          </tr>
        </table>

        <!-- Название счета -->
        <div class="title">
          СЧЕТ НА ОПЛАТУ № ${invoice.number} от ${formatDateRu(invoice.date)} г.
        </div>

        <!-- Стороны -->
        <div class="party-info">
          <div><strong>Исполнитель:</strong> ${profile.fullName}, ИНН ${profile.inn}, тел. ${profile.phone}, e-mail: ${profile.email}</div>
          <div style="margin-top: 8px;"><strong>{t('auto.ext.859')}</strong> ${invoice.clientName} ${invoice.clientInn ? `, ИНН ${invoice.clientInn}` : ''} ${invoice.clientEmail ? `, e-mail: ${invoice.clientEmail}` : ''}</div>
        </div>

        <!-- Таблица услуг -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 5%;">№</th>
              <th style="width: 50%;">Наименование работы (услуги)</th>
              <th style="width: 10%;">Кол-во</th>
              <th style="width: 10%;">Ед.</th>
              <th style="width: 12.5%;">Цена</th>
              <th style="width: 12.5%;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Итоги -->
        <table class="totals-table">
          <tr>
            <td style="text-align: right; font-weight: 600;">Итого:</td>
            <td style="text-align: right; font-weight: 600;">${invoice.subtotal.toLocaleString('ru-RU')} ₽</td>
          </tr>
          <tr>
            <td style="text-align: right; color: #64748B;">Без НДС (НПД):</td>
            <td style="text-align: right; color: #64748B;">—</td>
          </tr>
          <tr>
            <td style="text-align: right; font-size: 16px; font-weight: 700; color: #2C3E50;">Всего к оплате:</td>
            <td style="text-align: right; font-size: 16px; font-weight: 700; color: #2C3E50;">${invoice.total.toLocaleString('ru-RU')} ₽</td>
          </tr>
        </table>

        <div class="words-total">
          Всего наименований <strong>${invoice.items.length}</strong>, на сумму <strong>${invoice.total.toLocaleString('ru-RU')} руб.</strong><br>
          <strong>Сумма прописью:</strong> ${totalWords}.
        </div>

        ${invoice.notes ? `
          <div style="margin-top: 15px; font-size: 13px; color: #475569; padding: 10px; background-color: #F1F5F9; border-radius: 6px;">
            <strong>Условия оплаты и примечание:</strong><br>
            ${invoice.notes}
          </div>
        ` : ''}

        <div class="stamp-box">
          <div>
            <div><strong>Исполнитель:</strong> ${profile.fullName}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Плательщик налога на профессиональный доход (НПД)</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #64748B;">Подпись Исполнителя</div>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 500);
      return;
    }
  } catch (err) {
    console.warn('PDF printing iframe fallback:', err);
  }

  // Fallback
  try {
    window.print();
  } catch (err) {
    console.error('Print not available', err);
  }
}
