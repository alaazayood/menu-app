// يبني رسالة طلب مرتبة ويرجع رابط واتساب جاهز للإرسال
export function buildWhatsappLink(order, tenant) {
  const cur = tenant.business.currency || 'SAR'
  const lines = []

  lines.push(`${tenant.brand.name_ar} - طلب جديد`, '')

  for (const it of order.items) {
    const opts = it.options?.length ? ` (${it.options.join(', ')})` : ''
    const line = `- ${it.name}${opts} ×${it.qty} = ${it.unitPrice * it.qty} ${cur}`
    lines.push(line)
  }

  lines.push(
    '',
    `الإجمالي الفرعي: ${order.subtotal} ${cur}`,
    ...(order.delivery ? [`التوصيل: ${order.delivery} ${cur}`] : []),
    ...(order.tax ? [`الضريبة: ${order.tax} ${cur}`] : []),
    `الإجمالي النهائي: ${order.total} ${cur}`,
    '',
    'الاسم: ———',
    'الموقع: ———',
    'ملاحظة: ———',
  )

  const text = encodeURIComponent(lines.join('\n'))
  const phone = (tenant.contact.whatsapp_e164 || '').replace('+', '')
  return `https://wa.me/${phone}?text=${text}`
}
