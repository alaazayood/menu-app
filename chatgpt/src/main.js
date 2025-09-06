// src/composables/useTenant.js
import { ref } from 'vue'

const tenant = ref(null)
const loading = ref(false)
const error = ref(null)

function resolveTenantId() {
  const host = window.location.hostname.split('.')
  if (host.length > 2 && host[0] && host[0] !== 'www') return host[0]
  const seg = window.location.pathname.split('/').filter(Boolean)[0]
  return seg || 'default'
}

export async function loadTenant(explicitId) {
  loading.value = true
  error.value = null
  try {
    const id = explicitId || resolveTenantId()
    const res = await fetch(`/tenants/${id}.json`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Tenant ${id} not found`)
    tenant.value = await res.json()
  } catch (e) {
    error.value = e.message || 'Failed to load tenant'
  } finally {
    loading.value = false
  }
}

export function useTenant() {
  return { tenant, loading, error, loadTenant }
}
