import Button from "../Button/Button";
function MeetingCard({
  title,
  date,
  time,
  host,
  status = "Upcoming",
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Hosted by {host}
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
          {status}
        </span>
      </div>

      <div className="mt-5 space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-900">
            Date:
          </span>{" "}
          {date}
        </p>

        <p>
          <span className="font-medium text-gray-900">
            Time:
          </span>{" "}
          {time}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Button>
                Join
            </Button>

            <Button variant="secondary">
                 Details
            </Button>

            <Button variant="outline">
                Edit
            </Button>
      </div>
    </div>
  );
}

export default MeetingCard;