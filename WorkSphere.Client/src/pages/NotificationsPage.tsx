import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { BellIcon } from '../components/common/Icons';

export default function NotificationsPage() {
  return (
    <PagePlaceholder
      title="Notifications"
      category="Management"
      description="Review system alerts, team mentions, assignment updates, and administrative notices."
      icon={BellIcon}
    />
  );
}

