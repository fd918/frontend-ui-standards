const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/date-time/shared-time-picker.js'), 'utf8'), {window, Intl});
const normalize = (...args) => JSON.parse(JSON.stringify(window.StandardTimePicker.normalize(...args)));

test('时间去空、去重和升序，周日排在周六之后', () => {
  assert.deepEqual(normalize({weekdays:[0,3,1,3],times:['18:00','','09:30','09:30']}), {
    enabled:false,weekdays:[1,3,0],times:['09:30','18:00'],timeZone:'Asia/Shanghai'
  });
});
test('关闭计划不自动启用，启用时必须有星期和时间', () => {
  assert.equal(normalize({}).enabled, false);
  assert.throws(() => normalize({enabled:true}), /至少设置一个时间/);
  assert.throws(() => normalize({enabled:true,times:['09:30']}), /至少选择一个执行日/);
  assert.equal(normalize({enabled:true,weekdays:[1],times:['09:30']}).enabled, true);
});
test('拒绝非法时刻、秒、星期和时区，单时刻可要求必填', () => {
  for (const value of ['24:00','09:60','9:30','09:30:00']) assert.throws(() => normalize({times:[value]}), /时间必须/);
  assert.throws(() => normalize({weekdays:[8]}), /星期必须/);
  assert.throws(() => normalize({timeZone:'Invalid/Zone'}), /有效的时区/);
  assert.throws(() => normalize({}, {mode:'time',required:true}), /至少设置/);
  assert.throws(() => normalize({times:['09:30','18:00']}, {mode:'time'}), /请选择一个时间/);
});
test('合法边界 00:00、23:59 与跨时区配置原样保留', () => {
  assert.deepEqual(normalize({times:['23:59','00:00'],timeZone:'America/New_York'}).times, ['00:00','23:59']);
  assert.equal(normalize({timeZone:'America/New_York'}).timeZone, 'America/New_York');
});
test('最多 48 个不同时间', () => {
  const times = Array.from({length:49},(_,i) => `${String(Math.floor(i/60)).padStart(2,'0')}:${String(i%60).padStart(2,'0')}`);
  assert.equal(normalize({times:times.slice(0,48)}).times.length,48);
  assert.throws(() => normalize({times}), /最多可设置 48/);
});
test('日期组件及样式与记录的来源哈希一致', () => {
  const provenance = JSON.parse(fs.readFileSync(path.join(root,'references/component-provenance.json'),'utf8'));
  for (const entry of provenance.files.filter(file => file.extraction === 'unchanged')) {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/date-time',entry.file))).digest('hex');
    assert.equal(hash,entry.sourceSha256,entry.file);
  }
});
