(function (global) {
  'use strict';
  // Extracted from the established daily-work schedule controls. No scheduling or network side effects.
  const VERSION = '1.0.0';
  const mounts = new WeakMap();
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const DAYS = [[1,'一'],[2,'二'],[3,'三'],[4,'四'],[5,'五'],[6,'六'],[0,'日']];
  function normalize(input = {}, { required = false, mode = 'schedule' } = {}) {
    const times = [...new Set((input.times || []).map(value => String(value).trim()).filter(Boolean))].sort();
    if (times.some(value => !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))) throw Error('时间必须为 00:00–23:59，精确到分钟');
    if (times.length > 48 || (mode === 'time' && times.length > 1)) throw Error(mode === 'time' ? '请选择一个时间' : '最多可设置 48 个时间');
    const weekdays = [...new Set(input.weekdays || [])];
    if (weekdays.some(day => !Number.isInteger(day) || day < 0 || day > 6)) throw Error('星期必须为 0–6 的整数，0 表示周日');
    weekdays.sort((a,b) => (a || 7) - (b || 7));
    const enabled = input.enabled === true;
    const timeZone = input.timeZone || 'Asia/Shanghai';
    try { new Intl.DateTimeFormat('zh-CN', { timeZone }); } catch { throw Error('请设置有效的时区'); }
    if ((required || enabled) && !times.length) throw Error('请至少设置一个时间');
    if (mode === 'schedule' && enabled && !weekdays.length) throw Error('请至少选择一个执行日');
    return { enabled, weekdays, times, timeZone };
  }
  function mount(root, options = {}) {
    if (!(root instanceof global.HTMLElement)) throw Error('请提供时间组件的容器元素');
    if (mounts.has(root)) throw Error('该容器已挂载时间组件，请先销毁旧实例');
    const mode = options.mode === 'time' ? 'time' : 'schedule';
    let value = normalize(options.value, { mode });
    let disposed = false;
    root.classList.add('standard-time-picker');
    function inputValue() {
      return {
        enabled: mode === 'schedule' && root.querySelector('[data-enabled]').checked,
        weekdays: [...root.querySelectorAll('[data-weekday]:checked')].map(input => Number(input.value)),
        times: [...root.querySelectorAll('[data-time]')].map(input => input.value),
        timeZone: value.timeZone
      };
    }
    function summary(emit = true) {
      const current = inputValue();
      const times = [...new Set(current.times.filter(Boolean))].sort();
      const days = DAYS.filter(([day]) => current.weekdays.includes(day)).map(([,label]) => `周${label}`);
      root.querySelector('[data-summary]').textContent = mode === 'time'
        ? (times[0] || '尚未选择时间')
        : current.enabled ? `${days.join('、') || '未选择星期'} · ${times.join('、') || '未设置时间'}` : '自动计划已关闭，保存的时间不会执行';
      root.querySelector('[data-error]').textContent = '';
      root.querySelector('[data-add]')?.toggleAttribute('disabled', root.querySelectorAll('[data-time]').length >= 48);
      if (emit) options.onChange?.({ ...current, times, weekdays: [...current.weekdays] });
    }
    function row(time = '') {
      return `<div class="schedule-time-row"><input type="time" step="60" value="${escapeHtml(time)}" data-time aria-label="${escapeHtml(options.label || '选择时间')}">${mode === 'time' ? '' : '<button class="schedule-time-remove" type="button" data-remove aria-label="删除这个时间">×</button>'}</div>`;
    }
    function render() {
      root.innerHTML = `${mode === 'schedule' ? `<label class="schedule-switch"><input type="checkbox" data-enabled ${value.enabled ? 'checked' : ''}><span class="schedule-switch-track" aria-hidden="true"></span><span>启用自动计划</span></label><fieldset><legend>每周执行日</legend><div class="weekday-options">${DAYS.map(([day,label]) => `<label class="weekday-option"><input type="checkbox" data-weekday value="${day}" ${value.weekdays.includes(day) ? 'checked' : ''}><span>周${label}</span></label>`).join('')}</div></fieldset>` : ''}<div class="schedule-label">${escapeHtml(options.label || '精确时间')} · ${escapeHtml(value.timeZone)}</div><div class="schedule-times ${mode === 'time' ? 'single-time' : ''}">${(value.times.length ? value.times : ['']).map(row).join('')}</div><div class="schedule-actions">${mode === 'schedule' ? '<button class="schedule-add" data-add type="button">＋ 添加一个时间</button>' : ''}<span class="schedule-summary" data-summary role="status"></span></div><p class="schedule-error" data-error role="alert"></p>`;
      // Initial rendering and setValue restore controls without firing change callbacks.
      summary(false);
    }
    function click(event) {
      const remove = event.target.closest('[data-remove]');
      if (remove && root.contains(remove)) {
        const rows = root.querySelectorAll('.schedule-time-row');
        if (rows.length === 1) rows[0].querySelector('input').value = '';
        else remove.closest('.schedule-time-row').remove();
        (root.querySelector('[data-time]') || root.querySelector('[data-add]'))?.focus();
        summary();
      }
      if (event.target.closest('[data-add]') && root.contains(event.target)) {
        if (root.querySelectorAll('[data-time]').length >= 48) return;
        root.querySelector('.schedule-times').insertAdjacentHTML('beforeend', row());
        const input = [...root.querySelectorAll('[data-time]')].at(-1);
        input.focus();
        if (input.showPicker) try { input.showPicker(); } catch {}
        summary();
      }
    }
    function changed(event) { if (event.target.matches('[data-time],[data-weekday],[data-enabled]')) summary(); }
    render();
    root.addEventListener('click', click);
    root.addEventListener('change', changed);
    const api = {
      getValue({ required = false } = {}) {
        if (disposed) throw Error('时间组件已销毁');
        try { const result = normalize(inputValue(), { required, mode }); root.querySelector('[data-error]').textContent = ''; return result; }
        catch (error) { root.querySelector('[data-error]').textContent = error.message; throw error; }
      },
      setValue(next) { if (disposed) throw Error('时间组件已销毁'); value = normalize(next, { mode }); render(); },
      destroy() { if (disposed) return; disposed = true; root.removeEventListener('click', click); root.removeEventListener('change', changed); root.replaceChildren(); root.classList.remove('standard-time-picker'); mounts.delete(root); }
    };
    mounts.set(root, api);
    return api;
  }
  global.StandardTimePicker = Object.freeze({ version: VERSION, mount, normalize });
})(window);
