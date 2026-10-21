let memoryStoreData = null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'danglio/reecorner';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (req.method === 'GET') {
    const hasToken = Boolean(process.env.GITHUB_TOKEN);

    // Trả về dữ liệu sản phẩm mới nhất lập tức cho người xem (bỏ qua cache 5 phút của Fastly/GitHub Raw)
    if (req.query && (req.query.data || req.query.action === 'data')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      if (memoryStoreData && Array.isArray(memoryStoreData.products)) {
        return res.status(200).json(memoryStoreData);
      }

      const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
      const rawUrl = `https://raw.githubusercontent.com/${cleanRepo}/${branch}/src/data/storeData.json?t=${Date.now()}`;
      try {
        const rawRes = await fetch(rawUrl, {
          headers: token ? { Authorization: `token ${token.trim()}` } : {},
        });
        if (rawRes.ok) {
          const freshData = await rawRes.json();
          if (freshData && Array.isArray(freshData.products)) {
            memoryStoreData = freshData;
            return res.status(200).json(freshData);
          }
        }
      } catch (err) {}
    }

    return res.status(200).json({
      configured: hasToken && Boolean(process.env.GITHUB_REPO),
      repo: process.env.GITHUB_REPO || '',
      branch,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    return res.status(500).json({
      success: false,
      message: 'Chưa cấu hình biến môi trường GITHUB_TOKEN và GITHUB_REPO trên Vercel!',
    });
  }

  try {
    const payload = req.body;
    if (!payload || !Array.isArray(payload.products)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ (thiếu mảng products)' });
    }

    const filePath = 'src/data/storeData.json';
    const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;

    // 1. Get current file SHA
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        Authorization: `token ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Conan-Shop-Bot',
      },
    });

    let sha = undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // 2. Base64 encode formatted JSON
    const contentStr = JSON.stringify(payload, null, 2);
    const encodedContent = Buffer.from(contentStr, 'utf-8').toString('base64');

    const commitBody = {
      message: `chore(data): admin updated shop catalog [${new Date().toLocaleString('vi-VN')}]`,
      content: encodedContent,
      branch,
    };
    if (sha) {
      commitBody.sha = sha;
    }

    // 3. Commit to GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Conan-Shop-Bot',
      },
      body: JSON.stringify(commitBody),
    });

    if (putRes.ok) {
      memoryStoreData = payload;

      // Trigger Vercel Deploy Hook if configured
      if (process.env.VERCEL_DEPLOY_HOOK_URL) {
        fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
      }

      return res.status(200).json({
        success: true,
        message: 'Đã lưu và commit trực tiếp lên mã nguồn GitHub! Vercel đang tự động build và deploy bản mới nhất.',
      });
    } else {
      const errData = await putRes.json().catch(() => ({}));
      return res.status(putRes.status).json({
        success: false,
        message: `GitHub API trả về lỗi: ${errData.message || 'Không thể tạo commit'}`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Lỗi kết nối máy chủ: ${error.message || 'Unknown error'}`,
    });
  }
}
