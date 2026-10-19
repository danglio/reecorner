import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function syncSourcePlugin(): Plugin {
  return {
    name: 'vite-plugin-sync-source',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Status check endpoint
        if (url.startsWith('/api/sync-source/status') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          let gitBranch = 'main';
          let gitRemote = '';
          let lastCommit = '';
          try {
            gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
            gitRemote = execSync('git remote -v', { encoding: 'utf-8' }).trim();
            lastCommit = execSync('git log -1 --pretty=format:"%h - %s (%cr)"', { encoding: 'utf-8' }).trim();
          } catch {
            // Ignore git lookup errors
          }

          res.end(
            JSON.stringify({
              isLocalDev: true,
              connected: true,
              targetFile: 'src/data/storeData.json',
              gitBranch,
              hasGitRemote: Boolean(gitRemote),
              gitRemote,
              lastCommit,
            })
          );
          return;
        }

        // Save to source endpoint
        if (url.startsWith('/api/sync-source') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');

            try {
              const data = JSON.parse(body);
              if (!data || !Array.isArray(data.products)) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, message: 'Dữ liệu không hợp lệ (thiếu products).' }));
                return;
              }

              const targetFilePath = path.resolve(__dirname, 'src/data/storeData.json');
              const formattedJSON = JSON.stringify(data, null, 2);
              fs.writeFileSync(targetFilePath, formattedJSON, 'utf-8');

              let gitCommitOutput = '';
              let gitPushed = false;
              try {
                execSync('git add src/data/storeData.json', { stdio: 'pipe' });
                const commitRes = execSync(
                  'git commit -m "chore(data): auto-sync admin updates to source code" --no-verify',
                  { encoding: 'utf-8', stdio: 'pipe' }
                );
                gitCommitOutput = commitRes.trim();

                const remotes = execSync('git remote', { encoding: 'utf-8' }).trim();
                if (remotes) {
                  execSync('git push', { stdio: 'pipe' });
                  gitPushed = true;
                }
              } catch (gitErr: any) {
                // If nothing to commit or error, capture message
                gitCommitOutput = gitErr?.message || 'Không có thay đổi mới trong Git';
              }

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Đã lưu trực tiếp vào mã nguồn mở (src/data/storeData.json) và cập nhật Git!',
                  filePath: 'src/data/storeData.json',
                  gitCommitted: Boolean(gitCommitOutput && !gitCommitOutput.includes('nothing to commit')),
                  gitPushed,
                  timestamp: new Date().toISOString(),
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  success: false,
                  message: `Lỗi khi ghi file mã nguồn: ${err?.message || 'Unknown error'}`,
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), syncSourcePlugin()],
});
