import { Invoice, TaxCalculationResult, UserProfile, CurrencyCode } from '../types';
import { formatCurrency, CURRENCY_SYMBOLS } from './numberToWordsRu';

interface GenerateTaxReportParams {
  taxData: TaxCalculationResult;
  invoices: Invoice[];
  userProfile: UserProfile;
  activeCurrency?: CurrencyCode;
  periodYear?: number;
}

/**
 * Generates and downloads or prints a detailed Self-Employed NPD Tax Report (PDF / Printable Sheet)
 */
export const generateTaxReportPdf = async ({
  taxData,
  invoices,
  userProfile,
  activeCurrency = 'RUB',
  periodYear = 2026
}: GenerateTaxReportParams): Promise<void> => {
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const issuedInvoices = invoices.filter((i) => i.status === 'issued' || i.status === 'sent');
  const totalPaidRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const totalLegalRevenue = paidInvoices
    .filter((i) => i.clientType === 'legal')
    .reduce((sum, i) => sum + (i.total || 0), 0);
  const totalIndivRevenue = paidInvoices
    .filter((i) => i.clientType === 'individual')
    .reduce((sum, i) => sum + (i.total || 0), 0);

  const taxLegal = Math.round(totalLegalRevenue * 0.06);
  const taxIndiv = Math.round(totalIndivRevenue * 0.04);
  const totalCalculatedTax = taxLegal + taxIndiv;
  const deductionUsed = Math.min(10000, Math.round(totalIndivRevenue * 0.01 + totalLegalRevenue * 0.02));
  const finalTaxPayable = Math.max(0, totalCalculatedTax - deductionUsed);

  // Create printable iframe or new window for 100% reliable Cyrillic PDF export & print
  const reportHtml = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="utf-8">
      <title>Налоговый отчет НПД ${periodYear} - ${userProfile.fullName || 'Самозанятый'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 20px;
          font-size: 13px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #E67E22;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 20px;
          font-weight: 900;
          color: #1E293B;
          margin: 0 0 4px 0;
        }
        .subtitle {
          font-size: 12px;
          color: #64748B;
          margin: 0;
        }
        .badge {
          background-color: #E67E22;
          color: #FFFFFF !important;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
          display: inline-block;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .card {
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 14px;
          background-color: #F8FAFC;
        }
        .card-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          margin-bottom: 8px;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 4px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .stat-label {
          color: #64748B;
        }
        .stat-value {
          font-weight: 700;
          color: #0F172A;
        }
        .highlight-box {
          background: linear-gradient(135deg, #1E293B 0%, #2C3E50 100%);
          color: #FFFFFF !important;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .highlight-box * {
          color: #FFFFFF !important;
        }
        .highlight-title {
          font-size: 12px;
          color: #94A3B8 !important;
          margin-bottom: 4px;
        }
        .highlight-amount {
          font-size: 24px;
          font-weight: 900;
          color: #F59E0B !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 11px;
        }
        th {
          background-color: #1E293B;
          color: #FFFFFF !important;
          text-align: left;
          padding: 8px 10px;
          font-weight: 700;
          border: 1px solid #1E293B;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #E2E8F0;
        }
        tr:nth-child(even) td {
          background-color: #F8FAFC;
        }
        .text-right {
          text-align: right;
        }
        .footer {
          margin-top: 30px;
          padding-top: 14px;
          border-top: 1px solid #E2E8F0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748B;
        }
        .stamp-box {
          text-align: right;
          font-style: italic;
        }
        .status-pill {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
        }
        .pill-paid {
          background-color: #D1FAE5;
          color: #065F46;
        }
        .pill-issued {
          background-color: #FEF3C7;
          color: #92400E;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="badge">НАЛОГОВЫЙ ОТЧЕТ (НПД)</div>
          <h1 class="title" style="margin-top: 8px;">Сводная ведомость доходов и налога</h1>
          <p class="subtitle">Отчетный период: 01.01.${periodYear} — 31.12.${periodYear} • ФНС РФ (ФЗ № 422-ФЗ)</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; font-weight: 800; color: #1E293B;">Дата формирования:</div>
          <div style="font-size: 13px; font-weight: 700; color: #E67E22;">${new Date().toLocaleDateString('ru-RU')}</div>
        </div>
      </div>

      <!-- User & Tax Profile Grid -->
      <div class="grid-2">
        <div class="card">
          <div class="card-title">Сведения о налогоплательщике</div>
          <div class="stat-row">
            <span class="stat-label">ФИО:</span>
            <span class="stat-value">${userProfile.fullName || 'Не указано'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">ИНН:</span>
            <span class="stat-value font-mono">${userProfile.inn || 'Не указан'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Специализация:</span>
            <span class="stat-value">${userProfile.occupation || 'Самозанятый'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Регион деятельности:</span>
            <span class="stat-value">${userProfile.region || userProfile.city || 'г. Москва (77)'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Телефон / Email:</span>
            <span class="stat-value">${userProfile.phone || '-'} / ${userProfile.email || '-'}</span>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Сводные налоговые показатели (${periodYear})</div>
          <div class="stat-row">
            <span class="stat-label">Всего доходов получено:</span>
            <span class="stat-value" style="color: #059669;">${formatCurrency(totalPaidRevenue, activeCurrency)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">От физических лиц (4%):</span>
            <span class="stat-value">${formatCurrency(totalIndivRevenue, activeCurrency)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">От юрлиц и ИП (6%):</span>
            <span class="stat-value">${formatCurrency(totalLegalRevenue, activeCurrency)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Лимит НПД (2.4 млн ₽):</span>
            <span class="stat-value">Использовано ${Math.min(100, Math.round((totalPaidRevenue / 2400000) * 100))}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Остаток лимита в ${periodYear} г.:</span>
            <span class="stat-value">${formatCurrency(Math.max(0, 2400000 - totalPaidRevenue), activeCurrency)}</span>
          </div>
        </div>
      </div>

      <!-- Key Highlight Banner -->
      <div class="highlight-box">
        <div>
          <div class="highlight-title">ИТОГОВЫЙ НАЛОГ К УПЛАТЕ ЗА ПЕРИОД</div>
          <div style="font-size: 11px; opacity: 0.9;">
            Базовый налог: ${formatCurrency(totalCalculatedTax, activeCurrency)} • Вычет (скидка): -${formatCurrency(deductionUsed, activeCurrency)}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="highlight-amount">${formatCurrency(finalTaxPayable, activeCurrency)}</div>
          <div style="font-size: 10px; color: #94A3B8 !important;">Срок оплаты: до 28 числа след. месяца</div>
        </div>
      </div>

      <!-- Invoices Summary Table -->
      <div style="margin-bottom: 8px;">
        <h3 style="font-size: 13px; font-weight: 800; color: #1E293B; margin: 0 0 6px 0;">
          Реестр счетов и налоговых поступлений (${invoices.length} счетов)
        </h3>
      </div>

      <table>
        <thead>
          <tr>
            <th>№ Счета</th>
            <th>Дата</th>
            <th>Контрагент (Клиент)</th>
            <th>Тип</th>
            <th class="text-right">Сумма (${CURRENCY_SYMBOLS[activeCurrency]})</th>
            <th class="text-right">Ставка</th>
            <th class="text-right">Налог</th>
            <th style="text-align: center;">Статус</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.map((inv) => {
            const isLegal = inv.clientType === 'legal';
            const rate = isLegal ? 6 : 4;
            const tax = Math.round((inv.total || 0) * (rate / 100));
            const isPaid = inv.status === 'paid';
            return `
              <tr>
                <td style="font-weight: 700; font-family: monospace;">${inv.number}</td>
                <td>${inv.date}</td>
                <td style="font-weight: 600;">${inv.clientName || 'Без имени'}</td>
                <td>${isLegal ? 'Юрлицо/ИП' : 'Физлицо'}</td>
                <td class="text-right" style="font-weight: 700;">${formatCurrency(inv.total || 0, activeCurrency)}</td>
                <td class="text-right">${rate}%</td>
                <td class="text-right" style="font-weight: 700; color: #E67E22;">${formatCurrency(tax, activeCurrency)}</td>
                <td style="text-align: center;">
                  <span class="status-pill ${isPaid ? 'pill-paid' : 'pill-issued'}">
                    ${isPaid ? 'Оплачен' : 'Выставлен'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #F1F5F9; font-weight: 800;">
            <td colspan="4" style="text-align: right; padding: 10px;">ИТОГО ПО РЕЕСТРУ:</td>
            <td class="text-right" style="color: #059669; font-size: 12px; padding: 10px;">
              ${formatCurrency(invoices.reduce((s, i) => s + (i.total || 0), 0), activeCurrency)}
            </td>
            <td></td>
            <td class="text-right" style="color: #E67E22; font-size: 12px; padding: 10px;">
              ${formatCurrency(invoices.reduce((s, i) => s + Math.round((i.total || 0) * ((i.clientType === 'legal' ? 6 : 4) / 100)), 0), activeCurrency)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <!-- Footer Signatures -->
      <div class="footer">
        <div>
          <div>Документ сгенерирован в сервисе <strong>«НПД Умный Органайзер»</strong></div>
          <div style="font-size: 10px; margin-top: 2px;">Соответствует нормам ст. 10 Федерального закона от 27.11.2018 N 422-ФЗ</div>
        </div>
        <div class="stamp-box">
          <div>Самозанятый: ________________ / ${userProfile.fullName || 'Подпись'}</div>
          <div style="font-size: 10px; margin-top: 2px;">М.П. (при наличии)</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Print via isolated iframe
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(reportHtml);
    doc.close();

    // Give browser time to layout fonts and styles before triggering print/save as PDF dialog
    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 2000);
    }, 400);
  }
};
