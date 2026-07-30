<script lang="ts">
  // 跳转到网站主登录页，附带 redirect 参数让登录成功后回到 StarHope
  const loginUrl = '/login?redirect=/starhope';
</script>

<div class="min-h-screen flex items-center justify-center bg-page-bg">
  <div class="w-full max-w-md px-4">
    <div class="card-base p-8 text-center">
      <div class="text-5xl mb-4">🔐</div>
      <h1 class="text-2xl font-bold text-deep-text mb-2">需要登录</h1>
      <p class="text-sm text-text-muted mb-6">
        StarHope 使用 LKM 网站统一账户，请先登录后再使用学习助手。
      </p>
      <a
        href="/login?redirect=/starhope"
        class="inline-block btn-primary rounded-lg px-6 py-2.5 text-sm font-semibold"
      >
        前往登录
      </a>
    </div>
  </div>
</div>
