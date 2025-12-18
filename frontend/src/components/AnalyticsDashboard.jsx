export default function AnalyticsDashboard({ summary }) {
  if (!summary) return null;

  return (
    <div className="analytics-dashboard">
      <HottestMain data={summary.hottest_main} />
      <HottestBonus data={summary.hottest_bonus} />
      <OverdueMain data={summary.overdue_main} />
      <OverdueBonus data={summary.overdue_bonus} />
      <RecentDraws data={summary.recent_draws} />
    </div>
  );
}