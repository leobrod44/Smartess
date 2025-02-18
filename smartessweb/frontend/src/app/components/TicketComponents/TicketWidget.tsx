interface TicketWidgetProps {
  count: number;
  label: string;
  backgroundColor: string;
  onClick?: () => void;
}

const TicketWidget: React.FC<TicketWidgetProps> = ({
  count,
  label,
  backgroundColor,
  onClick,
}) => {
  return (
    <div
      className={`${backgroundColor} text-white rounded-lg p-6 text-center w-full min-h-[120px] flex flex-col justify-center cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg`}
      onClick={onClick}
    >
      <p className="text-2xl font-semibold">{count}</p>
      <p>{label}</p>
    </div>
  );
};

export default TicketWidget;
