import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { ReportsIcon } from '../components/common/Icons';

export default function ReportsPage() {
  return (
    <PagePlaceholder
      title="Reports"
      category="Management"
      description="Access operational reports, productivity summaries, time logs, and management exports."
      icon={ReportsIcon}
    />
  );
}

