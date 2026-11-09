import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { TeamsIcon } from '../components/common/Icons';

export default function TeamsPage() {
  return (
    <PagePlaceholder
      title="Teams"
      category="Workspace"
      description="View company departments, team members, collaboration channels, and organizational groups."
      icon={TeamsIcon}
    />
  );
}

