/* Rasm tanlash va kichraytirish (admin sahifalar uchun) */
(function () {
  var MAX_COUNT = 5, MAX_TOTAL = 600 * 1024, MAX_W = 700;

  function injectCss() {
    if (document.getElementById("imgt-css")) return;
    var s = document.createElement("style");
    s.id = "imgt-css";
    s.textContent =
      ".imgt-box{margin:12px 0}" +
      ".imgt-btn{display:block;text-align:center;padding:12px;border:2px dashed #ffd700;color:#ffd700;border-radius:12px;font-weight:600;cursor:pointer;font-size:13px}" +
      ".imgt-info{font-size:11px;opacity:.7;margin:6px 2px;color:#fff}" +
      ".imgt-list{display:flex;flex-wrap:wrap;gap:10px}" +
      ".imgt-item{position:relative;width:96px;height:96px;border-radius:10px;overflow:hidden;background:#fff}" +
      ".imgt-item img{width:100%;height:100%;object-fit:contain}" +
      ".imgt-x{position:absolute;top:3px;right:3px;width:24px;height:24px;border:0;border-radius:50%;background:#e74c3c;color:#fff;font-weight:bold;cursor:pointer}";
    document.head.appendChild(s);
  }

  function loadImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res(im); };
      im.onerror = function () { rej(new Error("Rasm ochilmadi")); };
      im.src = u;
    });
  }

  async function compress(file) {
    var im = await loadImg(file);
    var w = im.naturalWidth, h = im.naturalHeight;
    if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(im, 0, 0, w, h);
    var out = c.toDataURL("image/webp", 0.8);
    if (out.indexOf("data:image/webp") !== 0) out = c.toDataURL("image/jpeg", 0.78);
    return out;
  }

  function mount(root, initial) {
    injectCss();
    var imgs = (initial || []).filter(function (x) { return typeof x === "string"; });
    root.innerHTML =
      '<div class="imgt-box"><label class="imgt-btn">🖼 Rasm / jadval / grafik qo\'shish' +
      '<input type="file" accept="image/*" multiple hidden></label>' +
      '<div class="imgt-info"></div><div class="imgt-list"></div></div>';
    var input = root.querySelector("input"),
        info = root.querySelector(".imgt-info"),
        list = root.querySelector(".imgt-list");

    function total() { return imgs.reduce(function (a, b) { return a + b.length; }, 0); }

    function draw() {
      list.innerHTML = "";
      imgs.forEach(function (src, i) {
        var d = document.createElement("div"); d.className = "imgt-item";
        var im = document.createElement("img"); im.src = src;
        var x = document.createElement("button"); x.type = "button"; x.className = "imgt-x"; x.textContent = "✕";
        x.onclick = function () { imgs.splice(i, 1); draw(); };
        d.appendChild(im); d.appendChild(x); list.appendChild(d);
      });
      info.textContent = imgs.length + "/" + MAX_COUNT + " ta rasm, " + Math.round(total() / 1024) + " KB / " + Math.round(MAX_TOTAL / 1024) + " KB";
    }

    input.addEventListener("change", async function () {
      var files = Array.prototype.slice.call(input.files || []);
      for (var k = 0; k < files.length; k++) {
        if (imgs.length >= MAX_COUNT) { alert("Bitta savolga ko'pi bilan " + MAX_COUNT + " ta rasm."); break; }
        try {
          var data = await compress(files[k]);
          if (total() + data.length > MAX_TOTAL) { alert("Rasmlar hajmi oshib ketdi (" + Math.round(MAX_TOTAL / 1024) + " KB). Kichikroq rasm tanlang."); break; }
          imgs.push(data);
        } catch (e) { alert("Rasmni o'qib bo'lmadi: " + e.message); }
      }
      input.value = "";
      draw();
    });

    draw();
    return {
      get: function () { return imgs.slice(); },
      clear: function () { imgs = []; draw(); }
    };
  }

  window.ImgTools = { mount: mount, compress: compress };
})();
