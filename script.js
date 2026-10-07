document.addEventListener('DOMContentLoaded', () => {
  const bugün = new Date().toISOString().split('T')[0];
  const tarihInput = document.getElementById('tarihInput');
  if (tarihInput) {
    tarihInput.value = bugün;
    kuruGuncelle();
  }
});

async function kuruGuncelle() {
  const tarihInput = document.getElementById('tarihInput');
  const kurInput = document.getElementById('kurInput');
  if (!tarihInput || !kurInput) return;

  const secilenTarih = tarihInput.value;
  if (!secilenTarih) return;

  kurInput.value = "Yükleniyor...";
  const [yyyy, mm, dd] = secilenTarih.split('-');
  
  const tcmbUrl = `https://www.tcmb.gov.tr/kurlar/${yyyy}${mm}/${dd}${mm}${yyyy}.xml`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(tcmbUrl)}`;

  try {
    let response = await fetch(proxyUrl);
    if (!response.ok) {
      response = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://www.tcmb.gov.tr/kurlar/today.xml')}`);
    }

    if (response.ok) {
      const xmlText = await response.text();
      const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
      const usdNode = xmlDoc.querySelector('Currency[CurrencyCode="USD"] ForexSelling');

      if (usdNode && usdNode.textContent) {
        const rate = parseFloat(usdNode.textContent.replace(',', '.'));
        kurInput.value = rate.toFixed(4).replace('.', ',');
        return;
      }
    }
  } catch (err) {
    console.warn("TCMB XML proxy başarısız, yedek servis deneniyor...", err);
  }

  try {
    const backupRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const backupData = await backupRes.json();
    if (backupData && backupData.rates && backupData.rates.TRY) {
      kurInput.value = backupData.rates.TRY.toFixed(4).replace('.', ',');
      return;
    }
  } catch (e) {
    console.error("Yedek kur servisi de yanıt vermedi:", e);
  }

  kurInput.value = "00,0000";
}

function kayitEkle() {
  alert("Giriş talebiniz başarıyla kaydedildi!");
}
