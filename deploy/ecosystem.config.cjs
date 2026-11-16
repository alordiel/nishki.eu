// PM2: pm2 start deploy/ecosystem.config.cjs && pm2 save
// Single instance on purpose: the contact rate limiter and the publish lock live in memory.
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
      out_file: '/var/log/nishki/cms.out.log',
      error_file: '/var/log/nishki/cms.err.log',
      time: true,
    },
  ],
}
