/**
 * Tests de seguridad automatizados contra el backend real, corriendo en
 * http://localhost:4000. Complementa a OWASP ZAP con pruebas específicas
 * del dominio de esta app (auth, rate limiting, inyección, autorización).
 *
 * Requisitos: el backend debe estar corriendo (npm start en /backend).
 * Uso:
 *   npm install
 *   node tests_seguridad.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

let fallos = 0;
let pasados = 0;

function assert(cond, msg) {
  if (cond) {
    console.log('  OK   -', msg);
    pasados++;
  } else {
    console.log('  FALLO -', msg);
    fallos++;
  }
}

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  return { status: res.status, data };
}

async function main() {
  console.log(`\nCorriendo tests de seguridad contra ${BASE_URL}\n`);

  // Salud básica
  let r = await req('GET', '/api/health');
  if (r.status !== 200) {
    console.error('El backend no responde. ¿Está corriendo con npm start?');
    process.exit(1);
  }

  const emailUnico = `sectest_${Date.now()}@test.com`;

  console.log('== 1. Inyección SQL en login ==');
  r = await req('POST', '/api/auth/login', {
    email: "' OR '1'='1",
    password: "' OR '1'='1",
  });
  assert(r.status === 400 || r.status === 401, 'payload de SQLi clásico en login no autentica (esperado 400/401)');

  console.log('\n== 2. Inyección SQL en filtro de query params ==');
  r = await req('GET', "/api/reportes?distrito=" + encodeURIComponent("x' OR '1'='1"));
  assert(r.status === 200 && Array.isArray(r.data), 'query con intento de SQLi no rompe el endpoint ni causa error 500');

  console.log('\n== 3. XSS almacenado en título de reporte ==');
  r = await req('POST', '/api/auth/register', {
    nombre: 'Sec Test',
    email: emailUnico,
    password: 'clave1234',
  });
  const token = r.data?.token;
  assert(!!token, 'registro para pruebas de seguridad exitoso');

  const payloadXSS = '<script>alert("xss")</script>';
  r = await req('POST', '/api/reportes', {
    titulo: payloadXSS,
    categoriaId: 1,
    distrito: 'TestDistrito',
    latitud: -12.1,
    longitud: -77.0,
  }, token);
  // El backend no necesita "limpiar" el string (eso es responsabilidad del
  // frontend al renderizar), pero si lo hace, lo marcamos informativamente.
  const guardadoSinEscape = r.data?.titulo === payloadXSS;
  console.log(`  INFO - el backend ${guardadoSinEscape ? 'guarda el string tal cual (esperado)' : 'modificó el string'}; el frontend (React) debe escaparlo al renderizar — ver docs/web`);

  console.log('\n== 4. Fuerza bruta / rate limiting en login ==');
  let bloqueado = false;
  for (let i = 0; i < 7; i++) {
    r = await req('POST', '/api/auth/login', { email: emailUnico, password: 'incorrecta' });
    if (r.status === 429) { bloqueado = true; break; }
  }
  assert(bloqueado, 'después de varios intentos fallidos, el login se bloquea con 429 (rate limit)');

  console.log('\n== 5. Acceso a ruta protegida sin token ==');
  r = await req('GET', '/api/auth/me');
  assert(r.status === 401, 'GET /api/auth/me sin token responde 401');

  console.log('\n== 6. Token manipulado / inválido ==');
  r = await req('GET', '/api/auth/me', null, token.slice(0, -5) + 'XXXXX');
  assert(r.status === 401, 'token con firma alterada es rechazado (401)');

  console.log('\n== 7. Escalación de privilegios (ciudadano intenta verificar reporte) ==');
  r = await req('POST', '/api/reportes', {
    titulo: 'Reporte para test de privilegios',
    categoriaId: 1,
    distrito: 'TestDistrito',
    latitud: -12.1,
    longitud: -77.0,
  }, token);
  const reporteId = r.data?.id;
  r = await req('PATCH', `/api/reportes/${reporteId}/verificar`, null, token);
  assert(r.status === 403, 'usuario sin rol moderador no puede verificar reportes (403)');

  console.log('\n== 8. Validación de rangos geográficos ==');
  r = await req('POST', '/api/reportes', {
    titulo: 'Coordenadas inválidas',
    categoriaId: 1,
    distrito: 'TestDistrito',
    latitud: 500,
    longitud: -77.0,
  }, token);
  assert(r.status === 400, 'latitud fuera de rango físico es rechazada (400)');

  console.log('\n== 9. Política de contraseñas débiles ==');
  r = await req('POST', '/api/auth/register', {
    nombre: 'Password Debil',
    email: `debil_${Date.now()}@test.com`,
    password: '123',
  });
  assert(r.status === 400, 'password débil (sin cumplir política) es rechazada en registro');

  console.log('\n== 10. Enumeración de usuarios vía mensaje de error ==');
  const rNoExiste = await req('POST', '/api/auth/login', { email: 'no_existe_xyz@test.com', password: 'cualquiera1' });
  const rExisteMalPass = await req('POST', '/api/auth/login', { email: emailUnico, password: 'cualquiera1' });
  assert(
    rNoExiste.data?.error === rExisteMalPass.data?.error,
    'el mensaje de error es idéntico si el email no existe o si la password es incorrecta (previene enumeración)'
  );

  console.log(`\n=== RESUMEN: ${pasados} pasaron, ${fallos} fallaron ===\n`);
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Error corriendo tests de seguridad:', err.message);
  process.exit(1);
});
