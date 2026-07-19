export function createLocalLoginPage(error?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OpenCode Gateway</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    h1 { font-size: 24px; margin-bottom: 24px; color: #1f2329; text-align: center; }
    .error { color: #d93025; margin-bottom: 16px; text-align: center; font-size: 14px; }
    input {
      width: 100%;
      padding: 12px 16px;
      margin-bottom: 16px;
      border: 1px solid #e8e9eb;
      border-radius: 8px;
      font-size: 15px;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="card">
    <h1>OpenCode Gateway</h1>
    ${error ? `<div class="error">${escapeHtml(error)}</div>` : ""}
    <form method="POST" action="/login">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign in</button>
    </form>
  </div>
</body>
</html>`
}

export function createProjectsPage(username: string, projects: string[]): string {
  return createDashboardPage(username, projects)
}

export function createDashboardPage(username: string, projects: string[], activeTab: string = "projects"): string {
  const projectCards = projects
    .map((p) => {
      const name = p.split("/").pop() || p
      return `
      <a class="project-card" href="/open-project?project=${encodeURIComponent(p)}">
        <div class="project-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="project-info">
          <div class="project-name">${escapeHtml(name)}</div>
          <div class="project-path">${escapeHtml(p)}</div>
        </div>
        <div class="project-arrow">→</div>
      </a>`
    })
    .join("")

  const emptyState = `
    <div class="empty-state">
      <div class="empty-title">暂无项目</div>
      <div class="empty-desc">当前账户没有分配到任何项目，请联系管理员。</div>
    </div>
  `

  const isProjects = activeTab === "projects"
  const isUsers = activeTab === "users"
  const isPermissions = activeTab === "permissions"
  const isSettings = activeTab === "settings"

  const mainContent = isProjects
    ? `<div class="section-header">
         <div class="section-title">项目中心</div>
         <div class="section-desc">选择下方项目进入 OpenCode 工作区</div>
       </div>
       <div class="project-grid">
         ${projects.length > 0 ? projectCards : emptyState}
       </div>`
    : isUsers
    ? `<div class="section-header">
         <div class="section-title">用户管理</div>
         <div class="section-desc">管理用户、分组及项目分配</div>
       </div>
       <div class="external-panel">
         <div class="external-icon">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
             <circle cx="9" cy="7" r="4"></circle>
             <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
             <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
           </svg>
         </div>
         <div class="external-title">Keycloak 用户管理</div>
         <div class="external-desc">用户、分组、密码和项目分配请在 Keycloak 管理控制台中维护。</div>
         <a class="external-btn" href="http://localhost:9091/admin/master/console/#/opencode/users" target="_blank">打开 Keycloak 管理控制台（admin/admin）</a>
       </div>`
    : isPermissions
    ? `<div class="section-header">
         <div class="section-title">权限管理</div>
         <div class="section-desc">配置角色、权限和访问策略</div>
       </div>
       <div class="external-panel">
         <div class="external-icon">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
           </svg>
         </div>
         <div class="external-title">Keycloak 权限管理</div>
         <div class="external-desc">角色、权限策略和组映射请在 Keycloak 管理控制台中维护。</div>
         <a class="external-btn" href="http://localhost:9091/admin/master/console/#/opencode/groups" target="_blank">打开 Keycloak 权限管理（admin/admin）</a>
       </div>`
    : `<div class="section-header">
         <div class="section-title">系统设置</div>
         <div class="section-desc">网关和 Keycloak 基础配置</div>
       </div>
       <div class="settings-grid">
         <div class="setting-card">
           <div class="setting-label">网关端口</div>
           <div class="setting-value">9090</div>
         </div>
         <div class="setting-card">
           <div class="setting-label">Keycloak 地址</div>
           <div class="setting-value">http://localhost:9091</div>
         </div>
         <div class="setting-card">
           <div class="setting-label">当前用户</div>
           <div class="setting-value">${escapeHtml(username)}</div>
         </div>
       </div>`

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OpenCode Gateway</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif; background: #f7f8fa; color: #1f2329; height: 100vh; overflow: hidden; }
    .layout { display: flex; height: 100vh; }

    /* 左侧窄导航 */
    .side-nav {
      width: 72px;
      background: #1f1f1f;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
      flex-shrink: 0;
    }
    .nav-logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 32px;
    }
    .nav-item {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      text-decoration: none;
      margin-bottom: 8px;
      transition: all 0.2s;
    }
    .nav-item:hover, .nav-item.active {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    .nav-item svg { width: 22px; height: 22px; }
    .nav-spacer { flex: 1; }
    .nav-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .logout-btn {
      color: #9ca3af;
      text-decoration: none;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

    /* 主内容区 */
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .header {
      height: 64px;
      background: #fff;
      border-bottom: 1px solid #e8e9eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      flex-shrink: 0;
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-title { font-size: 18px; font-weight: 600; color: #1f2329; }
    .header-user { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #646a73; }
    .header-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .content {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
    }
    .section-header { margin-bottom: 24px; }
    .section-title { font-size: 24px; font-weight: 600; color: #1f2329; margin-bottom: 6px; }
    .section-desc { font-size: 14px; color: #8f959e; }

    .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; max-width: 1200px; }
    .project-card {
      background: #fff;
      border: 1px solid #e8e9eb;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .project-card:hover { border-color: #4f46e5; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.08); transform: translateY(-1px); }
    .project-icon { width: 44px; height: 44px; border-radius: 10px; background: #f2f3f5; color: #4f46e5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .project-info { flex: 1; min-width: 0; }
    .project-name { font-size: 16px; font-weight: 600; color: #1f2329; margin-bottom: 4px; }
    .project-path { font-size: 13px; color: #8f959e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .project-arrow { color: #c9cdd4; font-size: 18px; transition: color 0.2s; }
    .project-card:hover .project-arrow { color: #4f46e5; }

    .empty-state { max-width: 1200px; background: #fff; border: 1px dashed #d0d3d6; border-radius: 12px; padding: 48px; text-align: center; color: #646a73; }
    .empty-title { font-size: 16px; font-weight: 500; color: #1f2329; margin-bottom: 8px; }
    .empty-desc { font-size: 14px; color: #8f959e; }

    .external-panel { max-width: 720px; background: #fff; border: 1px solid #e8e9eb; border-radius: 16px; padding: 48px; text-align: center; }
    .external-icon { width: 64px; height: 64px; border-radius: 16px; background: #f2f3f5; color: #4f46e5; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    .external-title { font-size: 18px; font-weight: 600; color: #1f2329; margin-bottom: 8px; }
    .external-desc { font-size: 14px; color: #8f959e; margin-bottom: 24px; }
    .external-btn { display: inline-block; padding: 10px 24px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; transition: background 0.2s; }
    .external-btn:hover { background: #4338ca; }

    .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; max-width: 800px; }
    .setting-card { background: #fff; border: 1px solid #e8e9eb; border-radius: 12px; padding: 20px; }
    .setting-label { font-size: 13px; color: #8f959e; margin-bottom: 6px; }
    .setting-value { font-size: 15px; font-weight: 500; color: #1f2329; }

    @media (max-width: 768px) {
      .side-nav { display: none; }
      .content { padding: 24px; }
      .project-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="side-nav">
      <div class="nav-logo">OC</div>
      <a class="nav-item ${isProjects ? "active" : ""}" href="/projects" title="项目中心">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </a>
      <a class="nav-item ${isUsers ? "active" : ""}" href="/dashboard/users" title="用户管理">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </a>
      <a class="nav-item ${isPermissions ? "active" : ""}" href="/dashboard/permissions" title="权限管理">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </a>
      <a class="nav-item ${isSettings ? "active" : ""}" href="/dashboard/settings" title="系统设置">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </a>
      <div class="nav-spacer"></div>
      <div class="nav-avatar">${escapeHtml(username.slice(0, 2).toUpperCase())}</div>
      <a class="logout-btn" href="/logout" title="退出登录">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </a>
    </aside>

    <main class="main">
      <header class="header">
        <div class="header-left">
          <div class="header-title">OpenCode Gateway</div>
        </div>
        <div class="header-user">
          <div class="header-avatar">${escapeHtml(username.slice(0, 2).toUpperCase())}</div>
          <span>${escapeHtml(username)}</span>
        </div>
      </header>
      <section class="content">
        ${mainContent}
      </section>
    </main>
  </div>
</body>
</html>`
}

export function createAdminPage(username: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin - OpenCode Gateway</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif; background: #f8f9fa; color: #1f2329; padding: 32px; }
    h1 { font-size: 24px; margin-bottom: 24px; }
    .section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .section h2 { font-size: 18px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e8e9eb; font-size: 14px; }
    th { color: #646a73; font-weight: 500; }
    input, button { padding: 8px 12px; border-radius: 6px; border: 1px solid #e8e9eb; font-size: 14px; margin-right: 8px; }
    button { background: #4f46e5; color: #fff; border-color: #4f46e5; cursor: pointer; }
    button:hover { background: #4338ca; }
    .danger { background: #dc2626; border-color: #dc2626; }
    .danger:hover { background: #b91c1c; }
    .error { color: #dc2626; margin-top: 8px; font-size: 14px; }
    .success { color: #16a34a; margin-top: 8px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Admin Panel</h1>
  <p>Logged in as <strong>${escapeHtml(username)}</strong></p>

  <div class="section">
    <h2>Users</h2>
    <table id="users-table">
      <thead>
        <tr><th>Username</th><th>Projects</th><th>Actions</th></tr>
      </thead>
      <tbody></tbody>
    </table>
    <h3>Add User</h3>
    <form id="add-user-form">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <input name="projects" placeholder="Projects (comma separated)" />
      <button type="submit">Add</button>
    </form>
    <div id="users-message"></div>
  </div>

  <div class="section">
    <h2>Project Pool</h2>
    <table id="projects-table">
      <thead>
        <tr><th>Path</th><th>Actions</th></tr>
      </thead>
      <tbody></tbody>
    </table>
    <h3>Add Project</h3>
    <form id="add-project-form">
      <input name="path" placeholder="Project path" required />
      <button type="submit">Add</button>
    </form>
    <div id="projects-message"></div>
  </div>

  <script>
    async function loadUsers() {
      const res = await fetch('/admin/api/users')
      const data = await res.json()
      const tbody = document.querySelector('#users-table tbody')
      tbody.innerHTML = data.users.map(u => \`
        <tr>
          <td>\${escapeHtml(u.username)}</td>
          <td>\${escapeHtml(u.projects.join(', '))}</td>
          <td>
            <button onclick="setProjects('\${u.username}')">Set Projects</button>
            <button onclick="removeUser('\${u.username}')" class="danger">Remove</button>
          </td>
        </tr>
      \`).join('')
    }

    async function loadProjects() {
      const res = await fetch('/admin/api/projects')
      const data = await res.json()
      const tbody = document.querySelector('#projects-table tbody')
      tbody.innerHTML = data.projects.map(p => \`
        <tr>
          <td>\${escapeHtml(p)}</td>
          <td><button onclick="removeProject('\${encodeURIComponent(p)}')" class="danger">Remove</button></td>
        </tr>
      \`).join('')
    }

    document.getElementById('add-user-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const form = e.target
      const body = new URLSearchParams(new FormData(form))
      const res = await fetch('/admin/api/users', { method: 'POST', body })
      const data = await res.json()
      document.getElementById('users-message').textContent = data.error ? data.error : 'User added'
      document.getElementById('users-message').className = data.error ? 'error' : 'success'
      form.reset()
      loadUsers()
      loadProjects()
    })

    document.getElementById('add-project-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const form = e.target
      const body = new URLSearchParams(new FormData(form))
      const res = await fetch('/admin/api/projects', { method: 'POST', body })
      const data = await res.json()
      document.getElementById('projects-message').textContent = data.error ? data.error : 'Project added'
      document.getElementById('projects-message').className = data.error ? 'error' : 'success'
      form.reset()
      loadProjects()
    })

    async function setProjects(username) {
      const projects = prompt('Enter project paths (comma separated):')
      if (projects === null) return
      const body = new URLSearchParams({ projects })
      const res = await fetch(\`/admin/api/users/\${encodeURIComponent(username)}/projects\`, { method: 'POST', body })
      const data = await res.json()
      document.getElementById('users-message').textContent = data.error ? data.error : 'Projects updated'
      document.getElementById('users-message').className = data.error ? 'error' : 'success'
      loadUsers()
    }

    async function removeUser(username) {
      if (!confirm('Remove user ' + username + '?')) return
      const res = await fetch(\`/admin/api/users/\${encodeURIComponent(username)}\`, { method: 'DELETE' })
      const data = await res.json()
      document.getElementById('users-message').textContent = data.error ? data.error : 'User removed'
      document.getElementById('users-message').className = data.error ? 'error' : 'success'
      loadUsers()
    }

    async function removeProject(encodedPath) {
      if (!confirm('Remove project?')) return
      const res = await fetch(\`/admin/api/projects/\${encodedPath}\`, { method: 'DELETE' })
      const data = await res.json()
      document.getElementById('projects-message').textContent = data.error ? data.error : 'Project removed'
      document.getElementById('projects-message').className = data.error ? 'error' : 'success'
      loadProjects()
    }

    function escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    loadUsers()
    loadProjects()
  </script>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
