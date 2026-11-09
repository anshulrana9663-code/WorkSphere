import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { MeetingsIcon } from '../components/common/Icons';

export default function MeetingsPage() {
  return (
    <PagePlaceholder
      title="Meetings"
      category="Workspace"
      description="Schedule video syncs, coordinate agenda rooms, review action items, and join ongoing conference calls."
      icon={MeetingsIcon}
    />
  );
}

