import { createApp } from './app';
createApp().then(app => app.listen(3000)).catch(error => { console.error(error); process.exitCode = 1; });
