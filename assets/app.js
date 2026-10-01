/* Além do Voto 1.3 — loader modular. Mantém compatibilidade com index.html e file://. */
(()=>{
  const base=(document.currentScript?.src||'').replace(/app\.js(?:\?.*)?$/,'');
  const files=['app-01.js','app-02.js','app-03.js','app-04.js','app-05.js','app-06.js','app-07.js','app-08.js'];
  document.write(files.map(f=>'<script src="'+base+f+'"><\/script>').join(''));
})();
