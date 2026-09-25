import type { Role, TeamMember } from '../engine/types';
import { ROLE_META } from '../engine/types';

export default function RoleTabs({
  members,
  active,
  onChange,
}: {
  members: TeamMember[];
  active: Role;
  onChange: (r: Role) => void;
}) {
  const roles = members.length > 0 ? members.map((m) => m.role) : (Object.keys(ROLE_META) as Role[]);

  return (
    <div className="role-tabs">
      {roles.map((role) => {
        const meta = ROLE_META[role];
        const member = members.find((m) => m.role === role);
        return (
          <button
            key={role}
            className={`role-tab ${active === role ? 'active' : ''}`}
            onClick={() => onChange(role)}
          >
            <span style={{ fontSize: 18 }}>{meta.icon}</span>
            <span>{meta.nameKo}</span>
            {member && <span style={{ opacity: 0.6, fontSize: 10 }}>{member.name}</span>}
          </button>
        );
      })}
    </div>
  );
}
