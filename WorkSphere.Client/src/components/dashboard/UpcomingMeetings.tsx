import { MeetingsIcon, CalendarIcon } from '../common/Icons';

export interface MeetingItem {
  id: string;
  title: string;
  time: string;
  location: string;
  isUrgent?: boolean;
  statusBadge?: string;
  attendees: { name: string; initials: string; bg: string }[];
}

const SAMPLE_MEETINGS: MeetingItem[] = [
  {
    id: 'm1',
    title: 'Sprint Backlog & Planning Sync',
    time: '10:30 AM - 11:15 AM',
    location: 'Google Meet',
    isUrgent: true,
    statusBadge: 'In 25 mins',
    attendees: [
      { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
      { name: 'David Kim', initials: 'DK', bg: 'bg-emerald-500' },
      { name: 'Alex Morgan', initials: 'AM', bg: 'bg-violet-500' },
    ],
  },
  {
    id: 'm2',
    title: 'WorkSphere Layout Review & QA',
    time: '02:00 PM - 02:45 PM',
    location: 'Room 302 - Atlas',
    statusBadge: 'Today',
    attendees: [
      { name: 'Elena Rostova', initials: 'ER', bg: 'bg-rose-500' },
      { name: 'Marcus Chen', initials: 'MC', bg: 'bg-amber-500' },
    ],
  },
  {
    id: 'm3',
    title: 'Executive Product Roadmap',
    time: '04:30 PM - 05:30 PM',
    location: 'Conference Hall A',
    statusBadge: 'Today',
    attendees: [
      { name: 'Rachel Green', initials: 'RG', bg: 'bg-sky-500' },
      { name: 'Alex Morgan', initials: 'AM', bg: 'bg-violet-500' },
      { name: 'Tom Hardy', initials: 'TH', bg: 'bg-teal-500' },
    ],
  },
];

export function UpcomingMeetings() {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <MeetingsIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upcoming Meetings
              </h2>
              <p className="text-xs text-slate-500">
                Today&apos;s scheduled syncs & calls
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {SAMPLE_MEETINGS.length} Scheduled
          </span>
        </div>

        {/* Meeting List */}
        <div className="space-y-3">
          {SAMPLE_MEETINGS.map((meeting) => (
            <div
              key={meeting.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 truncate">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={13} className="text-slate-400" />
                      {meeting.time}
                    </span>
                    <span>&bull;</span>
                    <span className="truncate">{meeting.location}</span>
                  </div>
                </div>

                {meeting.statusBadge && (
                  <span
                    className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      meeting.isUrgent
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {meeting.statusBadge}
                  </span>
                )}
              </div>

              {/* Attendees & Join CTA */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {meeting.attendees.map((attendee) => (
                    <div
                      key={attendee.name}
                      title={attendee.name}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white ${attendee.bg}`}
                    >
                      {attendee.initials}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Join Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4 text-center">
        <button
          type="button"
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          View Full Calendar &rarr;
        </button>
      </div>
    </div>
  );
}

