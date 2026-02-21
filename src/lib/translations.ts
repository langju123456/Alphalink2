
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    nav: {
      marketFeed: "Market Feed",
      performance: "Performance",
      alphaBot: "AlphaBot AI",
      invites: "Invites",
      logout: "Logout",
      theme: "Theme Mode",
      language: "Language",
      sessionRole: "Session Role",
      admin: "Administrator",
      member: "Member Terminal",
      tier: "Membership Tier"
    },
    tiers: {
      standard: "Standard",
      vip: "VIP Pro",
      premium: "Premium Elite",
      all: "All Tiers"
    },
    feed: {
      title: "Market Intelligence",
      description: "Real-time research notes from the AlphaLink institutional desk.",
      searchPlaceholder: "Search tickers, strategies, or notes...",
      allAssets: "All Assets",
      stocks: "Stocks",
      options: "Options",
      noIdeas: "No active trade ideas found.",
      standBy: "Stand by for desk updates",
      footer: "Market Data Delayed by 15 Minutes • AlphaLink Research Desk"
    },
    performance: {
      title: "Alpha Desk Performance",
      description: "Verified trade results and community win highlights.",
      addWin: "Add Win Highlight",
      publishWin: "Publish Performance Win",
      ticker: "Ticker",
      return: "Return % (e.g. 45)",
      strategy: "Title / Strategy",
      date: "Date",
      desc: "Description...",
      publishBtn: "Publish to Wall of Fame",
      noHighlights: "No performance highlights documented yet.",
      verified: "Desk Verified",
      returnLabel: "Return"
    },
    invites: {
      title: "Access Management",
      description: "Generate multi-tier invitation codes for private members.",
      label: "Group / Name",
      labelPlaceholder: "e.g. VIP Group, Twitter Event",
      generateBtn: "Generate New Invite",
      tableCode: "Access Code",
      tableLabel: "Label / Category",
      tableStatus: "Status",
      tableTier: "Tier",
      tableCreated: "Created",
      tableActions: "Actions",
      newlyGenerated: "Newly Generated Access Code",
      copyBtn: "Copy Code",
      active: "Active",
      disabled: "Disabled",
      disableAction: "Disable Access",
      enableAction: "Re-Enable",
      editLabel: "Edit Label",
      deleteInvite: "Delete Invite",
      confirmDelete: "Are you sure you want to delete this invite?",
      saveChanges: "Save Changes",
      selectTier: "Select Tier"
    },
    assistant: {
      title: "AlphaBot AI",
      description: "Research Assistant & Market Intelligence Engine",
      welcome: "Hello, I am AlphaBot. How can I assist with your market research or technical analysis today? I specialize in Stock and Options scenario analysis.",
      placeholder: "Ask about SPY analysis, vertical spreads, or risk management...",
      analyzing: "Analyzing Market Data...",
      disclaimer: "For educational purposes only • Never financial advice • Gemini AI Core"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete"
    }
  },
  zh: {
    nav: {
      marketFeed: "市场动态",
      performance: "业绩看板",
      alphaBot: "智能助手",
      invites: "邀请管理",
      logout: "登出系统",
      theme: "主题模式",
      language: "语言切换",
      sessionRole: "当前角色",
      admin: "管理员权限",
      member: "成员终端",
      tier: "会员等级"
    },
    tiers: {
      standard: "基础版",
      vip: "VIP专业版",
      premium: "精英版",
      all: "所有等级"
    },
    feed: {
      title: "市场情报",
      description: "来自 AlphaLink 机构交易台的实时研究笔记。",
      searchPlaceholder: "搜索代码、策略或笔记...",
      allAssets: "所有资产",
      stocks: "股票",
      options: "期权",
      noIdeas: "暂无活跃交易思路。",
      standBy: "等待交易台实时更新中",
      footer: "行情数据延迟15分钟 • AlphaLink 研究台"
    },
    performance: {
      title: "Alpha 业绩表现",
      description: "经核实的交易结果和社区获利亮点。",
      addWin: "新增获利亮点",
      publishWin: "发布业绩战报",
      ticker: "股票代码",
      return: "盈利率 % (例如 45)",
      strategy: "标题 / 策略名称",
      date: "日期",
      desc: "详情描述...",
      publishBtn: "发布到荣誉墙",
      noHighlights: "暂无已记录的业绩亮点。",
      verified: "交易台已核实",
      returnLabel: "收益率"
    },
    invites: {
      title: "权限管理",
      description: "为私有成员生成不同等级的访问邀请码。",
      label: "分组 / 名称",
      labelPlaceholder: "例如：VIP群组、推特推广",
      generateBtn: "生成新邀请码",
      tableCode: "访问码",
      tableLabel: "标签 / 类别",
      tableStatus: "状态",
      tableTier: "等级",
      tableCreated: "创建时间",
      tableActions: "操作",
      newlyGenerated: "新生成的访问码",
      copyBtn: "复制号码",
      active: "活跃",
      disabled: "已禁用",
      disableAction: "禁用权限",
      enableAction: "重新启用",
      editLabel: "编辑标签",
      deleteInvite: "删除邀请码",
      confirmDelete: "确定要永久删除此邀请码吗？",
      saveChanges: "保存更改",
      selectTier: "选择等级"
    },
    assistant: {
      title: "AlphaBot AI",
      description: "研究助理与市场情报引擎",
      welcome: "你好，我是 AlphaBot。今天有什么我可以协助你的市场研究或技术分析吗？我擅长股票和期权的场景分析。",
      placeholder: "询问关于 SPY 分析、垂直价差或风险管理...",
      analyzing: "正在分析市场数据...",
      disclaimer: "仅供教育目的 • 绝非财务建议 • Gemini AI 核心"
    },
    common: {
      loading: "加载中...",
      error: "错误",
      success: "成功",
      cancel: "取消",
      save: "保存",
      delete: "删除"
    }
  }
};
