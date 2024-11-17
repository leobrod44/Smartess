interface TicketWidgetProps {
  count: number;
  label: string;
  backgroundColor: string;
}

const TicketWidget: React.FC<TicketWidgetProps> = ({
  count,
  label,
  backgroundColor,
}) => {
  return (
    <div
      className={`${backgroundColor} text-white rounded-lg p-6 text-center w-full min-h-[120px] flex flex-col justify-center`}
    >
      <p className="text-2xl font-semibold">{count}</p>
      <p>{label}</p>
    </div>
  );
};

export default TicketWidget;
