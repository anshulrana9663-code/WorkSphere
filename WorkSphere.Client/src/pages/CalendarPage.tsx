import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { CalendarIcon } from '../components/common/Icons';

export default function CalendarPage() {
  return (
    <PagePlaceholder
      title="Calendar"
      category="Workspace"
      description="Keep track of upcoming deadlines, project milestones, company holidays, and personal schedules."
      icon={CalendarIcon}
    />
  );
}

