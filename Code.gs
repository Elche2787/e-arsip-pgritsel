// Backend Arsip Surat PGRI Tesel — deploy sebagai Web App (Execute as: Me, Access: Anyone)
// Username & password diisi di Project Settings > Script Properties: APP_USER dan APP_PASS
const SS_ID = '1HtFZkob_PJmToEsizaxZv8c87SnchXTHL9KBZ2uz_a4';
const F_IN  = '1I-1R6k3DW5ad0w5XDU5u8Q2kZqsEcrXI';
const F_OUT = '1k-3fwaJ7dcfAOX5p5N8S7M5Vt9ZL-cvC';
const H_IN  = ['ID','Tgl Input','No Surat','Tgl Surat','Asal Surat','Perihal','FileId','FileUrl'];
const H_OUT = ['ID','Tgl Input','No Surat','Jenis','Tgl Surat','Tujuan','Perihal','FileId','FileUrl'];

function doPost(e) {
  let r;
  try { r = route(JSON.parse(e.postData.contents)); }
  catch (err) { r = { ok: false, msg: String(err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput('Arsip Surat PGRI Tesel aktif'); }

function route(d) {
  const P = PropertiesService.getScriptProperties(), C = CacheService.getScriptCache();
  if (d.action === 'login') {
    if (d.u && d.u === P.getProperty('APP_USER') && d.p === P.getProperty('APP_PASS')) {
      const t = Utilities.getUuid(); C.put('t_' + t, '1', 21600);
      return { ok: true, token: t };
    }
    return { ok: false, msg: 'Username atau password salah' };
  }
  if (!d.token || !C.get('t_' + d.token)) return { ok: false, auth: true, msg: 'Sesi berakhir, silakan masuk kembali' };

  if (d.action === 'list')   return { ok: true, masuk: rows('SuratMasuk', H_IN), keluar: rows('SuratKeluar', H_OUT) };
  if (d.action === 'nextNo') return { ok: true, seq: nextSeq(d.jenis, d.tahun) };

  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (d.action === 'saveIn') {
      const f = upload(d.file, F_IN);
      sheet('SuratMasuk', H_IN).appendRow([Utilities.getUuid(), new Date(), "'" + d.no, d.tgl, d.asal, d.perihal, f.id, f.url]);
      return { ok: true };
    }
    if (d.action === 'saveOut') {
      if (rows('SuratKeluar', H_OUT).some(r => String(r['No Surat']) === d.no)) return { ok: false, msg: 'Nomor surat sudah terpakai, ambil nomor baru' };
      const f = upload(d.file, F_OUT);
      sheet('SuratKeluar', H_OUT).appendRow([Utilities.getUuid(), new Date(), "'" + d.no, d.jenis, d.tgl, d.tujuan, d.perihal, f.id, f.url]);
      return { ok: true };
    }
  } finally { lock.releaseLock(); }
  return { ok: false, msg: 'Aksi tidak dikenal' };
}

function sheet(name, head) {
  const ss = SpreadsheetApp.openById(SS_ID);
  let s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); s.appendRow(head); s.setFrozenRows(1); }
  return s;
}
function rows(name, head) {
  const v = sheet(name, head).getDataRange().getDisplayValues(); v.shift();
  return v.map(r => { const o = {}; head.forEach((h, i) => o[h] = r[i]); return o; }).reverse();
}
function nextSeq(jenis, tahun) {
  let max = 0;
  rows('SuratKeluar', H_OUT).forEach(r => {
    const p = String(r['No Surat']).replace(/^'/, '').split('/');
    if (p[1] === jenis && p[4] === String(tahun)) max = Math.max(max, parseInt(p[0], 10) || 0);
  });
  return max + 1;
}
function upload(file, folderId) {
  if (!file) return { id: '', url: '' };
  const blob = Utilities.newBlob(Utilities.base64Decode(file.data), file.type, file.name);
  const f = DriveApp.getFolderById(folderId).createFile(blob);
  return { id: f.getId(), url: f.getUrl() };
}
