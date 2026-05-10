import React from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../utils/routes';

// 核心功能数据
const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
    title: '活动全流程管理',
    description: '覆盖活动策划、执行、复盘全生命周期，支持卡片与日历双视图，让活动管理更高效。',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: '预算精细管控',
    description: '年度预算配额管理，实时追踪执行进度，智能预警超支风险，优化营销ROI。',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: '物料仓库管理',
    description: '统一管理活动物料库存，支持入库、领用、盘点全流程，确保物资充足不浪费。',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: '供应商协同',
    description: '建立供应商档案库，记录合作历史与评价，筛选优质合作伙伴，降低合作风险。',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
      </svg>
    ),
    title: '商机转化追踪',
    description: '记录客户意向与商机来源，追踪转化进度，关联活动效果，量化活动价值。',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    title: 'AI智能复盘',
    description: '多维度评价活动效果，AI自动生成复盘总结，持续优化活动策略。',
  },
];

// 数据指标
const STATS = [
  { value: '7+', label: '核心模块' },
  { value: '159', label: '后端测试用例' },
  { value: '700+', label: '前端测试用例' },
  { value: '100%', label: '功能覆盖率' },
];

// 技术栈
const TECH_STACK = [
  { name: 'React 18', desc: '前端框架' },
  { name: 'TypeScript', desc: '类型安全' },
  { name: 'Vite', desc: '快速构建' },
  { name: 'Tailwind CSS', desc: '原子化样式' },
  { name: 'FastAPI', desc: '高性能后端' },
  { name: 'SQLAlchemy', desc: 'ORM框架' },
  { name: 'SQLite', desc: '轻量数据库' },
  { name: 'Gemini AI', desc: '智能分析' },
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              E
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">EventMaster Pro</span>
          </div>
          <Link
            to={AppRoutes.LOGIN}
            className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            立即体验
          </Link>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              全生命周期活动管理平台
            </div>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              让活动管理
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> 更高效、更智能</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10">
              一站式活动全生命周期管理平台，覆盖活动策划、执行、复盘全流程，
              同时整合预算管理、物料管理、供应商管理和商机转化等核心业务模块。
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to={AppRoutes.LOGIN}
                className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                开始使用
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200"
              >
                了解更多
              </a>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-4 gap-6 mt-20">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">核心功能</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              专为活动管理场景打造，覆盖活动全生命周期的每一个环节
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 模块展示 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">七大核心模块</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              从数据仪表盘到复盘中心，覆盖活动管理的全场景需求
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { name: '数据仪表盘', desc: '年度总览、趋势分析、ROI洞察', icon: '📊', color: 'from-indigo-500 to-indigo-600' },
              { name: '活动管理', desc: '卡片/日历双视图、全流程跟踪', icon: '📅', color: 'from-purple-500 to-purple-600' },
              { name: '物料仓库', desc: '入库/领用/盘点全流程管理', icon: '📦', color: 'from-emerald-500 to-emerald-600' },
              { name: '预算仓库', desc: '年度配额、实时预警、ROI分析', icon: '💰', color: 'from-amber-500 to-amber-600' },
              { name: '供应商库', desc: '档案管理、合作评价、账单记录', icon: '🤝', color: 'from-blue-500 to-blue-600' },
              { name: '商机转化', desc: '意向追踪、转化分析、关联活动', icon: '📈', color: 'from-rose-500 to-rose-600' },
              { name: '复盘中心', desc: '多维评价、AI总结、持续优化', icon: '✅', color: 'from-cyan-500 to-cyan-600' },
            ].map((module, index) => (
              <div
                key={index}
                className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                  {module.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{module.name}</h3>
                  <p className="text-sm text-slate-500">{module.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技术栈 */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">技术栈</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              采用业界领先的技术方案，确保系统稳定、安全、高性能
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {TECH_STACK.map((tech, index) => (
              <div
                key={index}
                className="text-center p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-lg font-bold text-white mb-1">{tech.name}</div>
                <div className="text-sm text-slate-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            立即体验 EventMaster Pro，让活动管理更高效
          </p>
          <Link
            to={AppRoutes.LOGIN}
            className="inline-block px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/30"
          >
            登录系统
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
            <span className="text-sm font-semibold text-slate-700">EventMaster Pro</span>
          </div>
          <p className="text-sm text-slate-500">全生命周期活动管理平台 · Built with React & FastAPI</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
