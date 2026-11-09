// Kimlik katmanı: pilot servisi kullanıcıyı yalnız bu modül üzerinden okur.
// Varsayılan başlıklar mevcut barındırma ağ geçidinindir. Başka bir ağ geçidi
// (ör. Cloudflare Access, kendi OAuth proxy'niz) kullanılacaksa Worker ortamında
// AUTH_USER_ID_HEADER ve AUTH_EMAIL_HEADER değişkenlerini tanımlamanız yeterlidir.
// Ağ geçidi istemciden gelen aynı adlı başlıkları silip kendi doğruladığı değerleri eklemelidir.
export const DEFAULT_HEADERS = {
  id: 'oai-authenticated-user-id',
  email: 'oai-authenticated-user-email',
};

export function identityHeaders(env = {}) {
  return {
    id: env.AUTH_USER_ID_HEADER?.trim().toLowerCase() || DEFAULT_HEADERS.id,
    email: env.AUTH_EMAIL_HEADER?.trim().toLowerCase() || DEFAULT_HEADERS.email,
  };
}

/** Doğrulanmış kullanıcıyı döndürür; giriş yoksa null. */
export function readIdentity(request, env) {
  const names = identityHeaders(env);
  const id = request.headers.get(names.id),
    email = request.headers.get(names.email);
  return id && email ? { id, email } : null;
}
