// PM2: pm2 start deploy/ecosystem.config.cjs && pm2 save
// Single instance on purpose: the contact rate limiter and the publish lock live in memory.
// Logs go to $LOG_DIR (default ~/.pm2/logs — /var/log isn't writable for a Plesk subscription user,
// and ~/logs on Plesk is the web server's own log folder).
const LOG_DIR = process.env.LOG_DIR || require('os').homedir() + '/.pm2/logs'

module.exports = {
  apps: [
    {
      name: 'nishki-cms',
      cwd: __dirname + '/../apps/cms',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3000 --hostname 127.0.0.1',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', NODE_OPTIONS: '--no-deprecation' },
      max_memory_restart: '1G',
      out_file: LOG_DIR + '/cms.out.log',
      error_file: LOG_DIR + '/cms.err.log',
      time: true,
    },
  ],
}
