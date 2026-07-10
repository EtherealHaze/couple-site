var appData = {};
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/load', false);
      xhr.send();
      if (xhr.status === 200) appData = JSON.parse(xhr.responseText);
    } catch(e) {}
    function apiSavePartial(partialData) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/save', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(partialData));
    }

    // ===== 共享数据 API（代替 localStorage）=====
    var appData = {};
    var dataLoaded = false;

    function loadData(callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/load', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          appData = JSON.parse(xhr.responseText);
          dataLoaded = true;
        }
        if (callback) callback();
      };
      xhr.onerror = function() {
        if (callback) callback();
      };
      xhr.send();
    }

    function apiSavePartial(partialData) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/save', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(partialData));
    }

    var HIS_NAME = '他的名字';
    var HER_NAME = '她的名字';
    var SECRET = '2025年10月5日';
    var SECRET_HINT = '💡 提示：我们在一起的那一天（年月日）';
    var START_DATE = new Date('2025-10-05T00:00:00');

    document.getElementById('nameHis').textContent = HIS_NAME;
    document.getElementById('nameHer').textContent = HER_NAME;

    var overlay = document.getElementById('verifyOverlay');
    var mainContent = document.getElementById('mainContent');
    var step1 = document.getElementById('step1');
    var step2 = document.getElementById('step2');
    var successEl = document.getElementById('verifySuccess');
    var errorEl = document.getElementById('verifyError');
    var secretInput = document.getElementById('secretInput');
    var secretLabel = document.getElementById('secretLabel');

    secretInput.placeholder = SECRET_HINT;

    var verifiedWho = '';

    // ===== Settings Panel =====
    var settingsOverlay = document.getElementById('settingsOverlay');
    var SETTINGS = {};
    if (appData.settings) SETTINGS = appData.settings;

    // Story events data (stored separately)
    var storyEvents = [
      { period: '2023.09.10', title: '初次相遇 ✨', desc: '那天的阳光刚好，我们在某个地方遇见了彼此。' },
      { period: '2023.12.24', title: '第一次约会 🎄', desc: '平安夜，一起走在灯火通明的街上。' },
      { period: '2024.02.14', title: '在一起啦 💕', desc: '情人节这天，我们正式牵起了彼此的手。' },
      { period: '2024.07.15', title: '第一次旅行 🌊', desc: '一起去看海，拍了好多照片。' },
      { period: '今天', title: '故事还在继续... 🌟', desc: '每一天都是新的篇章。' }
    ];
    if (appData.storyEvents && appData.storyEvents.length) storyEvents = appData.storyEvents;

    // Favorites data
    var favData = {
      songs: [
        { name: '想见你想见你想见你 — 八三夭', tag: '💗 她最爱' },
        { name: '关键词 — 林俊杰', tag: '💙 他最爱' },
        { name: '小幸运 — 田馥甄', tag: '🎵 我们的歌' }
      ],
      movies: [
        { name: '你的名字。', tag: '⭐ 第一次一起看' },
        { name: '铃芽之旅', tag: '🎬 电影院' },
        { name: '爱乐之城', tag: '🎵 原声超棒' }
      ],
      food: [
        { name: '火锅', tag: '🔥 每周必吃' },
        { name: '寿司', tag: '🍣 第一次约会' },
        { name: '奶茶', tag: '🧋 她最爱' }
      ],
      places: [
        { name: '日本·京都', tag: '🌸 看樱花' },
        { name: '冰岛', tag: '🌌 看极光' },
        { name: '云南·大理', tag: '☀️ 去有风的地方' }
      ]
    };
    if (appData.favs) favData = appData.favs;

    function applySettings() {
      if (SETTINGS.hisName) { HIS_NAME = SETTINGS.hisName; document.getElementById('nameHis').textContent = HIS_NAME; }
      if (SETTINGS.herName) { HER_NAME = SETTINGS.herName; document.getElementById('nameHer').textContent = HER_NAME; }
      if (SETTINGS.secret) SECRET = SETTINGS.secret;
      if (SETTINGS.hint) SECRET_HINT = SETTINGS.hint;
      if (SETTINGS.anniversary) {
        var d = new Date(SETTINGS.anniversary);
        if (!isNaN(d.getTime())) START_DATE = d;
      }
    }
    applySettings();

    // Render story timeline from data
    function renderStoryTimeline() {
      var timeline = document.getElementById('storyTimeline');
      if (!timeline) return;
      timeline.innerHTML = '';
      var sd = (typeof storyData !== 'undefined' && storyData) ? storyData : [];
      for (var i = 0; i < storyEvents.length; i++) {
        var ev = storyEvents[i];
        var d = sd[i] || {};
        var photos = d.photos || ['','',''];

        var item = document.createElement('div');
        item.className = 'timeline-item';
        item.setAttribute('data-id', i);

        // Main content - always visible & editable
        var html = '';
        html += '<input class="editable-period" id="ev_period_' + i + '" value="' + ev.period.replace(/"/g,'&quot;') + '" style="font-size:0.85rem;color:#e84c6a;font-weight:600;border:none;background:transparent;width:auto;font-family:inherit;outline:none;padding:2px 4px;border-radius:4px;" onfocus="this.style.background=\'#fff\'" onblur="this.style.background=\'transparent\'" />';
        html += '<input class="editable-title" id="ev_title_' + i + '" value="' + ev.title.replace(/"/g,'&quot;') + '" style="display:block;font-size:1.1rem;font-weight:700;border:none;background:transparent;width:100%;font-family:inherit;outline:none;padding:2px 4px;border-radius:4px;margin-bottom:4px;" onfocus="this.style.background=\'#fff\'" onblur="this.style.background=\'transparent\'" />';
        html += '<textarea class="editable-desc" id="ev_desc_' + i + '" rows="2" style="width:100%;font-size:0.93rem;color:#7c5c64;border:none;background:transparent;font-family:inherit;outline:none;padding:2px 4px;border-radius:4px;resize:vertical;" onfocus="this.style.background=\'#fff\'" onblur="this.style.background=\'transparent\'">' + ev.desc.replace(/"/g,'&quot;') + '</textarea>';

        // Expand/collapse button
        html += '<div style="margin-top:8px;">';
        html += '<button class="btn-detail" onclick="toggleDetail(' + i + ')" id="toggleBtn_' + i + '">📸 展开详情</button>';
        html += '</div>';

        // Detail section (collapsed by default)
        html += '<div id="detailSection_' + i + '" style="display:none;margin-top:12px;padding:16px;background:#fff;border-radius:12px;border:1px solid #f3d9df;">';

        // Location
        html += '<div style="margin-bottom:10px;"><input type="text" id="detail_loc_' + i + '" value="' + (d.location||'').replace(/"/g,'&quot;') + '" placeholder="📍 添加地点..." style="width:100%;padding:8px 12px;border:1.5px solid #f3d9df;border-radius:8px;font-size:0.88rem;outline:none;font-family:inherit;" /></div>';

        // Photos
        html += '<div style="margin-bottom:10px;"><div style="font-size:0.85rem;font-weight:600;color:#7c5c64;margin-bottom:6px;">📸 照片</div>';
        html += '<div class="detail-photo-grid" id="dp_grid_' + i + '">';
        for (var p = 0; p < 3; p++) {
          if (photos[p]) {
            html += '<div class="detail-photo-item" onclick="uploadInlinePhoto(' + i + ',' + p + ')"><img src="' + photos[p] + '" alt="" /></div>';
          } else {
            html += '<div class="detail-photo-item" onclick="uploadInlinePhoto(' + i + ',' + p + ')"><div class="add-label">+<br/>添加</div></div>';
          }
        }
        html += '</div></div>';

        // Ratings
        html += '<div style="margin-bottom:10px;">';
        html += '<div class="rating-row"><div class="who">💙 他的评价</div><div class="rating-stars" id="hisStars_' + i + '"></div><textarea class="comment-input" id="hisComment_' + i + '" placeholder="他当时的心情..." rows="2" style="width:100%;border:none;background:#fdf2f4;padding:8px 10px;border-radius:8px;font-size:0.88rem;font-family:inherit;outline:none;resize:none;min-height:36px;">' + (d.hisComment||'').replace(/"/g,'&quot;') + '</textarea></div>';
        html += '<div class="rating-row"><div class="who">💗 她的评价</div><div class="rating-stars" id="herStars_' + i + '"></div><textarea class="comment-input" id="herComment_' + i + '" placeholder="她当时的心情..." rows="2" style="width:100%;border:none;background:#fdf2f4;padding:8px 10px;border-radius:8px;font-size:0.88rem;font-family:inherit;outline:none;resize:none;min-height:36px;">' + (d.herComment||'').replace(/"/g,'&quot;') + '</textarea></div>';
        html += '</div>';

        // Shared note
        html += '<div style="margin-bottom:10px;"><div style="font-size:0.85rem;font-weight:600;color:#7c5c64;margin-bottom:4px;">💞 我们的共同记忆</div>';
        html += '<textarea id="detailNote_' + i + '" placeholder="把你们共同记得的细节写在这里…" rows="2" style="width:100%;border:1.5px solid #f3d9df;border-radius:8px;padding:8px 12px;font-size:0.88rem;font-family:inherit;outline:none;resize:vertical;min-height:50px;">' + (d.note||'').replace(/"/g,'&quot;') + '</textarea></div>';

        // Save button
        html += '<button class="btn" onclick="saveInlineDetail(' + i + ')" style="width:100%;justify-content:center;padding:8px 16px;font-size:0.88rem;">💾 保存</button>';

        html += '</div>'; // end detail section

        item.innerHTML = html;
        timeline.appendChild(item);

        // Render stars after element is in DOM
        renderStarsInline('hisStars_' + i, d.hisRating || 0, i, 'his');
        renderStarsInline('herStars_' + i, d.herRating || 0, i, 'her');
      }
    }

    function renderStarsInline(containerId, count, eventId, who) {
      var c = document.getElementById(containerId);
      if (!c) return;
      c.innerHTML = '';
      for (var i = 1; i <= 5; i++) {
        var s = document.createElement('span');
        s.className = 'star' + (i <= count ? ' on' : '');
        s.textContent = '⭐';
        s.onclick = function(n, cid) { return function() { renderStarsInline(cid, n, eventId, who); }; }(i, containerId);
        c.appendChild(s);
      }
    }

    function toggleDetail(id) {
      var section = document.getElementById('detailSection_' + id);
      var btn = document.getElementById('toggleBtn_' + id);
      if (!section || !btn) return;
      if (section.style.display === 'none') {
        section.style.display = 'block';
        btn.textContent = '🙈 收起详情';
      } else {
        section.style.display = 'none';
        btn.textContent = '📸 展开详情';
      }
    }

    function uploadInlinePhoto(eventId, photoIdx) {
      var grid = document.getElementById('dp_grid_' + eventId);
      if (!grid) return;
      var items = grid.querySelectorAll('.detail-photo-item');
      var el = items[photoIdx];
      if (!el) return;
      if (el.querySelector('img')) {
        el.innerHTML = '<div class="add-label">+<br/>添加</div>';
        return;
      }
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          el.innerHTML = '<img src="'+ev.target.result+'" alt="" />';
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }

    function saveInlineDetail(id) {
      // Save timeline text (period, title, desc)
      var pEl = document.getElementById('ev_period_' + id);
      var tEl = document.getElementById('ev_title_' + id);
      var dEl = document.getElementById('ev_desc_' + id);
      if (pEl && storyEvents[id]) storyEvents[id].period = pEl.value.trim();
      if (tEl && storyEvents[id]) storyEvents[id].title = tEl.value.trim();
      if (dEl && storyEvents[id]) storyEvents[id].desc = dEl.value.trim();
      apiSavePartial({ storyEvents: storyEvents });

      // Save detail data
      var d = storyData[id] || {};
      d.location = document.getElementById('detail_loc_' + id).value.trim();
      var photos = ['','',''];
      var grid = document.getElementById('dp_grid_' + id);
      if (grid) {
        var items = grid.querySelectorAll('.detail-photo-item');
        for (var i = 0; i < 3 && i < items.length; i++) {
          var img = items[i].querySelector('img');
          photos[i] = img ? img.src : '';
        }
      }
      d.photos = photos;
      d.hisRating = (document.querySelectorAll('#hisStars_' + id + ' .star.on') || []).length;
      d.herRating = (document.querySelectorAll('#herStars_' + id + ' .star.on') || []).length;
      d.hisComment = document.getElementById('hisComment_' + id).value.trim();
      d.herComment = document.getElementById('herComment_' + id).value.trim();
      d.note = document.getElementById('detailNote_' + id).value.trim();
      storyData[id] = d;
      saveStoryData();
      triggerConfetti();
    }
    renderStoryTimeline();

    // Render favorites from data
    function renderFavs() {
      var map = { songs: 'favSongs', movies: 'favMovies', food: 'favFood', places: 'favPlaces' };
      for (var key in map) {
        var el = document.getElementById(map[key]);
        if (!el) continue;
        el.innerHTML = '';
        var items = favData[key] || [];
        for (var i = 0; i < items.length; i++) {
          var li = document.createElement('li');
          li.textContent = items[i].name;
          var tag = document.createElement('span');
          tag.className = 'tag';
          tag.textContent = items[i].tag || '💕';
          li.appendChild(tag);
          el.appendChild(li);
        }
      }
    }
    renderFavs();

    function openSettingsPanel() {
      // Fill basic fields
      document.getElementById('setHisName').value = HIS_NAME;
      document.getElementById('setHerName').value = HER_NAME;
      document.getElementById('setSecret').value = SECRET;
      document.getElementById('setHint').value = SECRET_HINT;
      if (START_DATE) {
        var y = START_DATE.getFullYear();
        var m = String(START_DATE.getMonth()+1).padStart(2,'0');
        var d = String(START_DATE.getDate()).padStart(2,'0');
        document.getElementById('setAnniversary').value = y + '-' + m + '-' + d;
      }

      // Build story event fields
      var storyHtml = '';
      for (var i = 0; i < storyEvents.length; i++) {
        var ev = storyEvents[i];
        storyHtml += '<div style="background:#fdf2f4;border-radius:8px;padding:10px 12px;margin-bottom:8px;">';
        storyHtml += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
        storyHtml += '<span style="font-size:0.8rem;font-weight:600;color:#e84c6a;">📅 事件 ' + (i+1) + ' ' + getBadge(i) + '</span>';
        if (i >= 5) {
          storyHtml += '<span onclick="deleteStoryEvent('+i+')" style="font-size:0.75rem;color:#e84c6a;cursor:pointer;">🗑️ 删除</span>';
        }
        storyHtml += '</div>';
        storyHtml += '<input type="text" id="se_period_' + i + '" value="' + ev.period.replace(/"/g,'&quot;') + '" placeholder="日期" style="width:100%;padding:6px 10px;border:1.5px solid #f3d9df;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;margin-bottom:6px;" />';
        storyHtml += '<input type="text" id="se_title_' + i + '" value="' + ev.title.replace(/"/g,'&quot;') + '" placeholder="标题" style="width:100%;padding:6px 10px;border:1.5px solid #f3d9df;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;margin-bottom:6px;" />';
        storyHtml += '<textarea id="se_desc_' + i + '" placeholder="描述" rows="2" style="width:100%;padding:6px 10px;border:1.5px solid #f3d9df;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;resize:vertical;">' + ev.desc.replace(/"/g,'&quot;') + '</textarea>';
        storyHtml += '</div>';
      }
      storyHtml += '<div style="text-align:center;margin-top:8px;"><button onclick="addStoryEvent()" style="padding:8px 20px;border:1.5px dashed #e84c6a;border-radius:10px;background:transparent;color:#e84c6a;font-size:0.85rem;cursor:pointer;font-family:inherit;">➕ 新增事件</button></div>';
      document.getElementById('storySettings').innerHTML = storyHtml;

      // Build favorites fields
      var favHtml = '';
      var favKeys = [
        { key: 'songs', label: '🎵 我们的歌', placeholder: '歌名 — 歌手' },
        { key: 'movies', label: '🎬 电影', placeholder: '电影名' },
        { key: 'food', label: '🍜 美食', placeholder: '食物名' },
        { key: 'places', label: '📍 想去的地方', placeholder: '地点' }
      ];
      for (var f = 0; f < favKeys.length; f++) {
        var k = favKeys[f];
        favHtml += '<div style="background:#fdf2f4;border-radius:8px;padding:10px 12px;margin-bottom:8px;">';
        favHtml += '<div style="font-size:0.8rem;font-weight:600;color:#e84c6a;margin-bottom:6px;">' + k.label + '</div>';
        var items = favData[k.key] || [];
        for (var j = 0; j < 3; j++) {
          var item = items[j] || { name: '', tag: '' };
          favHtml += '<div style="display:flex;gap:6px;margin-bottom:4px;">';
          favHtml += '<input type="text" id="fav_name_' + k.key + '_' + j + '" value="' + item.name.replace(/"/g,'&quot;') + '" placeholder="' + k.placeholder + '" style="flex:1;padding:6px 10px;border:1.5px solid #f3d9df;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;" />';
          favHtml += '<input type="text" id="fav_tag_' + k.key + '_' + j + '" value="' + item.tag.replace(/"/g,'&quot;') + '" placeholder="标签" style="width:80px;padding:6px 10px;border:1.5px solid #f3d9df;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;" />';
          favHtml += '</div>';
        }
        favHtml += '</div>';
      }
      document.getElementById('favSettings').innerHTML = favHtml;

      settingsOverlay.classList.add('open');
    }

    document.getElementById('settingsBtn').onclick = openSettingsPanel;

    function addStoryEvent() {
      storyEvents.push({ period: '2025.01.01', title: '新事件 ✨', desc: '填写你们的回忆...' });
      openSettingsPanel(); // Rebuild the settings form
    }

    function deleteStoryEvent(idx) {
      if (idx < 5) return; // Can't delete the first 5 default events
      storyEvents.splice(idx, 1);
      // Also clean up storyData
      if (idx < storyData.length) storyData.splice(idx, 1);
      openSettingsPanel(); // Rebuild the settings form
    }

    document.getElementById('settingsCancel').onclick = function() {
      settingsOverlay.classList.remove('open');
    };

    settingsOverlay.onclick = function(e) {
      if (e.target === this) settingsOverlay.classList.remove('open');
    };

    document.getElementById('settingsSave').onclick = function() {
      // Save basic settings
      var nh = document.getElementById('setHisName').value.trim();
      var ns = document.getElementById('setHerName').value.trim();
      var sc = document.getElementById('setSecret').value.trim();
      var hi = document.getElementById('setHint').value.trim();
      var an = document.getElementById('setAnniversary').value;
      if (!nh || !ns) { errorEl.textContent = '😅 两个人的名字都要填哦'; return; }
      if (!sc) { errorEl.textContent = '🔐 暗号不能为空哦'; return; }
      SETTINGS = { hisName: nh, herName: ns, secret: sc, hint: hi, anniversary: an };
      apiSavePartial({ settings: SETTINGS });

      // Save story events
      for (var i = 0; i < storyEvents.length; i++) {
        var p = document.getElementById('se_period_' + i);
        var t = document.getElementById('se_title_' + i);
        var d = document.getElementById('se_desc_' + i);
        if (p) storyEvents[i].period = p.value.trim();
        if (t) storyEvents[i].title = t.value.trim();
        if (d) storyEvents[i].desc = d.value.trim();
      }
      apiSavePartial({ storyEvents: storyEvents });

      // Save favorites
      var favKeys = ['songs','movies','food','places'];
      for (var f = 0; f < favKeys.length; f++) {
        var k = favKeys[f];
        if (!favData[k]) favData[k] = [];
        for (var j = 0; j < 3; j++) {
          var nameEl = document.getElementById('fav_name_' + k + '_' + j);
          var tagEl = document.getElementById('fav_tag_' + k + '_' + j);
          if (nameEl) {
            favData[k][j] = { name: nameEl.value.trim(), tag: tagEl ? tagEl.value.trim() : '' };
          }
        }
      }
      apiSavePartial({ favs: favData });

      settingsOverlay.classList.remove('open');
      applySettings();
      if (typeof syncStoryData === 'function') syncStoryData();
      renderStoryTimeline();
      renderFavs();
      errorEl.textContent = '';
    };

    document.getElementById('btnHe').onclick = function() {
      verifiedWho = '他';
      step1.classList.remove('active');
      step2.classList.add('active');
      secretInput.placeholder = SECRET_HINT;
      secretLabel.textContent = '✦ 第二步：💙 ' + HIS_NAME + '，输入我们的暗号吧';
      secretInput.focus();
    };

    document.getElementById('btnShe').onclick = function() {
      verifiedWho = '她';
      step1.classList.remove('active');
      step2.classList.add('active');
      secretInput.placeholder = SECRET_HINT;
      secretLabel.textContent = '✦ 第二步：💗 ' + HER_NAME + '，输入我们的暗号吧';
      secretInput.focus();
    };

    document.getElementById('btnBack').onclick = function() {
      verifiedWho = '';
      step2.classList.remove('active');
      step1.classList.add('active');
      secretInput.value = '';
      errorEl.textContent = '';
    };

    document.getElementById('btnEnter').onclick = function() {
      var val = secretInput.value.trim();
      if (!val) { errorEl.textContent = '💭 输入我们的秘密暗号吧～'; return; }
      if (val === SECRET) {
        errorEl.textContent = '';
        step2.classList.remove('active');
        successEl.classList.add('show');
        triggerConfetti();
        setTimeout(function() {
          overlay.style.display = 'none';
          mainContent.style.display = 'block';
          document.body.style.overflow = '';
          updateCounter();
          setInterval(updateCounter, 1000);
        }, 1500);
      } else {
        errorEl.textContent = '😅 不对哦，再想想？';
        secretInput.value = '';
        secretInput.focus();
      }
    };

    secretInput.onkeydown = function(e) {
      if (e.key === 'Enter') { document.getElementById('btnEnter').click(); }
    };

    function updateCounter() {
      var now = new Date();
      var diff = now - START_DATE;
      if (diff < 0) diff = 0;
      var days = Math.floor(diff / (1000*60*60*24));
      var hours = Math.floor((diff / (1000*60*60)) % 24);
      var mins = Math.floor((diff / (1000*60)) % 60);
      var secs = Math.floor((diff / 1000) % 60);
      document.getElementById('daysCounter').textContent = days;
      document.getElementById('cDays').textContent = days;
      document.getElementById('cHours').textContent = String(hours).padStart(2,'0');
      document.getElementById('cMins').textContent = String(mins).padStart(2,'0');
      document.getElementById('cSecs').textContent = String(secs).padStart(2,'0');
    }

    function triggerConfetti() {
      var container = document.createElement('div');
      container.className = 'confetti-container';
      document.body.appendChild(container);
      var emojis = ['🎉','🎊','💖','❤️','💕','✨','🥳','🌟'];
      for (var i = 0; i < 40; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.textContent = emojis[i % emojis.length];
        piece.style.left = Math.random() * 100 + '%';
        piece.style.fontSize = (14 + Math.random() * 18) + 'px';
        piece.style.animationDuration = (2 + Math.random() * 3) + 's';
        piece.style.animationDelay = (Math.random() * 0.5) + 's';
        container.appendChild(piece);
      }
      setTimeout(function() { container.remove(); }, 5000);
    }

    // ===== Story Detail =====
    var currentDetailId = 0;
    var storyData = [];
    if (appData.storyData) storyData = appData.storyData;

    // Ensure storyData matches storyEvents length
    function syncStoryData() {
      while (storyData.length < storyEvents.length) storyData.push({});
      while (storyData.length > storyEvents.length) storyData.pop();
    }
    syncStoryData();

    function saveStoryData() {
      apiSavePartial({ storyData: storyData });
    }

    function getBadge(index) {
      var badges = ['💫 初遇', '🎄 约会', '💕 告白', '🌊 旅行', '🌟 进行中'];
      if (index < badges.length) return badges[index];
      return '💝 第' + (index + 1) + '章';
    }

    // ===== Photo Gallery =====
    var galleryPhotos = [];
    if (appData.gallery) galleryPhotos = appData.gallery;
    if (!galleryPhotos.length) galleryPhotos = ['','','','','',''];

    function saveGallery() {
      apiSavePartial({ gallery: galleryPhotos });
    }

    function galleryClick(idx) {
      var items = document.querySelectorAll('#galleryGrid .gallery-item');
      var el = items[idx];
      var img = el.querySelector('img');
      if (img) {
        // Show full-size in lightbox
        var lb = document.getElementById('lightbox');
        if (!lb) {
          // Create lightbox on the fly
          var div = document.createElement('div');
          div.id = 'lightbox';
          div.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:4000;align-items:center;justify-content:center;padding:40px;cursor:pointer';
          div.onclick = function() { this.style.display = 'none'; };
          var closeBtn = document.createElement('button');
          closeBtn.textContent = '×';
          closeBtn.style.cssText = 'position:absolute;top:20px;right:28px;font-size:2.5rem;color:#fff;cursor:pointer;background:none;border:none';
          closeBtn.onclick = function(e) { e.stopPropagation(); div.style.display = 'none'; };
          var imgEl = document.createElement('img');
          imgEl.id = 'lbImg';
          imgEl.style.cssText = 'max-width:90vw;max-height:85vh;border-radius:12px;object-fit:contain';
          div.appendChild(closeBtn);
          div.appendChild(imgEl);
          document.body.appendChild(div);
        }
        document.getElementById('lbImg').src = img.src;
        document.getElementById('lightbox').style.display = 'flex';
      } else {
        // Upload photo
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            galleryPhotos[idx] = ev.target.result;
            saveGallery();
            el.innerHTML = '<img src="'+ev.target.result+'" alt="" />';
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }
    }

    // Load gallery on startup
    (function() {
      var items = document.querySelectorAll('#galleryGrid .gallery-item');
      for (var i = 0; i < galleryPhotos.length && i < items.length; i++) {
        if (galleryPhotos[i]) {
          items[i].innerHTML = '<img src="'+galleryPhotos[i]+'" alt="" />';
        }
      }
    })();

    // ===== Messages =====
    var messages = [];
    if (appData.messages) messages = appData.messages;
    if (!messages.length) {
      messages = [
        { author: '他', title: '', content: '遇见你是我这辈子最幸运的事情 ❤️', date: '2025.01.01' },
        { author: '她', title: '', content: '和你在一起的日子，每一天都像甜甜的梦 🥰', date: '2025.01.01' }
      ];
      apiSavePartial({ messages: messages });
    }

    function renderMessages() {
      var grid = document.getElementById('messagesGrid');
      if (!grid) return;
      grid.innerHTML = '';
      for (var i = 0; i < messages.length; i++) {
        var m = messages[i];
        var card = document.createElement('div');
        card.className = 'message-card ' + (m.author === '她' ? 'from-her' : 'from-him');
        var icon = m.author === '她' ? '💗' : '💙';
        var html = '<h4>' + icon + ' ' + m.author + '写的</h4>';
        if (m.title) html += '<p style="font-weight:600;color:#2d1b1f;margin-bottom:4px;">「' + m.title + '」</p>';
        html += '<p>' + m.content + '</p>';
        if (m.date) html += '<div class="date">' + m.date + '</div>';
        card.innerHTML = html;
        grid.appendChild(card);
      }
    }
    renderMessages();

    function addMessage() {
      var author = document.getElementById('msgAuthor').value;
      var title = document.getElementById('msgTitle').value.trim();
      var content = document.getElementById('msgContent').value.trim();
      if (!content) return;
      var now = new Date();
      var ds = now.getFullYear() + '.' + String(now.getMonth()+1).padStart(2,'0') + '.' + String(now.getDate()).padStart(2,'0');
      messages.push({ author: author, title: title, content: content, date: ds });
      apiSavePartial({ messages: messages });
      document.getElementById('msgTitle').value = '';
      document.getElementById('msgContent').value = '';
      renderMessages();
      triggerConfetti();
    }

    // ===== Bucket List =====
    var bucketItems = [];
    if (appData.bucket) bucketItems = appData.bucket;
    if (!bucketItems.length) {
      bucketItems = [
        { emoji: '🌍', text: '一起去日本看樱花', done: false },
        { emoji: '🍜', text: '吃遍全城的火锅店', done: false },
        { emoji: '🎬', text: '一起看一百部电影', done: false },
        { emoji: '🏠', text: '布置我们的小家', done: false },
        { emoji: '🌍', text: '去海边看一次日出', done: false },
        { emoji: '🎉', text: '一起跨年倒数', done: false }
      ];
      apiSavePartial({ bucket: bucketItems });
    }

    function renderBucket() {
      var grid = document.getElementById('bucketGrid');
      if (!grid) return;
      grid.innerHTML = '';
      for (var i = 0; i < bucketItems.length; i++) {
        var b = bucketItems[i];
        var item = document.createElement('div');
        item.className = 'bucket-item' + (b.done ? ' done' : '');
        item.onclick = function(n) { return function() { toggleBucket(n); }; }(i);
        item.innerHTML = '<div class="check">' + (b.done ? '✓' : '') + '</div><span class="emoji">' + b.emoji + '</span><span class="text">' + b.text + '</span>';
        grid.appendChild(item);
      }
    }
    renderBucket();

    function toggleBucket(idx) {
      bucketItems[idx].done = !bucketItems[idx].done;
      apiSavePartial({ bucket: bucketItems });
      renderBucket();
      if (bucketItems[idx].done) triggerConfetti();
    }

    function addBucketItem() {
      var input = document.getElementById('bucketInput');
      var emoji = document.getElementById('bucketEmoji').value;
      var text = input.value.trim();
      if (!text) return;
      bucketItems.push({ emoji: emoji, text: text, done: false });
      apiSavePartial({ bucket: bucketItems });
      input.value = '';
      renderBucket();
    }

    document.getElementById('bucketInput').onkeydown = function(e) {
      if (e.key === 'Enter') addBucketItem();
    };