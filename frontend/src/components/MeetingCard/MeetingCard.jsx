import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
function MeetingCard({
    
  title,
  date,
  time,
  host,
  participants,
  status = "Upcoming",
  onDelete,
  onEdit,
}) {
    const navigate = useNavigate();
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Hosted by {host}
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
          {status}
        </span>
      </div>

      {/* Information */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            Date
          </p>

          <p className="mt-1 font-medium text-gray-800">
            {date}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            Time
          </p>

          <p className="mt-1 font-medium text-gray-800">
            {time}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            Participants
          </p>

          <p className="mt-1 font-medium text-gray-800">
            {participants}
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">

        <Button
            onClick={() => navigate("/join-meeting")}
            >
            Join Meeting
        </Button>

        <Button
          variant="secondary"
          onClick={onEdit}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          onClick={onDelete}
        >
          Delete
        </Button>

      </div>
    </div>
  );
}

export default MeetingCard;