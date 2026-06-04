export const mockCases = [
  { id: 1, case_number: 'CAS-1042', subject: 'Login Issue', status: 'Open', updated_at: '2 hrs ago' },
  { id: 2, case_number: 'CAS-1041', subject: 'Billing Inquiry', status: 'Pending', updated_at: '1 day ago' },
]

export const mockOrders = [
  { id: 1, order_number: 'ORD-9921', order_date: '2026-05-20', status: 'Processing', total_amount: 1200, currency: 'USD' },
  { id: 2, order_number: 'ORD-9918', order_date: '2026-05-15', status: 'Shipped', total_amount: 450.5, currency: 'USD' },
]

export const mockInvoices = [
  { id: 1, invoice_number: 'INV-1302', status: 'Pending', total_amount: 1400, invoice_date: '2026-05-18', due_date: '2026-06-01', currency: 'USD' },
  { id: 2, invoice_number: 'INV-1298', status: 'Paid', total_amount: 785, invoice_date: '2026-05-10', due_date: '2026-05-25', currency: 'USD' },
]
