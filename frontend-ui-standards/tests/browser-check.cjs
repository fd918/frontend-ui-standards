// From the skill directory: node tests/browser-check.cjs
// Install Playwright and its browser in your test environment first. CHROME_PATH or PLAYWRIGHT_CHANNEL is optional.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname,'../assets/date-time');
const server = http.createServer(async (req,res) => {
  try {
    const name = new URL(req.url,'http://localhost').pathname;
    if (name === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    const target = path.resolve(root,'.'+name);
    if (!target.startsWith(root+path.sep)) { res.writeHead(403);res.end();return; }
    const body = await fs.readFile(target);
    res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'text/html');
    res.end(body);
  } catch { res.writeHead(404);res.end(); }
});
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
    const page = await browser.newPage({viewport:{width:1440,height:1100},locale:'zh-CN',timezoneId:'Asia/Shanghai'});
    const errors=[]; const requests=[];
    page.on('pageerror',error => errors.push(error.message));
    page.on('request',request => requests.push(request.url()));
    const url=`http://127.0.0.1:${server.address().port}/demo.html`;
    await page.goto(url);
    await page.locator('#range').click();
    await page.getByRole('button',{name:'近7日',exact:true}).click();
    const selected=await page.locator('#date-result').textContent();
    const [start,end]=selected.split(' 至 ');
    assert.equal((Date.parse(end)-Date.parse(start))/86400000,6);
    await page.locator('#range').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#range').evaluate(el=>el===document.activeElement),true);
    assert.equal(await page.evaluate(()=>YunzhanDateRangePicker.isOpen()),false);
    await page.evaluate(()=>YunzhanDateRangePicker.open(document.getElementById('range'),{baseDate:'2026-10-29',minDate:'2026-10-01',maxDate:'2026-10-31',start:'2026-10-01',end:'2026-10-29',onApply:value=>document.getElementById('date-result').textContent=`${value.start} 至 ${value.end}`}));
    assert.equal(await page.locator('[data-picker-date="2026-09-30"]').isDisabled(),true);
    await page.locator('[data-picker-date="2026-10-05"]').click();
    assert.equal(await page.locator('[data-picker-phase="end"]').getAttribute('class').then(value=>value.includes('active')),true);
    await page.locator('[data-picker-date="2026-10-12"]').click();
    await page.locator('[data-picker-apply]').click();
    assert.equal(await page.locator('#date-result').textContent(),'2026-10-05 至 2026-10-12');
    await page.locator('#date').click();
    await page.locator('.calendar-day:not([disabled])').filter({hasText:/^15$/}).first().click();
    assert.equal(await page.evaluate(()=>YunzhanDateRangePicker.isOpen()),false);
    await page.locator('#single [data-time]').fill('23:59');
    await page.locator('#read-single').click();
    assert.equal(await page.locator('#single-result').textContent(),'23:59');
    await page.locator('#single [data-time]').fill('');
    await page.locator('#read-single').click();
    assert.match(await page.locator('#single-result').textContent(),/至少设置一个时间/);
    await page.locator('#schedule [data-add]').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#schedule [data-time]').count(),3);
    await page.locator('#schedule [data-time]').nth(2).fill('09:30');
    await page.locator('#save').click();
    assert.deepEqual(JSON.parse(await page.locator('#schedule-result').textContent()).times,['09:30','18:00']);
    await page.locator('#schedule [data-remove]').nth(2).click();
    await page.locator('#schedule [data-remove]').nth(1).click();
    await page.locator('#schedule [data-remove]').click();
    assert.equal(await page.locator('#schedule [data-time]').count(),1);
    assert.equal(await page.locator('#schedule [data-time]').inputValue(),'');
    await page.locator('#schedule [data-enabled]').check();
    await page.locator('#save').click();
    assert.match(await page.locator('#schedule-result').textContent(),/至少设置一个时间/);
    await page.locator('#restore').click();
    assert.equal(await page.locator('#schedule [data-enabled]').isChecked(),false);
    assert.equal(await page.locator('#schedule [data-time]').count(),2);
    assert.equal(await page.locator('#schedule [data-time]').first().evaluate(el=>getComputedStyle(el).height),'44px');
    const lifecycle=await page.evaluate(()=>{
      let count=0;const root=document.createElement('div');document.body.append(root);
      const control=StandardTimePicker.mount(root,Object.freeze({mode:'time',onChange:()=>count++}));
      control.setValue({times:['12:00']});
      const silent=count===0;let duplicateRejected=false;
      try{StandardTimePicker.mount(root);}catch{duplicateRejected=true;}
      control.destroy();const empty=root.children.length===0;
      const next=StandardTimePicker.mount(root,{mode:'time',value:{times:['13:00']}});
      const time=next.getValue().times[0];next.destroy();root.remove();
      return {silent,duplicateRejected,empty,time};
    });
    assert.deepEqual(lifecycle,{silent:true,duplicateRejected:true,empty:true,time:'13:00'});
    if(process.env.QA_OUTPUT_DIR){await fs.mkdir(process.env.QA_OUTPUT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.QA_OUTPUT_DIR,'desktop.png'),fullPage:true});}
    for(const width of [1024,1280,1920]){
      await page.setViewportSize({width,height:1100});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`页面宽度 ${width}`);
      await page.locator('#range').click();
      const rect=await page.locator('.range-picker').boundingBox();
      assert.ok(rect.x>=0 && rect.x+rect.width<=width+1,`日期浮层宽度 ${width}`);
      await page.keyboard.press('Escape');
    }
    assert.deepEqual(errors,[]);
    assert.equal(requests.every(url=>url.startsWith(`http://127.0.0.1:${server.address().port}/`)),true);
    console.log(JSON.stringify({passed:true,checks:['范围/单日/快捷日期/边界/关闭焦点','时刻/增删/必填/去重/回填','多实例/销毁/初始化静默','1024/1280/1440/1920桌面宽度','零脚本异常/零外部请求']},null,2));
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
